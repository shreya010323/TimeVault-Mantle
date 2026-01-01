// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * TimeVault Bank (Timelock Savings)
 * - Supports ETH and ERC20 deposits
 * - Each deposit has its own unlock time
 * - No early withdrawals
 * - Handles fee-on-transfer tokens by measuring actual received amount
 * - Reentrancy-safe
 *
 * Tested with OpenZeppelin v5 imports; if your Remix uses OZ v4.9, change
 *   import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
 * to
 *   import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// OZ v5 path:
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PiggyBankTimelock is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Constants (tweak if you like)
    uint64 public constant MIN_LOCK_SECONDS = 60;          // 1 minute (for demos)
    uint64 public constant MAX_LOCK_SECONDS = 365 days;    // 1 year

    // address(0) denotes native ETH deposits
    address public constant NATIVE_TOKEN = address(0);

    // Custom errors (gas-efficient)
    error InvalidLockDuration();
    error ZeroAmount();
    error IndexOutOfBounds();
    error AlreadyWithdrawn();
    error NotMatured();
    error DirectETHNotAllowed();

    event Deposited(
        address indexed user,
        uint256 indexed index,
        address indexed token,
        uint256 amount,
        uint64 unlockTime
    );

    event Withdrawn(
        address indexed user,
        uint256 indexed index,
        address indexed token,
        uint256 amount
    );

    struct Deposit {
        address token;       // token address; address(0) for ETH
        uint256 amount;      // exact amount locked (handles fee-on-transfer)
        uint64  unlockTime;  // unix timestamp
        bool    withdrawn;   // true if withdrawn
    }

    // User => list of deposits
    mapping(address => Deposit[]) private _deposits;

    // ----------- Public views -----------

    function depositsLength(address user) external view returns (uint256) {
        return _deposits[user].length;
    }

    function getDeposit(address user, uint256 index)
        external
        view
        returns (address token, uint256 amount, uint64 unlockTime, bool withdrawn)
    {
        if (index >= _deposits[user].length) revert IndexOutOfBounds();
        Deposit storage d = _deposits[user][index];
        return (d.token, d.amount, d.unlockTime, d.withdrawn);
    }

    function isMatured(address user, uint256 index) external view returns (bool) {
        if (index >= _deposits[user].length) revert IndexOutOfBounds();
        return block.timestamp >= _deposits[user][index].unlockTime && !_deposits[user][index].withdrawn;
    }

    // ----------- ETH deposit -----------

    function depositETH(uint64 lockDurationSeconds) external payable returns (uint256 index) {
        if (lockDurationSeconds < MIN_LOCK_SECONDS || lockDurationSeconds > MAX_LOCK_SECONDS) {
            revert InvalidLockDuration();
        }
        if (msg.value == 0) revert ZeroAmount();

        uint64 unlock = uint64(block.timestamp) + lockDurationSeconds;

        _deposits[msg.sender].push(
            Deposit({
                token: NATIVE_TOKEN,
                amount: msg.value,
                unlockTime: unlock,
                withdrawn: false
            })
        );

        index = _deposits[msg.sender].length - 1;
        emit Deposited(msg.sender, index, NATIVE_TOKEN, msg.value, unlock);
    }

    // Reject plain ETH transfers (forces users to use depositETH)
    receive() external payable {
        revert DirectETHNotAllowed();
    }
    fallback() external payable {
        if (msg.value > 0) revert DirectETHNotAllowed();
    }

    // ----------- ERC20 deposit -----------

    function depositToken(address token, uint256 amount, uint64 lockDurationSeconds)
        external
        returns (uint256 index)
    {
        if (token == NATIVE_TOKEN) revert ZeroAmount(); // must be ERC20
        if (lockDurationSeconds < MIN_LOCK_SECONDS || lockDurationSeconds > MAX_LOCK_SECONDS) {
            revert InvalidLockDuration();
        }
        if (amount == 0) revert ZeroAmount();

        IERC20 erc = IERC20(token);
        uint256 beforeBal = erc.balanceOf(address(this));
        erc.safeTransferFrom(msg.sender, address(this), amount);
        uint256 afterBal = erc.balanceOf(address(this));

        uint256 received = afterBal - beforeBal; // handles fee-on-transfer tokens
        if (received == 0) revert ZeroAmount();

        uint64 unlock = uint64(block.timestamp) + lockDurationSeconds;

        _deposits[msg.sender].push(
            Deposit({
                token: token,
                amount: received,
                unlockTime: unlock,
                withdrawn: false
            })
        );

        index = _deposits[msg.sender].length - 1;
        emit Deposited(msg.sender, index, token, received, unlock);
    }

    // ----------- Withdraw -----------

    function withdraw(uint256 index) public nonReentrant {
        if (index >= _deposits[msg.sender].length) revert IndexOutOfBounds();

        Deposit storage d = _deposits[msg.sender][index];
        if (d.withdrawn) revert AlreadyWithdrawn();
        if (block.timestamp < d.unlockTime) revert NotMatured();

        // Effects first (reentrancy-safe)
        d.withdrawn = true;
        uint256 amt = d.amount;
        d.amount = 0;

        // Interactions
        if (d.token == NATIVE_TOKEN) {
            (bool ok, ) = payable(msg.sender).call{value: amt}("");
            require(ok, "ETH transfer failed");
        } else {
            IERC20(d.token).safeTransfer(msg.sender, amt);
        }

        emit Withdrawn(msg.sender, index, d.token, amt);
    }

    /// Convenience: withdraw multiple matured deposits in one tx (pass your indices).
    function withdrawBatch(uint256[] calldata indices) external {
        uint256 len = indices.length;
        for (uint256 i = 0; i < len; i++) {
            withdraw(indices[i]);
        }
    }
}
