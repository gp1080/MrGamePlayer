// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MGPTokenFixed.sol";

/**
 * @title ReentrancyAttacker
 * @notice Malicious contract to test reentrancy protection
 * @dev This contract attempts to re-enter sellTokens() to drain MATIC
 */
contract ReentrancyAttacker {
    MGPTokenFixed public token;
    bool public attacking;

    constructor(address _tokenAddress) {
        token = MGPTokenFixed(payable(_tokenAddress));
    }

    /**
     * @notice Attempts to re-enter sellTokens() during the external call
     */
    function attack(uint256 amount) external {
        attacking = true;
        token.sellTokens(amount);
        attacking = false;
    }

    /**
     * @notice This function is called when MATIC is sent to this contract
     * @dev Attempts to re-enter sellTokens() if attacking flag is set
     */
    receive() external payable {
        if (attacking) {
            // Try to re-enter - this should fail with ReentrancyGuard
            // We need to check if we have tokens and MATIC in contract
            uint256 balance = token.balanceOf(address(this));
            if (balance >= 1 * 10**18) { // At least 1 MGP (minimum sell)
                // This re-entrant call should be blocked by ReentrancyGuard
                token.sellTokens(1 * 10**18);
            }
        }
    }
}

