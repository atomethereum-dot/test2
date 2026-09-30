// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)


/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// OpenZeppelin Contracts (last updated v5.5.0) (token/ERC20/utils/SafeERC20.sol)


// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC1363.sol)


// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC20.sol)




// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC165.sol)


// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)


/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}





/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}



/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        if (!_safeTransfer(token, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        if (!_safeTransferFrom(token, from, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _safeTransfer(token, to, value, false);
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _safeTransferFrom(token, from, to, value, false);
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        if (!_safeApprove(token, spender, value, false)) {
            if (!_safeApprove(token, spender, 0, true)) revert SafeERC20FailedOperation(address(token));
            if (!_safeApprove(token, spender, value, true)) revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that relies on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that relies on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
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

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Oppositely, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity `token.transfer(to, value)` call, relaxing the requirement on the return value: the
     * return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param to The recipient of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeTransfer(IERC20 token, address to, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.transfer.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(to, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }

    /**
     * @dev Imitates a Solidity `token.transferFrom(from, to, value)` call, relaxing the requirement on the return
     * value: the return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param from The sender of the tokens
     * @param to The recipient of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
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
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
            mstore(0x60, 0)
        }
    }

    /**
     * @dev Imitates a Solidity `token.approve(spender, value)` call, relaxing the requirement on the return value:
     * the return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param spender The spender of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeApprove(IERC20 token, address spender, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.approve.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(spender, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }
}


// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)


// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)


/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
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



/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// OpenZeppelin Contracts (last updated v5.5.0) (utils/ReentrancyGuard.sol)


// OpenZeppelin Contracts (last updated v5.1.0) (utils/StorageSlot.sol)
// This file was procedurally generated from scripts/generate/templates/StorageSlot.js.


/**
 * @dev Library for reading and writing primitive types to specific storage slots.
 *
 * Storage slots are often used to avoid storage conflict when dealing with upgradeable contracts.
 * This library helps with reading and writing to such slots without the need for inline assembly.
 *
 * The functions in this library return Slot structs that contain a `value` member that can be used to read or write.
 *
 * Example usage to set ERC-1967 implementation slot:
 * ```solidity
 * contract ERC1967 {
 *     // Define the slot. Alternatively, use the SlotDerivation library to derive the slot.
 *     bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
 *
 *     function _getImplementation() internal view returns (address) {
 *         return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
 *     }
 *
 *     function _setImplementation(address newImplementation) internal {
 *         require(newImplementation.code.length > 0);
 *         StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
 *     }
 * }
 * ```
 *
 * TIP: Consider using this library along with {SlotDerivation}.
 */
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

    /**
     * @dev Returns an `AddressSlot` with member `value` located at `slot`.
     */
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Int256Slot` with member `value` located at `slot`.
     */
    function getInt256Slot(bytes32 slot) internal pure returns (Int256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `StringSlot` with member `value` located at `slot`.
     */
    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` representation of the string storage pointer `store`.
     */
    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }

    /**
     * @dev Returns a `BytesSlot` with member `value` located at `slot`.
     */
    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` representation of the bytes storage pointer `store`.
     */
    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }
}



/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 *
 * IMPORTANT: Deprecated. This storage-based reentrancy guard will be removed and replaced
 * by the {ReentrancyGuardTransient} variant in v6.0.
 *
 * @custom:stateless
 */
abstract contract ReentrancyGuard {
    using StorageSlot for bytes32;

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    /**
     * @dev A `view` only version of {nonReentrant}. Use to block view functions
     * from being called, preventing reading from inconsistent contract state.
     *
     * CAUTION: This is a "view" modifier and does not change the reentrancy
     * status. Use it only on view functions. For payable or non-payable functions,
     * use the standard {nonReentrant} modifier instead.
     */
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
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        _nonReentrantBeforeView();

        // Any calls to nonReentrant after this point will fail
        _reentrancyGuardStorageSlot().getUint256Slot().value = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().getUint256Slot().value == ENTERED;
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
}



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


