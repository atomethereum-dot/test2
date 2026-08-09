// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Sectora Testnet Staking
/// @notice Real on-chain staking for the Sectora test token. Rewards accrue
/// continuously against a reward rate the owner funds and sets, using the
/// standard reward-per-token accumulator pattern (no unbounded loops).
contract SectoraStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakeToken;

    uint256 public rewardRate; // reward tokens per second, scaled by 1e18
    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;
    uint256 public totalStaked;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 rewardRate);

    constructor(address _stakeToken) Ownable(msg.sender) {
        stakeToken = IERC20(_stakeToken);
        lastUpdateTime = block.timestamp;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;
        uint256 elapsed = block.timestamp - lastUpdateTime;
        return rewardPerTokenStored + (elapsed * rewardRate * 1e18) / totalStaked;
    }

    function earned(address account) public view returns (uint256) {
        return
            (stakedBalance[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) /
            1e18 +
            rewards[account];
    }

    /// @notice Approximate current APY in basis points, derived from the
    /// live reward rate and total staked (0 when nothing is staked yet).
    function currentApyBps() external view returns (uint256) {
        if (totalStaked == 0) return 0;
        uint256 yearlyRewards = rewardRate * 365 days;
        return (yearlyRewards * 10000) / totalStaked;
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "SectoraStaking: amount must be > 0");
        totalStaked += amount;
        stakedBalance[msg.sender] += amount;
        stakeToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0 && amount <= stakedBalance[msg.sender], "SectoraStaking: invalid amount");
        totalStaked -= amount;
        stakedBalance[msg.sender] -= amount;
        stakeToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function claimReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            stakeToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function exit() external {
        unstake(stakedBalance[msg.sender]);
        claimReward();
    }

    /// @notice Sets the reward rate (tokens/second). Owner must ensure the
    /// contract holds enough stakeToken balance to cover future payouts.
    function setRewardRate(uint256 _rewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }

    /// @notice Convenience setter: pass a target APY in basis points and a
    /// reference stake amount, and the contract derives the matching
    /// per-second reward rate.
    function setApyBps(uint256 apyBps, uint256 referenceStake) external onlyOwner updateReward(address(0)) {
        require(referenceStake > 0, "SectoraStaking: referenceStake must be > 0");
        uint256 yearlyRewards = (referenceStake * apyBps) / 10000;
        rewardRate = yearlyRewards / 365 days;
        emit RewardRateUpdated(rewardRate);
    }

    /// @notice Owner tops up the contract's reward reserve.
    function fundRewards(uint256 amount) external onlyOwner {
        stakeToken.safeTransferFrom(msg.sender, address(this), amount);
    }
}
