// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Mock de 6 decimales — SOLO PARA PRUEBAS
/// @notice No se despliega en ninguna red. Existe para comprobar que la
/// interfaz lee decimals() del token en vez de dar 18 por sentado: con un
/// token de 6 decimales, ese error seria de un factor de 10^12.
contract MockToken6 is ERC20 {
    constructor(uint256 initialSupply) ERC20("Mock Six", "M6") {
        _mint(msg.sender, initialSupply);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
