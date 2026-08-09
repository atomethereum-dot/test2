// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Sectora Validator Registry
/// @notice Real on-chain registry of testnet validator nodes. Anyone can
/// register a node with a self-reported location so the dashboard's node
/// map can plot genuine on-chain entries instead of simulated ones.
contract ValidatorRegistry is Ownable {
    struct Validator {
        address operator;
        string name;
        int32 latMicro; // latitude * 1e6
        int32 lonMicro; // longitude * 1e6
        uint64 registeredAt;
        bool active;
    }

    Validator[] public validators;
    mapping(address => uint256) public validatorIndexPlusOne; // 0 = not registered

    event ValidatorRegistered(address indexed operator, string name, int32 latMicro, int32 lonMicro, uint256 index);
    event ValidatorUpdated(address indexed operator, string name, int32 latMicro, int32 lonMicro);
    event ValidatorDeactivated(address indexed operator);
    event ValidatorReactivated(address indexed operator);

    constructor() Ownable(msg.sender) {}

    function register(string calldata name, int32 latMicro, int32 lonMicro) external {
        require(bytes(name).length > 0 && bytes(name).length <= 64, "ValidatorRegistry: bad name length");
        require(latMicro >= -90_000_000 && latMicro <= 90_000_000, "ValidatorRegistry: bad lat");
        require(lonMicro >= -180_000_000 && lonMicro <= 180_000_000, "ValidatorRegistry: bad lon");

        uint256 existing = validatorIndexPlusOne[msg.sender];
        if (existing != 0) {
            Validator storage v = validators[existing - 1];
            v.name = name;
            v.latMicro = latMicro;
            v.lonMicro = lonMicro;
            v.active = true;
            emit ValidatorUpdated(msg.sender, name, latMicro, lonMicro);
            return;
        }

        validators.push(
            Validator({
                operator: msg.sender,
                name: name,
                latMicro: latMicro,
                lonMicro: lonMicro,
                registeredAt: uint64(block.timestamp),
                active: true
            })
        );
        validatorIndexPlusOne[msg.sender] = validators.length;
        emit ValidatorRegistered(msg.sender, name, latMicro, lonMicro, validators.length - 1);
    }

    function deactivate() external {
        uint256 idx = validatorIndexPlusOne[msg.sender];
        require(idx != 0, "ValidatorRegistry: not registered");
        validators[idx - 1].active = false;
        emit ValidatorDeactivated(msg.sender);
    }

    function reactivate() external {
        uint256 idx = validatorIndexPlusOne[msg.sender];
        require(idx != 0, "ValidatorRegistry: not registered");
        validators[idx - 1].active = true;
        emit ValidatorReactivated(msg.sender);
    }

    function validatorCount() external view returns (uint256) {
        return validators.length;
    }

    function activeValidatorCount() external view returns (uint256 count) {
        uint256 len = validators.length;
        for (uint256 i = 0; i < len; i++) {
            if (validators[i].active) count++;
        }
    }

    function getValidators(uint256 offset, uint256 limit) external view returns (Validator[] memory page) {
        uint256 len = validators.length;
        if (offset >= len) return new Validator[](0);
        uint256 end = offset + limit;
        if (end > len) end = len;
        page = new Validator[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = validators[i];
        }
    }
}
