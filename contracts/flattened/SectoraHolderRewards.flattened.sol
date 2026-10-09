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


// OpenZeppelin Contracts (last updated v5.1.0) (access/Ownable2Step.sol)


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



/**
 * @dev Contract module which provides access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This extension of the {Ownable} contract includes a two-step mechanism to transfer
 * ownership, where the new owner must call {acceptOwnership} in order to replace the
 * old one. This can help prevent common mistakes, such as transfers of ownership to
 * incorrect accounts, or to contracts that are unable to interact with the
 * permission system.
 *
 * The initial owner is specified at deployment time in the constructor for `Ownable`. This
 * can later be changed with {transferOwnership} and {acceptOwnership}.
 *
 * This module is used through inheritance. It will make available all functions
 * from parent (Ownable).
 */
abstract contract Ownable2Step is Ownable {
    address private _pendingOwner;

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Returns the address of the pending owner.
     */
    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    /**
     * @dev Starts the ownership transfer of the contract to a new account. Replaces the pending transfer if there is one.
     * Can only be called by the current owner.
     *
     * Setting `newOwner` to the zero address is allowed; this can be used to cancel an initiated ownership transfer.
     */
    function transferOwnership(address newOwner) public virtual override onlyOwner {
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner(), newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`) and deletes any pending owner.
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual override {
        delete _pendingOwner;
        super._transferOwnership(newOwner);
    }

    /**
     * @dev The new owner accepts the ownership transfer.
     */
    function acceptOwnership() public virtual {
        address sender = _msgSender();
        if (pendingOwner() != sender) {
            revert OwnableUnauthorizedAccount(sender);
        }
        _transferOwnership(sender);
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


