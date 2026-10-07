// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IBurnableToken {
    function burn(uint256 amount) external;
}

/// @title Sectora Hash Market (testnet)
/// @notice On-chain purchase of test hash power, paid in tSECT, with the
/// same revenue rule the protocol will use on mainnet:
///   - 80% of every purchase is a simulated buyback: those tSECT are
///     burned on the spot, so the supply really shrinks.
///   - 20% stays in this contract as the reward reserve.
/// Every buyer earns a fixed 25% APY on the tSECT they have spent on hash,
/// accrued every second and claimable at any time. The owner can top the
/// reserve up (fundRewards, or mint straight to this contract) so testers
/// never hit an empty pool. Testnet only: tSECT has no monetary value.
contract SectoraHashMarket is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum PackageKind {
        Online,
        Physical
    }

    struct Package {
        string name;
        PackageKind kind;
        uint256 priceInToken; // tSECT, 18 decimals
        uint256 hashPower; // TH/s granted per purchase
        bool active;
    }

    uint256 public constant BPS = 10_000;
    uint256 public constant BUYBACK_BPS = 8_000; // 80% burned as buyback
    uint256 public constant APY_BPS = 2_500; // 25% APY on tSECT spent
    uint256 public constant YEAR = 365 days;

    IERC20 public immutable paymentToken;

    Package[] public packages;

    mapping(address => uint256) public hashPower;
    mapping(address => uint256) public purchaseCount;
    mapping(address => uint256) public principal; // tSECT spent on hash
    mapping(address => uint256) public accrued; // rewards stored at lastAccrual
    mapping(address => uint256) public lastAccrual;
    mapping(address => uint256) public claimed;

    uint256 public totalHashSold;
    uint256 public totalBoughtBack;
    uint256 public totalPrincipal;
    uint256 public totalRewardsClaimed;
    uint256 public buyerCount;

    event PackageAdded(uint256 indexed packageId, string name, PackageKind kind, uint256 priceInToken, uint256 hashPower);
    event PackageStatusChanged(uint256 indexed packageId, bool active);
    event HashPurchased(address indexed buyer, uint256 indexed packageId, uint256 hashPowerAdded, uint256 pricePaid);
    event BuybackBurned(uint256 amount);
    event RewardsClaimed(address indexed account, uint256 amount);
    event RewardsFunded(address indexed from, uint256 amount);

    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);

        // Same packages the dashboard shows. Online hash: rented compute.
        _addPackage("Starter", PackageKind.Online, 490 ether, 5);
        _addPackage("Standard", PackageKind.Online, 2200 ether, 25);
        _addPackage("Pro", PackageKind.Online, 8200 ether, 100);

        // Physical validator hardware: best price per TH/s.
        _addPackage("Node Kit", PackageKind.Physical, 4300 ether, 50);
        _addPackage("Node Kit XL", PackageKind.Physical, 19500 ether, 250);
    }

    // ---------------------------------------------------------------- views

    function packageCount() external view returns (uint256) {
        return packages.length;
    }

    /// @notice Rewards earned and not yet claimed, up to this second.
    function pendingRewards(address account) public view returns (uint256) {
        uint256 p = principal[account];
        if (p == 0) return accrued[account];
        uint256 elapsed = block.timestamp - lastAccrual[account];
        return accrued[account] + (p * APY_BPS * elapsed) / (BPS * YEAR);
    }

    /// @notice tSECT the account earns per day at the current principal.
    function rewardsPerDay(address account) external view returns (uint256) {
        return (principal[account] * APY_BPS * 1 days) / (BPS * YEAR);
    }

    /// @notice tSECT available to pay rewards.
    function rewardReserve() public view returns (uint256) {
        return paymentToken.balanceOf(address(this));
    }

    function getAccount(address account)
        external
        view
        returns (uint256 hash, uint256 spent, uint256 pending, uint256 claimedTotal, uint256 purchases)
    {
        return (hashPower[account], principal[account], pendingRewards(account), claimed[account], purchaseCount[account]);
    }

    function getStats()
        external
        view
        returns (
            uint256 hashSold,
            uint256 boughtBack,
            uint256 spent,
            uint256 rewardsClaimed,
            uint256 buyers,
            uint256 reserve
        )
    {
        return (totalHashSold, totalBoughtBack, totalPrincipal, totalRewardsClaimed, buyerCount, rewardReserve());
    }

    // -------------------------------------------------------------- actions

    function purchase(uint256 packageId) external nonReentrant {
        require(packageId < packages.length, "SectoraHashMarket: bad package id");
        Package storage pkg = packages[packageId];
        require(pkg.active, "SectoraHashMarket: package inactive");

        _accrue(msg.sender);
        if (purchaseCount[msg.sender] == 0) buyerCount += 1;

        uint256 price = pkg.priceInToken;
        paymentToken.safeTransferFrom(msg.sender, address(this), price);

        uint256 buyback = (price * BUYBACK_BPS) / BPS;
        IBurnableToken(address(paymentToken)).burn(buyback);
        totalBoughtBack += buyback;
        emit BuybackBurned(buyback);

        hashPower[msg.sender] += pkg.hashPower;
        purchaseCount[msg.sender] += 1;
        principal[msg.sender] += price;
        totalPrincipal += price;
        totalHashSold += pkg.hashPower;

        emit HashPurchased(msg.sender, packageId, pkg.hashPower, price);
    }

    function claim() external nonReentrant {
        _accrue(msg.sender);
        uint256 amount = accrued[msg.sender];
        require(amount > 0, "SectoraHashMarket: nothing to claim");
        require(rewardReserve() >= amount, "SectoraHashMarket: reward reserve empty");

        accrued[msg.sender] = 0;
        claimed[msg.sender] += amount;
        totalRewardsClaimed += amount;
        paymentToken.safeTransfer(msg.sender, amount);

        emit RewardsClaimed(msg.sender, amount);
    }

    /// @notice Anyone can top up the reward reserve.
    function fundRewards(uint256 amount) external {
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardsFunded(msg.sender, amount);
    }

    // ---------------------------------------------------------------- admin

    function addPackage(string calldata name, PackageKind kind, uint256 price, uint256 power) external onlyOwner {
        _addPackage(name, kind, price, power);
    }

    function setPackageActive(uint256 packageId, bool active) external onlyOwner {
        require(packageId < packages.length, "SectoraHashMarket: bad package id");
        packages[packageId].active = active;
        emit PackageStatusChanged(packageId, active);
    }

    // ------------------------------------------------------------- internal

    function _accrue(address account) internal {
        accrued[account] = pendingRewards(account);
        lastAccrual[account] = block.timestamp;
    }

    function _addPackage(string memory name, PackageKind kind, uint256 price, uint256 power) internal {
        packages.push(Package(name, kind, price, power, true));
        emit PackageAdded(packages.length - 1, name, kind, price, power);
    }
}
