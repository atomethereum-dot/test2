// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Sectora Testnet Token (test #SECT)
/// @notice ERC-20 test token for the Sectora testnet. Anyone can claim a
/// fixed amount from the faucet once per cooldown window so the dashboard
/// and staking contract have real, transferable balances to work with.
/// Burnable so the hash market can retire the 80% buyback share for real.
contract SectoraToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant FAUCET_AMOUNT = 5_000 ether;
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    mapping(address => uint256) public lastFaucetClaim;

    event FaucetClaimed(address indexed account, uint256 amount);

    constructor(uint256 initialSupply) ERC20("Sectora Testnet Token", "tSECT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    function faucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "SectoraToken: faucet cooldown active"
        );
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
