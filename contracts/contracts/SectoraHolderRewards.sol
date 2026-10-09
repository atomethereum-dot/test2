// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Sectora Holder Rewards
/// @notice #SECT holders deposit #SECT and earn rewards, 14.9% APY at
/// launch, paid by the Sectora Foundation treasury.
///
/// THE RULES
///
///  1. 14.9% APY AT LAUNCH. Rewards accrue every second at the current
///     rate (rateBps) on the deposit, linear, no compounding. The owner can
///     change the rate with setRate() with no business ceiling (10% a month
///     is 12000). A change only applies from that second on: everything
///     accrued before it was booked at the old rate and is never
///     recalculated.
///  2. NO LOCK. withdraw() always works, immediately, in full or in part,
///     whatever state the reward pool is in.
///  3. CLAIM ANY TIME. Accrued rewards are the depositor's to collect
///     whenever they want, also after withdrawing.
///  4. NO DEPOSIT CAP. Anyone can deposit any amount. To stop new
///     deposits the owner closes them with setDepositsPaused(true); whoever
///     is in can still withdraw and claim. The treasury's cost is total
///     deposited x rate, and whatever the rate or the deposits, payouts
///     never exceed what was funded into the pool.
///
///  5. LOCKS (fixed-term deposits), disabled until the owner enables them.
///     Lock options (15 days, 30 days, 60 days at deployment; the owner can
///     change them and add more) each have their own rate. A lock keeps the
///     rate it was taken at for its whole term, and its full reward is
///     reserved out of rewardPool the moment it is taken, so it is paid in
///     full whatever happens to the pool later; a lock the pool cannot cover
///     is refused. The reward vests every second and can be claimed any
///     time; the principal comes back after the term, and accrual stops at
///     the end of the term. Leaving early is off unless the owner turns it
///     on, and then it returns the principal and gives the unclaimed part of
///     that lock's reward back to the pool.
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
///
/// OWNERSHIP. Two-step (Ownable2Step): a transfer only completes when the
/// new owner calls acceptOwnership(), so a mistyped address can never take
/// control. renounceOwnership() is disabled, so the pool and the rate can
/// never be frozen by accident.
contract SectoraHolderRewards is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BPS = 10_000;
    uint256 public constant YEAR = 365 days;

    /// @notice Technical ceiling for setRate(), not a business limit: 1e12
    /// bps is ten billion percent a year. It only exists so that
    /// totalDeposited * rate * elapsed can never overflow; an overflow there
    /// would make _update() revert and lock every withdrawal. totalDeposited
    /// is bounded by the token's supply, so with any real supply the product
    /// stays far below 2^256. Payouts are bounded by the funded pool
    /// whatever the rate.
    uint256 public constant MAX_RATE_BPS = 1e12;

    IERC20 public immutable token;

    /// @notice Sum of every holder's deposit. Never includes rewards.
    uint256 public totalDeposited;

    /// @notice Tokens available to pay future rewards. Never includes
    /// deposits, and never includes a reward already earned by a holder.
    uint256 public rewardPool;

    /// @notice Upper bound of rewards credited to holders and not claimed
    /// yet: every token that leaves rewardPool through accrual is added here
    /// and every claim is taken off. Holders are credited rounding down, so
    /// what they can actually claim never exceeds this.
    uint256 public totalUnclaimed;

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
        uint256 accPaid; // accRewardPerToken at the last settlement
        uint256 earned; // rewards accrued and not yet claimed
    }

    mapping(address => Account) public accounts;

    /// @notice Longest term the owner can give a lock option.
    uint256 public constant MAX_LOCK_DURATION = 3650 days;

    struct LockOption {
        uint256 duration; // seconds
        uint256 rateBps; // a year; every lock taken with it keeps this rate
        bool enabled;
    }

    struct Lock {
        uint256 amount; // principal
        uint256 rateBps; // rate fixed when the lock was taken
        uint256 start;
        uint256 end;
        uint256 reward; // full-term reward, reserved when the lock was taken
        uint256 claimed; // part of reward already paid out
        bool closed; // principal returned
    }

    LockOption[] public lockOptions;
    mapping(address => Lock[]) private _locks;

    /// @notice Principal held in open locks. Never part of totalDeposited.
    uint256 public totalLocked;

    /// @notice Reward reserved for open locks and not paid yet. Taken out
    /// of rewardPool when each lock starts, so the owner can't withdraw it.
    uint256 public totalLockReserved;

    /// @notice Whether a lock can be left before its term (off by default).
    bool public earlyExitEnabled;

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
    event LockOptionSet(uint256 indexed optionId, uint256 duration, uint256 rateBps, bool enabled);
    event EarlyExitChanged(bool enabled);
    event Locked(
        address indexed account,
        uint256 indexed lockId,
        uint256 optionId,
        uint256 amount,
        uint256 rateBps,
        uint256 end,
        uint256 reward
    );
    event LockClaimed(address indexed account, uint256 indexed lockId, uint256 amount);
    event LockWithdrawn(address indexed account, uint256 indexed lockId, uint256 amount);
    event LockExitedEarly(address indexed account, uint256 indexed lockId, uint256 amount, uint256 forfeited);

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Rewards: token is zero");
        token = IERC20(_token);
        lastUpdate = block.timestamp;
        // the three lock terms, disabled and without a rate until the owner
        // sets one with setLockOption
        lockOptions.push(LockOption(15 days, 0, false));
        lockOptions.push(LockOption(30 days, 0, false));
        lockOptions.push(LockOption(60 days, 0, false));
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
                totalUnclaimed += owed;
                accRewardPerToken += (owed * 1e18) / totalDeposited;
            }
        }
        lastUpdate = block.timestamp;
    }

    /// @dev Books an account's share of the accumulator into `earned`. The
    /// checkpoint is the accumulator itself, not amount x accumulator, so
    /// each credit is the holder's exact share rounded down: the sum of all
    /// credits can never exceed what left rewardPool.
    function _settle(address who) internal {
        Account storage a = accounts[who];
        if (a.amount > 0) {
            a.earned += (a.amount * (accRewardPerToken - a.accPaid)) / 1e18;
        }
        a.accPaid = accRewardPerToken;
    }

    // ---------------------------------------------------------------
    // holders
    // ---------------------------------------------------------------

    function deposit(uint256 amount) external nonReentrant {
        require(!depositsPaused, "Rewards: deposits paused");
        require(amount > 0, "Rewards: amount is zero");

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
        totalUnclaimed -= amount;

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
        require(to != address(0) && to != address(this), "Rewards: bad recipient");
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
        require(to != address(0) && to != address(this), "Rewards: bad recipient");
        _update();
        uint256 amount = rewardPool;
        require(amount > 0, "Rewards: pool empty");
        rewardPool = 0;
        token.safeTransfer(to, amount);
        emit RewardsWithdrawn(to, amount, 0);
    }

    /// @notice Recover #SECT that reached the contract outside deposit()
    /// and fundRewards(), e.g. a plain transfer by mistake. Only what is
    /// left after every deposit, the pool and every unclaimed reward is
    /// covered can move, so no holder's tokens can ever leave this way.
    function recoverSurplus(address to) external onlyOwner nonReentrant {
        require(to != address(0) && to != address(this), "Rewards: bad recipient");
        _update();
        uint256 owedOut = totalDeposited + rewardPool + totalUnclaimed + totalLocked + totalLockReserved;
        uint256 bal = token.balanceOf(address(this));
        require(bal > owedOut, "Rewards: no surplus");
        uint256 amount = bal - owedOut;
        token.safeTransfer(to, amount);
        emit SurplusRecovered(to, amount);
    }

    /// @notice Recover any OTHER token sent here by mistake. It can never
    /// touch #SECT.
    function rescueToken(address otherToken, address to, uint256 amount) external onlyOwner nonReentrant {
        require(otherToken != address(token), "Rewards: not for the staking token");
        require(to != address(0), "Rewards: bad recipient");
        IERC20(otherToken).safeTransfer(to, amount);
        emit TokenRescued(otherToken, to, amount);
    }

    // ---------------------------------------------------------------
    // locks (fixed-term deposits)
    // ---------------------------------------------------------------

    /// @notice Take a lock: `amount` stays in for the option's term and
    /// earns the option's current rate, fixed for this lock. Its full reward
    /// is reserved from the pool now.
    function lock(uint256 optionId, uint256 amount) external nonReentrant returns (uint256 lockId) {
        require(!depositsPaused, "Rewards: deposits paused");
        require(optionId < lockOptions.length, "Rewards: no such lock option");
        LockOption memory o = lockOptions[optionId];
        require(o.enabled, "Rewards: lock option disabled");
        require(amount > 0, "Rewards: amount is zero");

        _update();

        uint256 before = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = token.balanceOf(address(this)) - before;
        require(received > 0, "Rewards: nothing received");

        uint256 reward = (received * o.rateBps * o.duration) / (BPS * YEAR);
        require(reward <= rewardPool, "Rewards: pool too small for this lock");
        rewardPool -= reward;
        totalLockReserved += reward;
        totalLocked += received;

        uint256 end = block.timestamp + o.duration;
        lockId = _locks[msg.sender].length;
        _locks[msg.sender].push(Lock(received, o.rateBps, block.timestamp, end, reward, 0, false));
        emit Locked(msg.sender, lockId, optionId, received, o.rateBps, end, reward);
    }

    /// @notice Collect what one lock has earned so far.
    function claimLock(uint256 lockId) external nonReentrant {
        uint256 amount = _claimLock(msg.sender, lockId);
        require(amount > 0, "Rewards: nothing to claim");
        token.safeTransfer(msg.sender, amount);
    }

    /// @notice Collect what every lock of the caller has earned so far.
    function claimAllLocks() external nonReentrant {
        uint256 n = _locks[msg.sender].length;
        uint256 total;
        for (uint256 i = 0; i < n; i++) total += _claimLock(msg.sender, i);
        require(total > 0, "Rewards: nothing to claim");
        token.safeTransfer(msg.sender, total);
    }

    /// @notice After the term: principal back plus whatever of the reward
    /// is still unclaimed.
    function withdrawLock(uint256 lockId) external nonReentrant {
        require(lockId < _locks[msg.sender].length, "Rewards: no such lock");
        Lock storage l = _locks[msg.sender][lockId];
        require(!l.closed, "Rewards: lock already closed");
        require(block.timestamp >= l.end, "Rewards: still locked");
        uint256 rest = _claimLock(msg.sender, lockId);
        l.closed = true;
        totalLocked -= l.amount;
        emit LockWithdrawn(msg.sender, lockId, l.amount);
        token.safeTransfer(msg.sender, l.amount + rest);
    }

    /// @notice Leave a lock before its term, only while the owner allows it:
    /// the principal comes back and the unclaimed part of the lock's reward
    /// returns to the pool.
    function exitLockEarly(uint256 lockId) external nonReentrant {
        require(earlyExitEnabled, "Rewards: early exit disabled");
        require(lockId < _locks[msg.sender].length, "Rewards: no such lock");
        Lock storage l = _locks[msg.sender][lockId];
        require(!l.closed, "Rewards: lock already closed");
        require(block.timestamp < l.end, "Rewards: lock ended, use withdrawLock");
        _update();
        uint256 forfeited = l.reward - l.claimed;
        l.closed = true;
        totalLocked -= l.amount;
        totalLockReserved -= forfeited;
        _addToPool(forfeited);
        emit LockExitedEarly(msg.sender, lockId, l.amount, forfeited);
        token.safeTransfer(msg.sender, l.amount);
    }

    function _vested(Lock storage l) internal view returns (uint256) {
        if (block.timestamp >= l.end) return l.reward;
        return (l.reward * (block.timestamp - l.start)) / (l.end - l.start);
    }

    function _claimLock(address who, uint256 lockId) internal returns (uint256 amount) {
        require(lockId < _locks[who].length, "Rewards: no such lock");
        Lock storage l = _locks[who][lockId];
        if (l.closed) return 0;
        amount = _vested(l) - l.claimed;
        if (amount > 0) {
            l.claimed += amount;
            totalLockReserved -= amount;
            emit LockClaimed(who, lockId, amount);
        }
    }

    /// @dev Puts tokens back in the pool and restarts accrual if the pool
    /// had run dry; the empty gap is not paid.
    function _addToPool(uint256 amount) internal {
        if (amount == 0) return;
        rewardPool += amount;
        if (accrualPaused) {
            accrualPaused = false;
            lastUpdate = block.timestamp;
            emit AccrualResumed(block.timestamp, rewardPool);
        }
    }

    // ---------------------------------------------------------------
    // admin
    // ---------------------------------------------------------------

    /// @notice Change a lock option. Locks already taken keep their own
    /// term and rate; this only affects new ones.
    function setLockOption(uint256 optionId, uint256 duration, uint256 rate, bool enabled) external onlyOwner {
        require(optionId < lockOptions.length, "Rewards: no such lock option");
        _checkLockOption(duration, rate);
        lockOptions[optionId] = LockOption(duration, rate, enabled);
        emit LockOptionSet(optionId, duration, rate, enabled);
    }

    /// @notice Add a new lock option (e.g. 6 months).
    function addLockOption(uint256 duration, uint256 rate, bool enabled) external onlyOwner returns (uint256 optionId) {
        _checkLockOption(duration, rate);
        optionId = lockOptions.length;
        lockOptions.push(LockOption(duration, rate, enabled));
        emit LockOptionSet(optionId, duration, rate, enabled);
    }

    function _checkLockOption(uint256 duration, uint256 rate) internal pure {
        require(duration > 0 && duration <= MAX_LOCK_DURATION, "Rewards: bad lock duration");
        require(rate <= MAX_RATE_BPS, "Rewards: rate above max");
    }

    /// @notice Allow or forbid leaving locks before their term.
    function setEarlyExit(bool enabled) external onlyOwner {
        earlyExitEnabled = enabled;
        emit EarlyExitChanged(enabled);
    }


    /// @notice Disabled: leaving the contract without an owner would freeze
    /// the rate and the unearned pool forever.
    function renounceOwnership() public view override onlyOwner {
        revert("Rewards: renounce disabled");
    }

    function setDepositsPaused(bool paused) external onlyOwner {
        depositsPaused = paused;
        emit DepositsPausedChanged(paused);
    }

    /// @notice Change the reward rate, in basis points a year (1490 =
    /// 14.90% APY, 12000 = 10% a month, 0 stops rewards). Accrual is settled at the old rate first, so the
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
        return a.earned + (a.amount * (acc - a.accPaid)) / 1e18;
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
            bool paused,
            bool depositsClosed,
            uint256 depositors,
            uint256 chainTime
        )
    {
        // pool and paused are as of this second, not as of the last
        // transaction: accrual since then is already taken off the pool, and
        // a pool it has emptied reads as paused. chainTime lets the page
        // count against the chain clock, not the browser's.
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

    /// @dev rewardPool minus what has accrued since the last update, and
    /// whether that leaves accrual stopped.
    function _effectivePool() internal view returns (uint256 effPool, bool effPaused) {
        uint256 owed = _pendingGlobal();
        if (owed >= rewardPool) {
            return (0, accrualPaused || owed > 0);
        }
        return (rewardPool - owed, accrualPaused);
    }

    /// @notice Every lock option, for the page.
    function allLockOptions() external view returns (LockOption[] memory) {
        return lockOptions;
    }

    /// @notice Every lock an account has taken, open and closed.
    function locksOf(address who) external view returns (Lock[] memory) {
        return _locks[who];
    }

    function lockCount(address who) external view returns (uint256) {
        return _locks[who].length;
    }

    /// @notice What one lock could claim right now.
    function lockEarned(address who, uint256 lockId) external view returns (uint256) {
        require(lockId < _locks[who].length, "Rewards: no such lock");
        Lock storage l = _locks[who][lockId];
        if (l.closed) return 0;
        return _vested(l) - l.claimed;
    }

    /// @notice Seconds the pool can keep paying at the current deposits and
    /// rate, counted from now. 0 if it is already empty; the maximum uint
    /// if nothing is being paid (no deposits or a 0 rate). Divide by 86400
    /// for days.
    function runwaySeconds() external view returns (uint256) {
        if (totalDeposited == 0 || rateBps == 0) return type(uint256).max;
        (uint256 effPool, bool effPaused) = _effectivePool();
        if (effPaused || effPool == 0) return 0;
        return (effPool * BPS * YEAR) / (totalDeposited * rateBps);
    }
}
