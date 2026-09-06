// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Sectora Staking
/// @notice Stake the Sectora test token to earn rewards paid from a funded
/// reward pool. The site advertises rewards "funded by hash revenue,
/// targeting 14.9% APY", and this contract is built to mean that literally:
///
///  - Rewards are NEVER minted. Every token paid out was transferred in
///    beforehand via fundRewards(), which is where hash revenue lands.
///  - The rate is a target, not a promise. If the pool empties, accrual
///    stops at the last funded second instead of promising a debt the
///    contract cannot pay.
///
/// Stake token and reward token are the same ERC-20, so the contract's
/// balance holds both staked principal and the reward pool. They are
/// tracked separately (totalStaked / rewardPool) and every payout is
/// checked against rewardPool alone: one staker's principal can never be
/// paid out as another staker's reward.
contract SectoraStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev Rates are in basis points: 1490 = 14.90% per year.
    uint256 public constant BPS = 10_000;
    uint256 public constant YEAR = 365 days;

    /// @dev Ceiling on the configurable rate. Not a business preference: it
    /// bounds how fast a compromised or fat-fingered owner could drain the
    /// reward pool. 100% APY is far above anything the site advertises.
    uint256 public constant MAX_RATE_BPS = 10_000;

    IERC20 public immutable stakingToken;

    /// @notice Target annual rate in basis points. 1490 = 14.90% APY.
    uint256 public rateBps;

    /// @notice Seconds a stake must sit before it can be withdrawn.
    uint256 public lockPeriod;

    /// @notice Sum of every account's principal. Never includes rewards.
    uint256 public totalStaked;

    /// @notice Tokens available to pay rewards. Never includes principal.
    uint256 public rewardPool;

    /// @notice Accounts with a non-zero principal right now. Kept on-chain
    /// so the page can show a real staker count instead of inventing one.
    uint256 public stakerCount;

    /// @dev Accumulated reward per staked token, scaled by 1e18. The
    /// accumulator pattern keeps stake/unstake O(1) no matter how many
    /// accounts are staking.
    uint256 public accRewardPerToken;
    uint256 public lastUpdate;

    /// @dev Set once the pool cannot cover accrual any more. From then on
    /// nothing further accrues until it is refunded.
    bool public accrualPaused;

    struct Account {
        uint256 amount; // principal
        uint256 rewardDebt; // accumulator checkpoint, scaled by 1e18
        uint256 pending; // rewards earned and not yet claimed
        uint256 stakedAt; // timestamp of the last stake, for the lock
    }

    mapping(address => Account) public accounts;

    event Staked(address indexed account, uint256 amount);
    event Unstaked(address indexed account, uint256 amount);
    event RewardClaimed(address indexed account, uint256 amount);
    event RewardsFunded(address indexed from, uint256 amount, uint256 poolAfter);
    event RewardsWithdrawn(address indexed to, uint256 amount, uint256 poolAfter);
    event RateChanged(uint256 oldRateBps, uint256 newRateBps);
    event LockPeriodChanged(uint256 oldLockPeriod, uint256 newLockPeriod);
    event AccrualPaused(uint256 atTimestamp, uint256 poolRemaining);
    event AccrualResumed(uint256 atTimestamp, uint256 poolRemaining);
    event EmergencyWithdrawn(address indexed account, uint256 amount, uint256 forfeited);

    constructor(address _stakingToken, uint256 _rateBps, uint256 _lockPeriod) Ownable(msg.sender) {
        require(_stakingToken != address(0), "SectoraStaking: token is zero");
        require(_rateBps <= MAX_RATE_BPS, "SectoraStaking: rate above max");
        stakingToken = IERC20(_stakingToken);
        rateBps = _rateBps;
        lockPeriod = _lockPeriod;
        lastUpdate = block.timestamp;
    }

    // ---------------------------------------------------------------
    // accrual
    // ---------------------------------------------------------------

    /// @dev Rewards owed to every staker for the elapsed window, at the
    /// current rate. Returns 0 while nothing is staked, so an empty pool
    /// does not accumulate a phantom debt over an idle period.
    function _pendingGlobal() internal view returns (uint256) {
        if (totalStaked == 0 || accrualPaused) return 0;
        uint256 elapsed = block.timestamp - lastUpdate;
        if (elapsed == 0) return 0;
        return (totalStaked * rateBps * elapsed) / (BPS * YEAR);
    }

    /// @dev Moves the accumulator forward. If the pool cannot cover the
    /// full window, it pays what is left, pauses accrual and stops. The
    /// alternative -- accruing anyway -- would let the contract promise
    /// rewards it has no tokens for, and the first stakers to claim would
    /// be paid with other people's principal.
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

    // ---------------------------------------------------------------
    // staking
    // ---------------------------------------------------------------

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "SectoraStaking: amount is zero");
        _update();
        _settle(msg.sender);

        // measured, not assumed: a fee-on-transfer token would credit more
        // than actually arrived and leave the last withdrawer unable to exit
        uint256 before = stakingToken.balanceOf(address(this));
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = stakingToken.balanceOf(address(this)) - before;
        require(received > 0, "SectoraStaking: nothing received");

        Account storage a = accounts[msg.sender];
        if (a.amount == 0) stakerCount += 1;
        a.amount += received;
        a.stakedAt = block.timestamp;
        a.rewardDebt = (a.amount * accRewardPerToken) / 1e18;
        totalStaked += received;

        emit Staked(msg.sender, received);
    }

    function unstake(uint256 amount) external nonReentrant {
        Account storage a = accounts[msg.sender];
        require(amount > 0, "SectoraStaking: amount is zero");
        require(a.amount >= amount, "SectoraStaking: amount above stake");
        require(block.timestamp >= a.stakedAt + lockPeriod, "SectoraStaking: still locked");

        _update();
        _settle(msg.sender);

        a.amount -= amount;
        if (a.amount == 0) stakerCount -= 1;
        a.rewardDebt = (a.amount * accRewardPerToken) / 1e18;
        totalStaked -= amount;

        stakingToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function claim() external nonReentrant {
        _update();
        _settle(msg.sender);

        Account storage a = accounts[msg.sender];
        uint256 amount = a.pending;
        require(amount > 0, "SectoraStaking: nothing to claim");
        a.pending = 0;

        // the tokens were already moved out of rewardPool by _update, so
        // this transfer can never reach into anyone's principal
        stakingToken.safeTransfer(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }

    /// @notice Withdraw principal immediately, forfeiting unclaimed rewards
    /// and ignoring the lock. The escape hatch that stops a paused pool or a
    /// mis-set lock from trapping anyone's money.
    function emergencyWithdraw() external nonReentrant {
        Account storage a = accounts[msg.sender];
        uint256 amount = a.amount;
        require(amount > 0, "SectoraStaking: nothing staked");

        _update();
        _settle(msg.sender);

        uint256 forfeited = a.pending;
        stakerCount -= 1;
        a.amount = 0;
        a.pending = 0;
        a.rewardDebt = 0;
        totalStaked -= amount;

        // what they give up goes back to the pool, not to the owner
        if (forfeited > 0) rewardPool += forfeited;

        stakingToken.safeTransfer(msg.sender, amount);
        emit EmergencyWithdrawn(msg.sender, amount, forfeited);
    }

    // ---------------------------------------------------------------
    // reward pool
    // ---------------------------------------------------------------

    /// @notice Fund the reward pool. Open to anyone: this is where hash
    /// revenue is paid in, and there is no reason to restrict a donation.
    function fundRewards(uint256 amount) external nonReentrant {
        require(amount > 0, "SectoraStaking: amount is zero");
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
    /// the owner can never touch staked principal or rewards already booked
    /// to an account.
    function withdrawRewards(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "SectoraStaking: to is zero");
        _update();
        require(amount > 0 && amount <= rewardPool, "SectoraStaking: amount above pool");
        rewardPool -= amount;
        stakingToken.safeTransfer(to, amount);
        emit RewardsWithdrawn(to, amount, rewardPool);
    }

    /// @notice Recover the whole unallocated pool. Doing this through
    /// withdrawRewards is a trap: _update() shrinks rewardPool between the
    /// value being read off-chain and the check running, so passing the
    /// figure you just read always reverts by a hair. Here the amount is
    /// read after the update, inside the same call.
    function withdrawAllRewards(address to) external onlyOwner nonReentrant {
        require(to != address(0), "SectoraStaking: to is zero");
        _update();
        uint256 amount = rewardPool;
        require(amount > 0, "SectoraStaking: pool empty");
        rewardPool = 0;
        stakingToken.safeTransfer(to, amount);
        emit RewardsWithdrawn(to, amount, 0);
    }

    // ---------------------------------------------------------------
    // admin
    // ---------------------------------------------------------------

    function setRate(uint256 newRateBps) external onlyOwner {
        require(newRateBps <= MAX_RATE_BPS, "SectoraStaking: rate above max");
        _update(); // settle at the old rate before it changes
        uint256 old = rateBps;
        rateBps = newRateBps;
        emit RateChanged(old, newRateBps);
    }

    function setLockPeriod(uint256 newLockPeriod) external onlyOwner {
        uint256 old = lockPeriod;
        lockPeriod = newLockPeriod;
        emit LockPeriodChanged(old, newLockPeriod);
    }

    // ---------------------------------------------------------------
    // views for the interface
    // ---------------------------------------------------------------

    /// @notice Rewards an account could claim right now, including the
    /// window since the last write. This is what the UI polls.
    function earned(address who) external view returns (uint256) {
        Account storage a = accounts[who];
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
            uint256 unlocksAt,
            uint256 walletBalance,
            uint256 allowance
        )
    {
        Account storage a = accounts[who];
        staked = a.amount;
        pendingRewards = this.earned(who);
        unlocksAt = a.amount == 0 ? 0 : a.stakedAt + lockPeriod;
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
            uint256 lock,
            bool paused,
            uint256 stakers,
            uint256 chainTime
        )
    {
        // chainTime va aqui para que la interfaz compare el desbloqueo contra
        // el reloj de la cadena y no contra el del navegador, que pueden ir
        // muy separados
        return (totalStaked, rewardPool, rateBps, lockPeriod, accrualPaused, stakerCount, block.timestamp);
    }

    /// @notice Seconds the current pool can keep paying at the current rate
    /// and stake level. The honest version of an APY badge: it says how long
    /// the advertised rate is actually funded for.
    function runwaySeconds() external view returns (uint256) {
        if (totalStaked == 0 || rateBps == 0) return type(uint256).max;
        uint256 perSecond = (totalStaked * rateBps) / (BPS * YEAR);
        if (perSecond == 0) return type(uint256).max;
        return rewardPool / perSecond;
    }
}
