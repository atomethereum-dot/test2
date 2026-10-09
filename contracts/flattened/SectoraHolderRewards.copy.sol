// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 value) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IERC165 {

    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC1363 is IERC20, IERC165 {

    function transferAndCall(address to, uint256 value) external returns (bool);

    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    function approveAndCall(address spender, uint256 value) external returns (bool);

    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}

library SafeERC20 {

    error SafeERC20FailedOperation(address token);

    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        if (!_safeTransfer(token, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        if (!_safeTransferFrom(token, from, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _safeTransfer(token, to, value, false);
    }

    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _safeTransferFrom(token, from, to, value, false);
    }

    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        if (!_safeApprove(token, spender, value, false)) {
            if (!_safeApprove(token, spender, 0, true)) revert SafeERC20FailedOperation(address(token));
            if (!_safeApprove(token, spender, value, true)) revert SafeERC20FailedOperation(address(token));
        }
    }

    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    function _safeTransfer(IERC20 token, address to, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.transfer.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(to, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)

            if iszero(and(success, eq(mload(0x00), 1))) {

                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }

                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }

    function _safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value,
        bool bubble
    ) private returns (bool success) {
        bytes4 selector = IERC20.transferFrom.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(from, shr(96, not(0))))
            mstore(0x24, and(to, shr(96, not(0))))
            mstore(0x44, value)
            success := call(gas(), token, 0, 0x00, 0x64, 0x00, 0x20)

            if iszero(and(success, eq(mload(0x00), 1))) {

                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }

                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
            mstore(0x60, 0)
        }
    }

    function _safeApprove(IERC20 token, address spender, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.approve.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(spender, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)

            if iszero(and(success, eq(mload(0x00), 1))) {

                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }

                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    error OwnableUnauthorizedAccount(address account);

    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

abstract contract Ownable2Step is Ownable {
    address private _pendingOwner;

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    function transferOwnership(address newOwner) public virtual override onlyOwner {
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner(), newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual override {
        delete _pendingOwner;
        super._transferOwnership(newOwner);
    }

    function acceptOwnership() public virtual {
        address sender = _msgSender();
        if (pendingOwner() != sender) {
            revert OwnableUnauthorizedAccount(sender);
        }
        _transferOwnership(sender);
    }
}

library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct BooleanSlot {
        bool value;
    }

    struct Bytes32Slot {
        bytes32 value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    struct Int256Slot {
        int256 value;
    }

    struct StringSlot {
        string value;
    }

    struct BytesSlot {
        bytes value;
    }

    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    function getInt256Slot(bytes32 slot) internal pure returns (Int256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }

    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }
}

abstract contract ReentrancyGuard {
    using StorageSlot for bytes32;

    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    error ReentrancyGuardReentrantCall();

    constructor() {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    modifier nonReentrantView() {
        _nonReentrantBeforeView();
        _;
    }

    function _nonReentrantBeforeView() private view {
        if (_reentrancyGuardEntered()) {
            revert ReentrancyGuardReentrantCall();
        }
    }

    function _nonReentrantBefore() private {

        _nonReentrantBeforeView();

        _reentrancyGuardStorageSlot().getUint256Slot().value = ENTERED;
    }

    function _nonReentrantAfter() private {

        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().getUint256Slot().value == ENTERED;
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
}

contract SectoraHolderRewards is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BPS = 10_000;
    uint256 public constant YEAR = 365 days;

    uint256 public constant MAX_RATE_BPS = 1e12;

    IERC20 public immutable token;

    uint256 public totalDeposited;

    uint256 public rewardPool;

    uint256 public totalUnclaimed;

    uint256 public depositorCount;

    uint256 public accRewardPerToken;
    uint256 public lastUpdate;

    uint256 public rateBps = 1_490;

    bool public accrualPaused;

    bool public depositsPaused = true;

    struct Account {
        uint256 amount;
        uint256 accPaid;
        uint256 earned;
    }

    mapping(address => Account) public accounts;

    event Deposited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event RewardClaimed(address indexed account, uint256 amount);
    event RewardsFunded(address indexed from, uint256 amount, uint256 poolAfter);
    event RewardsWithdrawn(address indexed to, uint256 amount, uint256 poolAfter);
    event AccrualPaused(uint256 atTimestamp);
    event AccrualResumed(uint256 atTimestamp, uint256 poolRemaining);
    event DepositsPausedChanged(bool paused);
    event RateChanged(uint256 oldRateBps, uint256 newRateBps);
    event SurplusRecovered(address indexed to, uint256 amount);
    event TokenRescued(address indexed otherToken, address indexed to, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Rewards: token is zero");
        token = IERC20(_token);
        lastUpdate = block.timestamp;
    }

    function _pendingGlobal() internal view returns (uint256) {
        if (totalDeposited == 0 || accrualPaused) return 0;
        uint256 elapsed = block.timestamp - lastUpdate;
        return (totalDeposited * rateBps * elapsed) / (BPS * YEAR);
    }

    function _update() internal {
        uint256 owed = _pendingGlobal();
        if (owed > 0) {
            if (owed > rewardPool) {
                owed = rewardPool;
                accrualPaused = true;
                emit AccrualPaused(block.timestamp);
            }
            if (owed > 0) {
                rewardPool -= owed;
                totalUnclaimed += owed;
                accRewardPerToken += (owed * 1e18) / totalDeposited;
            }
        }
        lastUpdate = block.timestamp;
    }

    function _settle(address who) internal {
        Account storage a = accounts[who];
        if (a.amount > 0) {
            a.earned += (a.amount * (accRewardPerToken - a.accPaid)) / 1e18;
        }
        a.accPaid = accRewardPerToken;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(!depositsPaused, "Rewards: deposits paused");
        require(amount > 0, "Rewards: amount is zero");

        _update();
        _settle(msg.sender);

        uint256 before = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = token.balanceOf(address(this)) - before;
        require(received > 0, "Rewards: nothing received");

        Account storage a = accounts[msg.sender];
        if (a.amount == 0) depositorCount += 1;
        a.amount += received;
        totalDeposited += received;
        emit Deposited(msg.sender, received);
    }

    function withdraw(uint256 amount) external nonReentrant {
        Account storage a = accounts[msg.sender];
        require(amount > 0, "Rewards: amount is zero");
        require(a.amount >= amount, "Rewards: amount above deposit");

        _update();
        _settle(msg.sender);

        a.amount -= amount;
        if (a.amount == 0) depositorCount -= 1;
        totalDeposited -= amount;

        token.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claim() external nonReentrant {
        _update();
        _settle(msg.sender);

        Account storage a = accounts[msg.sender];
        uint256 amount = a.earned;
        require(amount > 0, "Rewards: nothing to claim");
        a.earned = 0;
        totalUnclaimed -= amount;

        token.safeTransfer(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }

    function fundRewards(uint256 amount) external nonReentrant {
        require(amount > 0, "Rewards: amount is zero");
        _update();

        uint256 before = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = token.balanceOf(address(this)) - before;

        rewardPool += received;
        if (accrualPaused) {
            accrualPaused = false;
            lastUpdate = block.timestamp;
            emit AccrualResumed(block.timestamp, rewardPool);
        }
        emit RewardsFunded(msg.sender, received, rewardPool);
    }

    function withdrawRewards(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0) && to != address(this), "Rewards: bad recipient");
        _update();
        require(amount > 0 && amount <= rewardPool, "Rewards: amount above pool");
        rewardPool -= amount;
        token.safeTransfer(to, amount);
        emit RewardsWithdrawn(to, amount, rewardPool);
    }

    function withdrawAllRewards(address to) external onlyOwner nonReentrant {
        require(to != address(0) && to != address(this), "Rewards: bad recipient");
        _update();
        uint256 amount = rewardPool;
        require(amount > 0, "Rewards: pool empty");
        rewardPool = 0;
        token.safeTransfer(to, amount);
        emit RewardsWithdrawn(to, amount, 0);
    }

    function recoverSurplus(address to) external onlyOwner nonReentrant {
        require(to != address(0) && to != address(this), "Rewards: bad recipient");
        _update();
        uint256 owedOut = totalDeposited + rewardPool + totalUnclaimed;
        uint256 bal = token.balanceOf(address(this));
        require(bal > owedOut, "Rewards: no surplus");
        uint256 amount = bal - owedOut;
        token.safeTransfer(to, amount);
        emit SurplusRecovered(to, amount);
    }

    function rescueToken(address otherToken, address to, uint256 amount) external onlyOwner nonReentrant {
        require(otherToken != address(token), "Rewards: not for the staking token");
        require(to != address(0), "Rewards: bad recipient");
        IERC20(otherToken).safeTransfer(to, amount);
        emit TokenRescued(otherToken, to, amount);
    }

    function renounceOwnership() public view override onlyOwner {
        revert("Rewards: renounce disabled");
    }

    function setDepositsPaused(bool paused) external onlyOwner {
        depositsPaused = paused;
        emit DepositsPausedChanged(paused);
    }

    function setRate(uint256 newRateBps) external onlyOwner {
        require(newRateBps <= MAX_RATE_BPS, "Rewards: rate above max");
        _update();
        uint256 old = rateBps;
        rateBps = newRateBps;
        emit RateChanged(old, newRateBps);
    }

    function earned(address who) public view returns (uint256) {
        Account storage a = accounts[who];
        if (a.amount == 0) return a.earned;
        uint256 acc = accRewardPerToken;
        uint256 owed = _pendingGlobal();
        if (owed > rewardPool) owed = rewardPool;
        if (owed > 0 && totalDeposited > 0) acc += (owed * 1e18) / totalDeposited;
        return a.earned + (a.amount * (acc - a.accPaid)) / 1e18;
    }

    function accountView(address who)
        external
        view
        returns (uint256 deposited, uint256 claimable, uint256 walletBalance, uint256 allowance)
    {
        deposited = accounts[who].amount;
        claimable = earned(who);
        walletBalance = token.balanceOf(who);
        allowance = token.allowance(who, address(this));
    }

    function poolView()
        external
        view
        returns (
            uint256 deposited,
            uint256 pool,
            uint256 rate,
            bool paused,
            bool depositsClosed,
            uint256 depositors,
            uint256 chainTime
        )
    {

        (uint256 effPool, bool effPaused) = _effectivePool();
        return (
            totalDeposited,
            effPool,
            rateBps,
            effPaused,
            depositsPaused,
            depositorCount,
            block.timestamp
        );
    }

    function _effectivePool() internal view returns (uint256 effPool, bool effPaused) {
        uint256 owed = _pendingGlobal();
        if (owed >= rewardPool) {
            return (0, accrualPaused || owed > 0);
        }
        return (rewardPool - owed, accrualPaused);
    }

    function runwaySeconds() external view returns (uint256) {
        if (totalDeposited == 0 || rateBps == 0) return type(uint256).max;
        (uint256 effPool, bool effPaused) = _effectivePool();
        if (effPaused || effPool == 0) return 0;
        return (effPool * BPS * YEAR) / (totalDeposited * rateBps);
    }
}
