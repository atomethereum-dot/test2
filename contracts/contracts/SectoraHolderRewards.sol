// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Sectora Holder Rewards
/// @notice #SECT holders deposit #SECT and earn rewards, 14.9% APY at
/// launch, paid by the Sectora Foundation treasury.
///
/// THE RULES
///
///  1. 14.9% APY AT LAUNCH. Rewards accrue every second at the current
///     rate (rateBps) on the deposit, linear, no compounding. The owner can
///     change the rate with setRate(), up to MAX_RATE_BPS. A change only
///     applies from that second on: everything accrued before it was booked
///     at the old rate and is never recalculated.
///  2. NO LOCK. withdraw() always works, immediately, in full or in part,
///     whatever state the reward pool is in.
///  3. CLAIM ANY TIME. Accrued rewards are the depositor's to collect
///     whenever they want, also after withdrawing.
///  4. A HARD CAP. At most 10,000,000 #SECT can be deposited at once, so the
///     treasury's cost is bounded in code: cap x rate, 1,490,000 #SECT a
///     year at the cap and the launch rate. Whatever the rate, payouts
///     never exceed what was funded into the pool.
///
/// ON MAINNET THIS HOLDS REAL VALUE.
///
///  - Rewards are NEVER minted. #SECT is renounced and has no mint
///    function. Every token paid out was transferred in beforehand via
///    fundRewards().
///  - Accrual moves tokens out of rewardPool as it happens, so a reward
///    already earned by a depositor is outside the owner's reach. The owner
///    can only take back the part of the pool nobody has earned yet.
///  - The rate is a target, not a debt. If the pool empties, accrual stops
///    at the last funded second rather than promising what cannot be paid,
///    and resumes when the pool is refilled.
///
/// Deposit token and reward token are the same ERC-20, so the contract's
/// balance holds deposits, the reward pool and rewards earned but not yet
/// claimed. They are tracked separately and every payout is checked
/// against its own bucket: one holder's deposit can never leave as another
/// holder's reward.
contract SectoraHolderRewards is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BPS = 10_000;
    uint256 public constant YEAR = 365 days;

    /// @notice Ceiling for setRate(): 10000 bps = 100% a year. It bounds a
    /// fat-fingered or compromised owner key; the pool bounds it anyway.
    uint256 public constant MAX_RATE_BPS = 10_000;

    /// @notice Most #SECT the program can hold in deposits at once.
    uint256 public constant MAX_TOTAL_DEPOSITED = 10_000_000 ether;

    IERC20 public immutable token;

    /// @notice Sum of every holder's deposit. Never includes rewards.
    uint256 public totalDeposited;

    /// @notice Tokens available to pay future rewards. Never includes
    /// deposits, and never includes a reward already earned by a holder.
    uint256 public rewardPool;

    /// @notice Accounts with a non-zero deposit right now.
    uint256 public depositorCount;

    /// @dev Accumulated reward per deposited token, scaled by 1e18.
    uint256 public accRewardPerToken;
    uint256 public lastUpdate;

    /// @notice Current reward rate in basis points: 1490 = 14.90% a year.
    uint256 public rateBps = 1_490;

    /// @dev Set once the pool cannot cover accrual any more.
    bool public accrualPaused;

    /// @notice Stops NEW deposits. Starts true so nobody can deposit before
    /// the pool is funded; the owner opens deposits after funding.
    /// Withdrawing and claiming are never affected, so it can never be used
    /// to lock anyone in.
    bool public depositsPaused = true;

    struct Account {
        uint256 amount; // deposit
        uint256 rewardDebt; // accumulator checkpoint, scaled by 1e18
        uint256 earned; // rewards accrued and not yet claimed
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

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Rewards: token is zero");
        token = IERC20(_token);
        lastUpdate = block.timestamp;
    }

    // ---------------------------------------------------------------
    // accrual
    // ---------------------------------------------------------------

    function _pendingGlobal() internal view returns (uint256) {
        if (totalDeposited == 0 || accrualPaused) return 0;
        uint256 elapsed = block.timestamp - lastUpdate;
        return (totalDeposited * rateBps * elapsed) / (BPS * YEAR);
    }

    /// @dev Moves the accumulator forward. If the pool cannot cover the
    /// full window it pays what is left, pauses accrual and stops, rather
    /// than booking a debt the contract has no tokens for.
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
                accRewardPerToken += (owed * 1e18) / totalDeposited;
            }
        }
        lastUpdate = block.timestamp;
    }

    /// @dev Books an account's share of the accumulator into `earned`.
    function _settle(address who) internal {
        Account storage a = accounts[who];
        if (a.amount > 0) {
            a.earned += ((a.amount * accRewardPerToken) / 1e18) - a.rewardDebt;
        }
        a.rewardDebt = (a.amount * accRewardPerToken) / 1e18;
    }

    // ---------------------------------------------------------------
    // holders
    // ---------------------------------------------------------------

    function deposit(uint256 amount) external nonReentrant {
        require(!depositsPaused, "Rewards: deposits paused");
        require(amount > 0, "Rewards: amount is zero");
        require(totalDeposited + amount <= MAX_TOTAL_DEPOSITED, "Rewards: program full");

        _update();
        _settle(msg.sender);

        // measured, not assumed: a fee-on-transfer token would credit more
        // than actually arrived and leave the last withdrawer unable to exit
        uint256 before = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = token.balanceOf(address(this)) - before;
        require(received > 0, "Rewards: nothing received");

        Account storage a = accounts[msg.sender];
        if (a.amount == 0) depositorCount += 1;
        a.amount += received;
        totalDeposited += received;
        a.rewardDebt = (a.amount * accRewardPerToken) / 1e18;
        emit Deposited(msg.sender, received);
    }

    /// @notice Take out part or all of the deposit. No lock, no penalty:
    /// rewards earned so far stay claimable.
    function withdraw(uint256 amount) external nonReentrant {
        Account storage a = accounts[msg.sender];
        require(amount > 0, "Rewards: amount is zero");
        require(a.amount >= amount, "Rewards: amount above deposit");

        _update();
        _settle(msg.sender);

        a.amount -= amount;
        if (a.amount == 0) depositorCount -= 1;
        totalDeposited -= amount;
        a.rewardDebt = (a.amount * accRewardPerToken) / 1e18;

        token.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Collect every reward earned so far.
    function claim() external nonReentrant {
        _update();
        _settle(msg.sender);

        Account storage a = accounts[msg.sender];
        uint256 amount = a.earned;
        require(amount > 0, "Rewards: nothing to claim");
        a.earned = 0;

        // the tokens left rewardPool during _update, so this transfer can
        // never reach into anyone's deposit
        token.safeTransfer(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }

    // ---------------------------------------------------------------
    // reward pool
    // ---------------------------------------------------------------

    /// @notice Fund the reward pool. Open to anyone.
    function fundRewards(uint256 amount) external nonReentrant {
        require(amount > 0, "Rewards: amount is zero");
        _update();

        uint256 before = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = token.balanceOf(address(this)) - before;

        rewardPool += received;
        if (accrualPaused) {
            accrualPaused = false;
            lastUpdate = block.timestamp; // the gap does not accrue retroactively
            emit AccrualResumed(block.timestamp, rewardPool);
        }
        emit RewardsFunded(msg.sender, received, rewardPool);
    }

    /// @notice Take back pool tokens nobody has earned yet. Bounded by
    /// rewardPool, so it can never touch a deposit or a reward already
    /// earned by a holder.
    function withdrawRewards(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Rewards: to is zero");
        _update();
        require(amount > 0 && amount <= rewardPool, "Rewards: amount above pool");
        rewardPool -= amount;
        token.safeTransfer(to, amount);
        emit RewardsWithdrawn(to, amount, rewardPool);
    }

    /// @notice Take back the whole unearned pool. Reading rewardPool
    /// off-chain and passing it to withdrawRewards reverts by a hair,
    /// because _update() shrinks it in between; here the amount is read
    /// after the update, inside the same call.
    function withdrawAllRewards(address to) external onlyOwner nonReentrant {
        require(to != address(0), "Rewards: to is zero");
        _update();
        uint256 amount = rewardPool;
        require(amount > 0, "Rewards: pool empty");
        rewardPool = 0;
        token.safeTransfer(to, amount);
        emit RewardsWithdrawn(to, amount, 0);
    }

    // ---------------------------------------------------------------
    // admin
    // ---------------------------------------------------------------

    function setDepositsPaused(bool paused) external onlyOwner {
        depositsPaused = paused;
        emit DepositsPausedChanged(paused);
    }

    /// @notice Change the reward rate, in basis points (1490 = 14.90% APY,
    /// 0 stops rewards). Accrual is settled at the old rate first, so the
    /// new rate only counts from this second on: nobody gains or loses
    /// anything already earned.
    function setRate(uint256 newRateBps) external onlyOwner {
        require(newRateBps <= MAX_RATE_BPS, "Rewards: rate above max");
        _update();
        uint256 old = rateBps;
        rateBps = newRateBps;
        emit RateChanged(old, newRateBps);
    }

    // ---------------------------------------------------------------
    // views for the interface
    // ---------------------------------------------------------------

    /// @notice Rewards an account could claim right now.
    function earned(address who) public view returns (uint256) {
        Account storage a = accounts[who];
        if (a.amount == 0) return a.earned;
        uint256 acc = accRewardPerToken;
        uint256 owed = _pendingGlobal();
        if (owed > rewardPool) owed = rewardPool;
        if (owed > 0 && totalDeposited > 0) acc += (owed * 1e18) / totalDeposited;
        return a.earned + ((a.amount * acc) / 1e18) - a.rewardDebt;
    }

    /// @notice Everything the page needs about one account, in one call.
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

    /// @notice Program-wide figures for the page.
    function poolView()
        external
        view
        returns (
            uint256 deposited,
            uint256 pool,
            uint256 rate,
            uint256 cap,
            bool paused,
            bool depositsClosed,
            uint256 depositors,
            uint256 chainTime
        )
    {
        // chainTime lets the page count against the chain clock, not the
        // browser's, which can be far apart
        return (
            totalDeposited,
            rewardPool,
            rateBps,
            MAX_TOTAL_DEPOSITED,
            accrualPaused,
            depositsPaused,
            depositorCount,
            block.timestamp
        );
    }

    /// @notice How much more #SECT the program can take before the cap.
    function remainingCapacity() external view returns (uint256) {
        return totalDeposited >= MAX_TOTAL_DEPOSITED ? 0 : MAX_TOTAL_DEPOSITED - totalDeposited;
    }

    /// @notice Seconds the current pool can keep paying at the current
    /// deposit level. Divide by 86400 for days.
    function runwaySeconds() external view returns (uint256) {
        if (totalDeposited == 0) return type(uint256).max;
        uint256 perSecond = (totalDeposited * rateBps) / (BPS * YEAR);
        if (perSecond == 0) return type(uint256).max;
        return rewardPool / perSecond;
    }
}
