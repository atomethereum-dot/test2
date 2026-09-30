// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Sectora Staking Season
/// @notice A twelve-month staking season paid by the Sectora Foundation
/// treasury as a marketing and growth program, instead of an airdrop. An
/// airdrop hands tokens to people who sell them; this pays people for
/// holding them.
///
/// THE RULES
///
///  1. 7% A MONTH. Rewards accrue every second at 7% of principal per
///     month (84% a year, linear, no compounding), for twelve months.
///  2. HALF MONTHLY, HALF AT THE END. Every reward is split as it accrues:
///     3.5% a month goes to a monthly balance the staker can collect once
///     a month; the other 3.5% a month goes to a final balance paid in one
///     settlement when the season closes.
///  3. NO LOCK. unstake() always works, immediately, in full.
///  4. A HARD CAP. At most 10,000,000 #SECT can be staked in the program,
///     so the treasury's total cost is bounded in code: 8,400,000 #SECT
///     for a full season at the cap.
///  5. THE 24-HOUR WINDOW. Taking principal out below your high-water mark
///     opens a 24-hour window. Put it back within the window and nothing is
///     lost. Let the window close and every reward not yet collected --
///     monthly and final alike -- is forfeited back to the pool, and
///     accrual restarts from the new balance. What was already collected
///     stays collected.
///
/// The high-water mark is what makes rule 5 exploit-resistant. Without it,
/// an account could withdraw 99.9% of its principal, leave one wei behind
/// so it never technically "exits", and keep rewards that were accrued on
/// the full amount. Here any drop below the peak opens the window, so the
/// only way to keep the accrued reward is to actually restore the stake.
///
/// ON MAINNET THIS HOLDS REAL VALUE.
///
///  - Rewards are NEVER minted. #SECT is renounced and has no mint
///    function. Every token paid out was transferred in beforehand via
///    fundRewards().
///  - Accrual moves tokens out of rewardPool as it happens, so a reward
///    already booked to an account is outside the owner's reach.
///  - The owner cannot take back unallocated reward tokens until the
///    season is over. Whatever the treasury puts in stays available to
///    stakers for the whole twelve months.
///  - The rate and the season length are constants. Nobody can change
///    them after people have staked.
///  - The rate is a target, not a debt. If the pool empties, accrual stops
///    at the last funded second rather than promising what cannot be paid.
///
/// Stake token and reward token are the same ERC-20, so the contract's
/// balance holds both principal and reward pool. They are tracked
/// separately (totalStaked / rewardPool) and every payout is checked
/// against booked rewards alone: one staker's principal can never leave as
/// another staker's reward.
contract SectoraStakingSeason is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BPS = 10_000;
    uint256 public constant YEAR = 365 days;

    /// @notice One month of the season: a twelfth of a year, 30.42 days.
    uint256 public constant MONTH = YEAR / 12;

    /// @notice 8400 bps = 84.00% a year = 7.00% a month, linear.
    uint256 public constant RATE_BPS = 8_400;

    /// @notice Share of every reward that goes to the monthly balance.
    /// 5000 = half: 3.5% a month collectable monthly, 3.5% at the end.
    uint256 public constant MONTHLY_SHARE_BPS = 5_000;

    /// @notice Length of the season: twelve months from deployment.
    uint256 public constant SEASON = 12 * MONTH;

    /// @notice Most #SECT the program can hold in stakes at once.
    uint256 public constant MAX_TOTAL_STAKED = 10_000_000 ether;

    /// @notice How long an account has to restore its stake before the
    /// uncollected reward is forfeited. Fixed: stakers need to know this
    /// number cannot be shortened under them after they have staked.
    uint256 public constant GRACE_WINDOW = 24 hours;

    IERC20 public immutable stakingToken;

    /// @notice When the season closes. Accrual stops here, the final
    /// balance becomes payable here, and the owner may recover leftovers
    /// from here on.
    uint256 public immutable seasonEnd;

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

    /// @notice Stops NEW deposits. Starts true so nobody can stake before
    /// the pool is funded; the owner opens deposits after funding.
    /// Withdrawing, collecting and the emergency exit are never affected,
    /// so it can never be used to lock anyone in.
    bool public stakingPaused = true;

    struct Account {
        uint256 amount; // principal
        uint256 rewardDebt; // accumulator checkpoint, scaled by 1e18
        uint256 monthly; // collectable once a month
        uint256 deferred; // payable only after seasonEnd
        uint256 peakAmount; // high-water principal for the current streak
        uint256 graceUntil; // 0 when whole; otherwise the restore deadline
        uint256 nextMonthlyAt; // earliest time of the next monthly collection
    }

    mapping(address => Account) public accounts;

    event Staked(address indexed account, uint256 amount, uint256 peakAfter);
    event Unstaked(address indexed account, uint256 amount, uint256 graceUntil);
    event StreakRestored(address indexed account, uint256 amount);
    event StreakBroken(address indexed account, uint256 forfeited, uint256 restartsAt);
    event MonthlyClaimed(address indexed account, uint256 amount, uint256 nextAt);
    event FinalClaimed(address indexed account, uint256 amount);
    event RewardsFunded(address indexed from, uint256 amount, uint256 poolAfter);
    event RewardsWithdrawn(address indexed to, uint256 amount, uint256 poolAfter);
    event AccrualPaused(uint256 atTimestamp, uint256 poolRemaining);
    event AccrualResumed(uint256 atTimestamp, uint256 poolRemaining);
    event EmergencyWithdrawn(address indexed account, uint256 amount, uint256 forfeited);
    event StakingPausedChanged(bool paused);

    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Season: token is zero");
        stakingToken = IERC20(_stakingToken);
        seasonEnd = block.timestamp + SEASON;
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
        return (totalStaked * RATE_BPS * elapsed) / (BPS * YEAR);
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

    /// @dev Books an account's share of the accumulator, split between the
    /// monthly and the final balance.
    function _settle(address who) internal {
        Account storage a = accounts[who];
        if (a.amount > 0) {
            uint256 acc = (a.amount * accRewardPerToken) / 1e18;
            uint256 delta = acc - a.rewardDebt;
            uint256 toMonthly = (delta * MONTHLY_SHARE_BPS) / BPS;
            a.monthly += toMonthly;
            a.deferred += delta - toMonthly;
        }
        a.rewardDebt = (a.amount * accRewardPerToken) / 1e18;
    }

    /// @dev Resolves an open grace window. Called after _settle on every
    /// path that touches an account, so the outcome is the same whether the
    /// staker comes back, comes back late, or never comes back at all.
    ///
    /// There is deliberately no "the season is over, you are safe" branch.
    /// A window that closed in month two must still forfeit at claim time
    /// in month twelve, otherwise walking away early and reappearing at the
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

        uint256 lost = a.monthly + a.deferred;
        a.monthly = 0;
        a.deferred = 0;
        a.peakAmount = a.amount; // accrual restarts from what is actually there
        a.graceUntil = 0;
        if (lost > 0) rewardPool += lost; // back to the pool, never to the owner
        emit StreakBroken(who, lost, a.amount);
    }

    function _touch(address who) internal {
        _update();
        _settle(who);
        _enforceStreak(who);
    }

    // ---------------------------------------------------------------
    // staking
    // ---------------------------------------------------------------

    function stake(uint256 amount) external nonReentrant {
        require(!stakingPaused, "Season: deposits paused");
        require(amount > 0, "Season: amount is zero");
        require(block.timestamp < seasonEnd, "Season: closed");

        _touch(msg.sender);

        // The cap applies to new capacity, not to someone putting back what
        // they took out: a staker inside their 24-hour window can always
        // restore up to their own peak, even if others filled the program in
        // the meantime. Otherwise a full program would turn a withdrawal into
        // a forfeit the staker could do nothing about. The overshoot this
        // allows is bounded by the open windows and lasts at most 24 hours.
        Account storage cur = accounts[msg.sender];
        bool restoring = cur.graceUntil != 0 && cur.amount + amount <= cur.peakAmount;
        require(restoring || totalStaked + amount <= MAX_TOTAL_STAKED, "Season: program full");

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

        // the monthly clock starts with the first deposit and keeps its own
        // rhythm after that; topping up does not push it back
        if (a.nextMonthlyAt == 0) a.nextMonthlyAt = block.timestamp + MONTH;

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

        _touch(msg.sender);

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

    /// @notice Collect the monthly half: 3.5% a month. Available one month
    /// after the first deposit and then once a month. Blocked while a
    /// restore window is open, so nobody can pull principal, collect, and
    /// walk away with a reward the window was about to forfeit.
    function claimMonthly() external nonReentrant {
        _touch(msg.sender);

        Account storage a = accounts[msg.sender];
        require(a.graceUntil == 0, "Season: restore your stake first");
        require(a.nextMonthlyAt != 0 && block.timestamp >= a.nextMonthlyAt, "Season: monthly not ready");
        uint256 amount = a.monthly;
        require(amount > 0, "Season: nothing to claim");

        a.monthly = 0;
        a.nextMonthlyAt = block.timestamp + MONTH;

        // the tokens left rewardPool during _update, so this transfer can
        // never reach into anyone's principal
        stakingToken.safeTransfer(msg.sender, amount);
        emit MonthlyClaimed(msg.sender, amount, a.nextMonthlyAt);
    }

    /// @notice Collect everything left -- the final half plus any monthly
    /// balance not yet collected. Reverts until the season closes.
    function claimFinal() external nonReentrant {
        require(block.timestamp >= seasonEnd, "Season: not over yet");

        _touch(msg.sender);

        Account storage a = accounts[msg.sender];
        uint256 amount = a.monthly + a.deferred;
        require(amount > 0, "Season: nothing to claim");
        a.monthly = 0;
        a.deferred = 0;

        stakingToken.safeTransfer(msg.sender, amount);
        emit FinalClaimed(msg.sender, amount);
    }

    /// @notice Withdraw principal immediately, forfeiting every reward not
    /// yet collected. The escape hatch that stops a paused pool or any
    /// other failure from trapping anyone's money.
    function emergencyWithdraw() external nonReentrant {
        Account storage a = accounts[msg.sender];
        uint256 amount = a.amount;
        require(amount > 0, "Season: nothing staked");

        _update();
        _settle(msg.sender);

        uint256 forfeited = a.monthly + a.deferred;
        stakerCount -= 1;
        a.amount = 0;
        a.monthly = 0;
        a.deferred = 0;
        a.rewardDebt = 0;
        a.peakAmount = 0;
        a.graceUntil = 0;
        a.nextMonthlyAt = 0;
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

    /// @notice Recover unallocated reward tokens once the season is over.
    /// Bounded by rewardPool, so it can never touch staked principal or a
    /// reward already booked to an account.
    function withdrawRewards(address to, uint256 amount) external onlyOwner nonReentrant {
        require(block.timestamp >= seasonEnd, "Season: not over yet");
        require(to != address(0), "Season: to is zero");
        _update();
        require(amount > 0 && amount <= rewardPool, "Season: amount above pool");
        rewardPool -= amount;
        stakingToken.safeTransfer(to, amount);
        emit RewardsWithdrawn(to, amount, rewardPool);
    }

    /// @notice Recover the whole unallocated pool once the season is over.
    function withdrawAllRewards(address to) external onlyOwner nonReentrant {
        require(block.timestamp >= seasonEnd, "Season: not over yet");
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

    function setStakingPaused(bool paused) external onlyOwner {
        stakingPaused = paused;
        emit StakingPausedChanged(paused);
    }

    // ---------------------------------------------------------------
    // views for the interface
    // ---------------------------------------------------------------

    /// @notice Rewards booked to an account right now, split into the
    /// monthly and the final balance, including the window since the last
    /// write. Both are 0 if the restore window has already closed below the
    /// high-water mark, so the page never shows a figure the contract would
    /// refuse to pay.
    function earnedSplit(address who) public view returns (uint256 monthly, uint256 deferred) {
        Account storage a = accounts[who];

        bool broken = a.graceUntil != 0 && a.amount < a.peakAmount && block.timestamp > a.graceUntil;
        if (broken) return (0, 0);

        monthly = a.monthly;
        deferred = a.deferred;
        if (a.amount == 0) return (monthly, deferred);

        uint256 acc = accRewardPerToken;
        uint256 owed = _pendingGlobal();
        if (owed > rewardPool) owed = rewardPool;
        if (owed > 0 && totalStaked > 0) acc += (owed * 1e18) / totalStaked;

        uint256 delta = ((a.amount * acc) / 1e18) - a.rewardDebt;
        uint256 toMonthly = (delta * MONTHLY_SHARE_BPS) / BPS;
        monthly += toMonthly;
        deferred += delta - toMonthly;
    }

    /// @notice Total rewards booked to an account right now.
    function earned(address who) external view returns (uint256) {
        (uint256 m, uint256 d) = earnedSplit(who);
        return m + d;
    }

    /// @notice Everything the staking page needs, in one call.
    function accountView(address who)
        external
        view
        returns (
            uint256 staked,
            uint256 monthlyRewards,
            uint256 finalRewards,
            uint256 nextMonthlyAt,
            uint256 peak,
            uint256 restoreBy,
            uint256 walletBalance,
            uint256 allowance
        )
    {
        Account storage a = accounts[who];
        staked = a.amount;
        (monthlyRewards, finalRewards) = earnedSplit(who);
        nextMonthlyAt = a.nextMonthlyAt;
        peak = a.peakAmount;
        restoreBy = a.graceUntil;
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
            bool depositsPaused,
            uint256 stakers,
            uint256 chainTime
        )
    {
        // chainTime is here so the interface counts down against the chain
        // clock and not the browser's, which can be far apart
        return (
            totalStaked,
            rewardPool,
            RATE_BPS,
            seasonEnd,
            accrualPaused,
            stakingPaused,
            stakerCount,
            block.timestamp
        );
    }

    /// @notice How much more #SECT the program can take before the cap.
    function remainingCapacity() external view returns (uint256) {
        return totalStaked >= MAX_TOTAL_STAKED ? 0 : MAX_TOTAL_STAKED - totalStaked;
    }

    /// @notice Seconds the current pool can keep paying at the current
    /// stake level. The honest version of an APY badge: it says how long
    /// the advertised rate is actually funded for.
    function runwaySeconds() external view returns (uint256) {
        if (totalStaked == 0) return type(uint256).max;
        uint256 perSecond = (totalStaked * RATE_BPS) / (BPS * YEAR);
        if (perSecond == 0) return type(uint256).max;
        return rewardPool / perSecond;
    }

    /// @notice What it would cost to fund the rest of the season at the
    /// current stake level. The number to check before funding.
    function fundingGap() external view returns (uint256) {
        if (block.timestamp >= seasonEnd) return 0;
        uint256 remaining = seasonEnd - block.timestamp;
        uint256 needed = (totalStaked * RATE_BPS * remaining) / (BPS * YEAR);
        return needed > rewardPool ? needed - rewardPool : 0;
    }
}
