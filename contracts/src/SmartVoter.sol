// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ILiquidityEngine } from "./interfaces/ILiquidityEngine.sol";
import { IAMM } from "./interfaces/IAMM.sol";

/**
 * @title SmartVoter
 * @dev Custom smart account implementation for batching opinion market transactions
 *
 * This contract enables users to perform the complete opinion market flow in a single transaction:
 * 1. Approve USDC for LiquidityEngine
 * 2. Mint UP&DOWN tokens
 * 3. Approve UP or DOWN token for AMM
 * 4. Swap tokens to get desired position
 */
contract SmartVoter {
    // Errors
    error InsufficientUSDC();
    error InvalidAmount();
    error SwapFailed();
    error BurnFailed();

    constructor() { }

    /**
     * @dev Enter the opinion market with a single transaction (EIP-7702 batch)
     * @param usdc USDC token contract
     * @param liquidityEngine LiquidityEngine contract
     * @param amm AMM contract
     * @param up True for UP position, false for DOWN position
     * @param usdcAmount Amount of USDC to stake
     * @param minAmountOut Minimum amount of final tokens to receive (slippage protection)
     */
    function enterMarket(
        IERC20 usdc,
        ILiquidityEngine liquidityEngine,
        IAMM amm,
        bool up,
        uint256 usdcAmount,
        uint256 minAmountOut
    )
        external
    {
        if (usdcAmount == 0) revert InvalidAmount();
        if (usdc.balanceOf(address(this)) < usdcAmount) revert InsufficientUSDC();

        // 1. Approve USDC for LiquidityEngine
        usdc.approve(address(liquidityEngine), usdcAmount);

        // 2. Mint UP&DOWN tokens
        liquidityEngine.mintTokens(usdcAmount);

        // Calculate token amount (1 USDC = 1 UP + 1 DOWN, each at 1e18 decimals)
        uint256 tokenAmount = (usdcAmount * 1e12) / 2; // Convert from 6 to 18 decimals and divide by 2

        if (up) {
            // For UP position: swap DOWN for UP to keep UP tokens
            // 3. Approve UP tokens for AMM
            IERC20 downToken = amm.downToken();
            downToken.approve(address(amm), tokenAmount);

            // 4. Swap DOWN for UP (keep UP tokens)
            amm.swapDownForUp(tokenAmount, minAmountOut);
        } else {
            // For DOWN position: swap UP for DOWN to keep DOWN tokens
            // 3. Approve DOWN tokens for AMM
            IERC20 upToken = amm.upToken();
            upToken.approve(address(amm), tokenAmount);

            // 4. Swap UP for DOWN (keep DOWN tokens)
            amm.swapUpForDown(tokenAmount, minAmountOut);
        }
    }

    /**
     * @dev Exit the opinion market position
     * @param liquidityEngine LiquidityEngine contract
     * @param amm AMM contract
     * @param burnAmount Amount of tokens to burn
     * @param up True if burning UP tokens, false for DOWN tokens
     */
    function exitMarket(ILiquidityEngine liquidityEngine, IAMM amm, uint256 burnAmount, bool up) external {
        if (burnAmount == 0) revert InvalidAmount();

        // Get token contract
        IERC20 voteToken = up ? amm.upToken() : amm.downToken();

        // Check if we have enough tokens
        if (voteToken.balanceOf(address(this)) < burnAmount) revert InvalidAmount();

        // 1. Approve tokens for LiquidityEngine
        voteToken.approve(address(liquidityEngine), burnAmount);

        // 2. Burn tokens for USDC
        if (up) {
            liquidityEngine.burnTokens(burnAmount, 0);
        } else {
            liquidityEngine.burnTokens(0, burnAmount);
        }
    }

    // Allow contract to receive ETH
    receive() external payable { }
}
