// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Sectora Staking Season
/// @notice A fixed-length staking season with no lock. Stakers can leave
/// whenever they want, but rewards are paid in a single settlement at the
/// end of the season, and leaving without coming back forfeits everything
/// accrued so far.
///
/// The design answers one question: how do you reward people for holding
/// without taking their tokens hostage? A lock does it by force. This does
/// it by making the reward worth more than the exit.
///
/// THE THREE RULES
///
///  1. NO LOCK. unstake() always works, immediately, in full.
///  2. NO EARLY CLAIM. claim() reverts until seasonEnd. Everything accrued
///     is settled in one payment after the season closes.
///  3. THE STREAK. Taking principal out below your high-water mark opens a
///     24-hour window. Put it back within the window and nothing is lost.
///     Let the window close and every reward accrued so far is forfeited
///     back to the pool, and accrual restarts from the new balance.
///
/// The high-water mark is what makes rule 3 exploit-resistant. Without it,
/// an account could withdraw 99.9% of its principal, leave one wei behind
/// so it never technically "exits", and keep rewards that were accrued on
/// the full amount. Here any drop below the peak opens the window, so the
/// only way to keep the accrued reward is to actually restore the stake.
///
/// ON MAINNET THIS HOLDS REAL VALUE. Inherited from SectoraStaking and kept
/// deliberately:
///
///  - Rewards are NEVER minted. #SECT is renounced and has no mint
///    function. Every token paid out was transferred in beforehand via
///    fundRewards().
///  - Accrual moves tokens out of rewardPool as it happens, so the owner's
///    withdraw functions -- bounded by rewardPool -- can never reach a
///    reward that has already been booked to an account. During a season
///    where nobody can claim for months, that property is the whole reason
///    the promise is credible.
///  - The rate is a target, not a debt. If the pool empties, accrual stops
///    at the last funded second rather than promising what cannot be paid.
///
/// Stake token and reward token are the same ERC-20, so the contract's
/// balance holds both principal and reward pool. They are tracked
/// separately (totalStaked / rewardPool) and every payout is checked
/// against rewardPool alone: one staker's principal can never leave as
/// another staker's reward.
contract SectoraStakingSeason is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev Rates are in basis points. 8400 = 84.00% per year, which is the
    /// linear equivalent of 7.00% per month.
    uint256 public constant BPS = 10_000;
    uint256 public constant YEAR = 365 days;

    /// @dev Ceiling on the configurable rate. Not a business preference: it
    /// bounds how fast a compromised or fat-fingered owner could drain the
    /// reward pool.
    uint256 public constant MAX_RATE_BPS = 10_000;

    /// @dev How long an account has to restore its stake before the accrued
    /// reward is forfeited. Fixed, not configurable: stakers need to know
    /// this number cannot be shortened under them after they have staked.
    uint256 public constant GRACE_WINDOW = 24 hours;

    /// @dev Bounds on the season length, checked at construction. A season
    /// that could be set to a century would be a lock by another name,
    /// since rewards are unclaimable until it ends.
    uint256 public constant MIN_SEASON = 7 days;
    uint256 public constant MAX_SEASON = 400 days;

    IERC20 public immutable stakingToken;

    /// @notice When the season closes. Accrual stops here and claiming
    /// opens here. Immutable: the owner cannot move the finish line after
    /// people have staked against it.
    uint256 public immutable seasonEnd;

    /// @notice Target annual rate in basis points. 8400 = 84.00% per year
    /// = 7.00% per month.
    uint256 public rateBps;

    /// @notice Sum of every account's principal. Never includes rewards.
    uint256 public totalStaked;

    /// @notice Tokens available to pay rewards. Never includes principal,
    /// and never includes a reward already booked to an account.
    uint256 public rewardPool;

    /// @notice Accounts with a non-zero principal right now.
    uint256 public stakerCount;

    /// @dev Accumulated reward per staked token, scaled by 1e18.
    uint256 public accRewardPerToken;
    uint256 public lastUpdate;

    /// @dev Set once the pool cannot cover accrual any more.
    bool public accrualPaused;

    /// @notice Stops NEW deposits. One-directional in what it can do:
    /// withdrawing, claiming and the emergency exit stay open, so it can
    /// never be used to lock anyone in.
    bool public stakingPaused;

    struct Account {
        uint256 amount; // principal
        uint256 rewardDebt; // accumulator checkpoint, scaled by 1e18
        uint256 pending; // rewards accrued, payable only after seasonEnd
        uint256 peakAmount; // high-water principal for the current streak
        uint256 graceUntil; // 0 when whole; otherwise the restore deadline
    }

    mapping(address => Account) public accounts;

    event Staked(address indexed account, uint256 amount, uint256 peakAfter);
    event Unstaked(address indexed account, uint256 amount, uint256 graceUntil);
    event StreakRestored(address indexed account, uint256 amount);
    event StreakBroken(address indexed account, uint256 forfeited, uint256 restartsAt);
    event RewardClaimed(address indexed account, uint256 amount);
    event RewardsFunded(address indexed from, uint256 amount, uint256 poolAfter);
    event RewardsWithdrawn(address indexed to, uint256 amount, uint256 poolAfter);
    event RateChanged(uint256 oldRateBps, uint256 newRateBps);
    event AccrualPaused(uint256 atTimestamp, uint256 poolRemaining);
    event AccrualResumed(uint256 atTimestamp, uint256 poolRemaining);
    event EmergencyWithdrawn(address indexed account, uint256 amount, uint256 forfeited);
    event StakingPausedChanged(bool paused);

    constructor(address _stakingToken, uint256 _rateBps, uint256 _seasonSeconds) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Season: token is zero");
        require(_rateBps <= MAX_RATE_BPS, "Season: rate above max");
        require(_seasonSeconds >= MIN_SEASON, "Season: too short");
        require(_seasonSeconds <= MAX_SEASON, "Season: too long");
        stakingToken = IERC20(_stakingToken);
        rateBps = _rateBps;
        seasonEnd = block.timestamp + _seasonSeconds;
        lastUpdate = block.timestamp;
    }

    // ---------------------------------------------------------------
    // accrual
    // ---------------------------------------------------------------

    /// @dev Rewards owed to every staker for the elapsed window. Elapsed
    /// time is clipped at seasonEnd, so the season stops paying on its own
    /// without anyone having to call anything on the closing day.
    function _pendingGlobal() internal view returns (uint256) {
        if (totalStaked == 0 || accrualPaused) return 0;
        uint256 upTo = block.timestamp < seasonEnd ? block.timestamp : seasonEnd;
        if (upTo <= lastUpdate) return 0;
        uint256 elapsed = upTo - lastUpdate;
        return (totalStaked * rateBps * elapsed) / (BPS * YEAR);
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
                emit AccrualPaused(block.timestamp, 0);
            }
            if (owed > 0) {
                rewardPool -= owed;
                accRewardPerToken += (owed * 1e18) / totalStaked;
            }
        }
        lastUpdate = block.timestamp;
    }

    /// @dev Books an account's share of the accumulator into `pending`.
    function _settle(address who) internal {
        Account storage a = accounts[who];
        if (a.amount > 0) {
            uint256 acc = (a.amount * accRewardPerToken) / 1e18;
            a.pending += acc - a.rewardDebt;
        }
        a.rewardDebt = (a.amount * accRewardPerToken) / 1e18;
    }

    /// @dev Resolves an open grace window. Called after _settle on every
    /// path that touches an account, so the outcome is the same whether the
    /// staker comes back, comes back late, or never comes back at all.
    ///
    /// There is deliberately no "the season is over, you are safe" branch.
    /// A window that closed in month two must still forfeit at claim time
    /// in month seven, otherwise walking away early and reappearing at the
    /// end would pay exactly the same as never leaving.
    function _enforceStreak(address who) internal {
        Account storage a = accounts[who];
        if (a.graceUntil == 0) return;
        if (a.amount >= a.peakAmount) {
            a.graceUntil = 0;
            emit StreakRestored(who, a.amount);
            return;
        }
        if (block.timestamp <= a.graceUntil) return; // still inside the window

        uint256 lost = a.pending;
        a.pending = 0;
        a.peakAmount = a.amount; // accrual restarts from what is actually there
        a.graceUntil = 0;
        if (lost > 0) rewardPool += lost; // back to the pool, never to the owner
        emit StreakBroken(who, lost, a.amount);
    }

    // ---------------------------------------------------------------
    // staking
    // ---------------------------------------------------------------

    function stake(uint256 amount) external nonReentrant {
        require(!stakingPaused, "Season: deposits paused");
        require(amount > 0, "Season: amount is zero");
        require(block.timestamp < seasonEnd, "Season: closed");

        _update();
        _settle(msg.sender);
        _enforceStreak(msg.sender);

        // measured, not assumed: a fee-on-transfer token would credit more
        // than actually arrived and leave the last withdrawer unable to exit
        uint256 before = stakingToken.balanceOf(address(this));
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = stakingToken.balanceOf(address(this)) - before;
        require(received > 0, "Season: nothing received");

        Account storage a = accounts[msg.sender];
        if (a.amount == 0) stakerCount += 1;
        a.amount += received;
        totalStaked += received;

        if (a.amount >= a.peakAmount) {
            if (a.graceUntil != 0) {
                a.graceUntil = 0;
                emit StreakRestored(msg.sender, a.amount);
            }
            a.peakAmount = a.amount;
        }

        a.rewardDebt = (a.amount * accRewardPerToken) / 1e18;
        emit Staked(msg.sender, received, a.peakAmount);
    }

    /// @notice Withdraw principal at any time. No lock, ever. Dropping
    /// below the high-water mark opens the 24-hour restore window; if one
    /// is already open it is NOT extended, so repeated small withdrawals
    /// cannot be used to keep pushing the deadline out.
    function unstake(uint256 amount) external nonReentrant {
        Account storage a = accounts[msg.sender];
        require(amount > 0, "Season: amount is zero");
        require(a.amount >= amount, "Season: amount above stake");

        _update();
        _settle(msg.sender);
        _enforceStreak(msg.sender);

        a.amount -= amount;
        if (a.amount == 0) stakerCount -= 1;
        totalStaked -= amount;
        a.rewardDebt = (a.amount * accRewardPerToken) / 1e18;

        // after the season there is nothing left to accrue and nothing left
        // to protect, so leaving costs nothing
        if (a.amount < a.peakAmount && a.graceUntil == 0 && block.timestamp < seasonEnd) {
            a.graceUntil = block.timestamp + GRACE_WINDOW;
        }

        stakingToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount, a.graceUntil);
    }

    /// @notice Collect the season's rewards. Reverts until the season
    /// closes: that single settlement is the point of the design.
    function claim() external nonReentrant {
        require(block.timestamp >= seasonEnd, "Season: not over yet");

        _update();
        _settle(msg.sender);
        _enforceStreak(msg.sender);

        Account storage a = accounts[msg.sender];
        uint256 amount = a.pending;
        require(amount > 0, "Season: nothing to claim");
        a.pending = 0;

        // the tokens left rewardPool during _update, so this transfer can
        // never reach into anyone's principal
        stakingToken.safeTransfer(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }

    /// @notice Withdraw principal immediately, forfeiting all rewards. The
    /// escape hatch that stops a paused pool from trapping anyone's money.
    function emergencyWithdraw() external nonReentrant {
        Account storage a = accounts[msg.sender];
        uint256 amount = a.amount;
        require(amount > 0, "Season: nothing staked");

        _update();
        _settle(msg.sender);

        uint256 forfeited = a.pending;
        stakerCount -= 1;
        a.amount = 0;
        a.pending = 0;
        a.rewardDebt = 0;
        a.peakAmount = 0;
        a.graceUntil = 0;
        totalStaked -= amount;

        // what they give up goes back to the pool, not to the owner
        if (forfeited > 0) rewardPool += forfeited;

        stakingToken.safeTransfer(msg.sender, amount);
        emit EmergencyWithdrawn(msg.sender, amount, forfeited);
    }

    // ---------------------------------------------------------------
    // reward pool
    // ---------------------------------------------------------------

    /// @notice Fund the reward pool. Open to anyone.
    function fundRewards(uint256 amount) external nonReentrant {
        require(amount > 0, "Season: amount is zero");
        _update();

        uint256 before = stakingToken.balanceOf(address(this));
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = stakingToken.balanceOf(address(this)) - before;

        rewardPool += received;
        if (accrualPaused) {
            accrualPaused = false;
            lastUpdate = block.timestamp; // the drought does not accrue retroactively
            emit AccrualResumed(block.timestamp, rewardPool);
        }
        emit RewardsFunded(msg.sender, received, rewardPool);
    }

    /// @notice Recover unallocated reward tokens. Bounded by rewardPool, so
    /// the owner can never touch staked principal or a reward already
    /// booked to an account.
    function withdrawRewards(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Season: to is zero");
        _update();
        require(amount > 0 && amount <= rewardPool, "Season: amount above pool");
        rewardPool -= amount;
        stakingToken.safeTransfer(to, amount);
        emit RewardsWithdrawn(to, amount, rewardPool);
    }

    /// @notice Recover the whole unallocated pool. Reading rewardPool
    /// off-chain and passing it to withdrawRewards always reverts by a
    /// hair, because _update() shrinks it in between; here the amount is
    /// read after the update, inside the same call.
    function withdrawAllRewards(address to) external onlyOwner nonReentrant {
        require(to != address(0), "Season: to is zero");
        _update();
        uint256 amount = rewardPool;
        require(amount > 0, "Season: pool empty");
        rewardPool = 0;
        stakingToken.safeTransfer(to, amount);
        emit RewardsWithdrawn(to, amount, 0);
    }

    // ---------------------------------------------------------------
    // admin
    // ---------------------------------------------------------------

    function setRate(uint256 newRateBps) external onlyOwner {
        require(newRateBps <= MAX_RATE_BPS, "Season: rate above max");
        _update(); // settle at the old rate before it changes
        uint256 old = rateBps;
        rateBps = newRateBps;
        emit RateChanged(old, newRateBps);
    }

    function setStakingPaused(bool paused) external onlyOwner {
        stakingPaused = paused;
        emit StakingPausedChanged(paused);
    }

    // ---------------------------------------------------------------
    // views for the interface
    // ---------------------------------------------------------------

    /// @notice Rewards booked to an account right now, including the window
    /// since the last write. Returns 0 if the restore window has already
    /// closed below the high-water mark, so the page never shows a figure
    /// the contract would refuse to pay.
    function earned(address who) external view returns (uint256) {
        Account storage a = accounts[who];

        bool broken = a.graceUntil != 0 && a.amount < a.peakAmount && block.timestamp > a.graceUntil;
        if (broken) return 0;

        if (a.amount == 0) return a.pending;

        uint256 acc = accRewardPerToken;
        uint256 owed = _pendingGlobal();
        if (owed > rewardPool) owed = rewardPool;
        if (owed > 0 && totalStaked > 0) acc += (owed * 1e18) / totalStaked;

        return a.pending + ((a.amount * acc) / 1e18) - a.rewardDebt;
    }

    /// @notice Everything the staking page needs, in one call.
    function accountView(address who)
        external
        view
        returns (
            uint256 staked,
            uint256 pendingRewards,
            uint256 peak,
            uint256 restoreBy,
            uint256 claimableAt,
            uint256 walletBalance,
            uint256 allowance
        )
    {
        Account storage a = accounts[who];
        staked = a.amount;
        pendingRewards = this.earned(who);
        peak = a.peakAmount;
        restoreBy = a.graceUntil;
        claimableAt = seasonEnd;
        walletBalance = stakingToken.balanceOf(who);
        allowance = stakingToken.allowance(who, address(this));
    }

    /// @notice Pool-wide figures for the header stats.
    function poolView()
        external
        view
        returns (
            uint256 staked,
            uint256 pool,
            uint256 rate,
            uint256 endsAt,
            bool paused,
            uint256 stakers,
            uint256 chainTime
        )
    {
        // chainTime is here so the interface counts down against the chain
        // clock and not the browser's, which can be far apart
        return (totalStaked, rewardPool, rateBps, seasonEnd, accrualPaused, stakerCount, block.timestamp);
    }

    /// @notice Seconds the current pool can keep paying at the current rate
    /// and stake level. The honest version of an APY badge: it says how
    /// long the advertised rate is actually funded for.
    function runwaySeconds() external view returns (uint256) {
        if (totalStaked == 0 || rateBps == 0) return type(uint256).max;
        uint256 perSecond = (totalStaked * rateBps) / (BPS * YEAR);
        if (perSecond == 0) return type(uint256).max;
        return rewardPool / perSecond;
    }

    /// @notice What it would cost to fund the rest of the season at the
    /// current stake level and rate. The number to check before funding.
    function fundingGap() external view returns (uint256) {
        if (block.timestamp >= seasonEnd || rateBps == 0) return 0;
        uint256 remaining = seasonEnd - block.timestamp;
        uint256 needed = (totalStaked * rateBps * remaining) / (BPS * YEAR);
        return needed > rewardPool ? needed - rewardPool : 0;
    }
}
