// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { Test } from "forge-std/src/Test.sol";
import { console2 } from "forge-std/src/console2.sol";
import { AMM } from "../src/AMM.sol";
import { LiquidityEngine } from "../src/LiquidityEngine.sol";
import { MockERC20 } from "src/mocks/MockERC20.sol";
import { IAMM } from "src/interfaces/IAMM.sol";

contract AMMTest is Test {
    AMM public amm;
    LiquidityEngine public liquidityEngine;
    MockERC20 public usdc;
    MockERC20 public upToken;
    MockERC20 public downToken;

    address constant OWNER = address(0xABC);
    address constant USER1 = address(0x123);
    address constant USER2 = address(0x456);
    address constant USER3 = address(0x789);

    uint256 constant TEN_THOUSAND = 10_000 * 1e18; // 10k tokens each
    uint256 constant FIVE_THOUSAND = 5000 * 1e18; // 5k tokens each
    uint256 constant SWAP_AMOUNT = 1000 * 1e18; // 1k tokens
    uint256 constant LP_AMOUNT = 1000 * 1e18; // 1k tokens each

    function setUp() public {
        // Deploy mock tokens
        usdc = new MockERC20("USDC", "USDC", 6);
        upToken = new MockERC20("UP Token", "UP", 18);
        downToken = new MockERC20("DOWN Token", "DOWN", 18);

        // deploy liquidity engine
        liquidityEngine = new LiquidityEngine(address(usdc), address(upToken), address(downToken), OWNER);

        // Deploy AMM
        amm = new AMM(address(upToken), address(downToken), OWNER, "UP-DOWN AMM");

        // Set AMM in LiquidityEngine
        vm.prank(OWNER);
        liquidityEngine.setAMMContract(address(amm));
        vm.stopPrank();

        // Mint initial up and down using liquidity engine
        vm.startPrank(USER1);
        // mint USDC
        usdc.mint(USER1, 2 * TEN_THOUSAND);
        usdc.approve(address(liquidityEngine), 2 * TEN_THOUSAND);
        liquidityEngine.mintTokens(2 * TEN_THOUSAND);

        // add initial liquidity to amm
        upToken.approve(address(amm), FIVE_THOUSAND);
        downToken.approve(address(amm), FIVE_THOUSAND);
        amm.addLiquidity(FIVE_THOUSAND, FIVE_THOUSAND);

        vm.stopPrank();
    }

    // ============ SWAP TESTS ============

    function test_SwapUpForDown() external {
        vm.startPrank(USER1);

        // Get initial balances
        uint256 initialUP = upToken.balanceOf(USER1);
        uint256 initialDOWN = downToken.balanceOf(USER1);
        uint256 initialUpReserves = amm.upReserves();
        uint256 initialDownReserves = amm.downReserves();

        // Approve swap
        upToken.approve(address(amm), SWAP_AMOUNT);

        // Calculate expected output
        uint256 expectedOutput = amm.getAmountOut(SWAP_AMOUNT, initialUpReserves, initialDownReserves);

        // Perform swap
        amm.swapUpForDown(SWAP_AMOUNT, 0);

        // Verify balances
        assertEq(upToken.balanceOf(USER1), initialUP - SWAP_AMOUNT, "UP tokens should be deducted");
        assertEq(downToken.balanceOf(USER1), initialDOWN + expectedOutput, "DOWN tokens should be received");

        // Verify reserves
        assertEq(amm.upReserves(), initialUpReserves + SWAP_AMOUNT, "UP reserves should increase");
        assertEq(amm.downReserves(), initialDownReserves - expectedOutput, "DOWN reserves should decrease");

        vm.stopPrank();
    }

    function test_SwapDownForUp() external {
        vm.startPrank(USER1);

        // Get initial balances
        uint256 initialUP = upToken.balanceOf(USER1);
        uint256 initialDOWN = downToken.balanceOf(USER1);
        uint256 initialUpReserves = amm.upReserves();
        uint256 initialDownReserves = amm.downReserves();

        // Approve swap
        downToken.approve(address(amm), SWAP_AMOUNT);

        // Calculate expected output
        uint256 expectedOutput = amm.getAmountOut(SWAP_AMOUNT, initialDownReserves, initialUpReserves);

        // Perform swap
        amm.swapDownForUp(SWAP_AMOUNT, 0);

        // Verify balances
        assertEq(downToken.balanceOf(USER1), initialDOWN - SWAP_AMOUNT, "DOWN tokens should be deducted");
        assertEq(upToken.balanceOf(USER1), initialUP + expectedOutput, "UP tokens should be received");

        // Verify reserves
        assertEq(amm.downReserves(), initialDownReserves + SWAP_AMOUNT, "DOWN reserves should increase");
        assertEq(amm.upReserves(), initialUpReserves - expectedOutput, "UP reserves should decrease");

        vm.stopPrank();
    }

    function test_SwapWithSlippageProtection() external {
        vm.startPrank(USER1);

        // Approve swap
        upToken.approve(address(amm), SWAP_AMOUNT);

        // Calculate expected output
        uint256 expectedOutput = amm.getAmountOut(SWAP_AMOUNT, amm.upReserves(), amm.downReserves());

        // Set minimum output higher than expected (should fail)
        uint256 minOutput = expectedOutput + 1;

        vm.expectRevert(IAMM.SlippageExceeded.selector);
        amm.swapUpForDown(SWAP_AMOUNT, minOutput);

        vm.stopPrank();
    }

    function test_SwapWithMaxTradeSize() external {
        vm.startPrank(USER1);

        // Add initial liquidity
        upToken.approve(address(amm), type(uint256).max);
        downToken.approve(address(amm), type(uint256).max);
        amm.addLiquidity(TEN_THOUSAND, TEN_THOUSAND);

        // Try to swap more than max trade size
        uint256 largeAmount = amm.MAX_TRADE_SIZE() + 1;
        upToken.approve(address(amm), largeAmount);

        vm.expectRevert(IAMM.InvalidAmount.selector);
        amm.swapUpForDown(largeAmount, 0);

        vm.stopPrank();
    }

    function test_SwapWithZeroAmount() external {
        vm.startPrank(USER1);

        // Add initial liquidity
        upToken.approve(address(amm), type(uint256).max);
        downToken.approve(address(amm), type(uint256).max);
        amm.addLiquidity(TEN_THOUSAND, TEN_THOUSAND);

        vm.expectRevert(IAMM.InvalidAmount.selector);
        amm.swapUpForDown(0, 0);

        vm.stopPrank();
    }

    // ============ LIQUIDITY PROVISION TESTS ============

    function test_AddLiquidity() external {
        vm.startPrank(USER1);

        uint256 initialLP = amm.balanceOf(USER1);
        uint256 initialUpReserves = amm.upReserves();
        uint256 initialDownReserves = amm.downReserves();

        // Approve tokens
        upToken.approve(address(amm), type(uint256).max);
        downToken.approve(address(amm), type(uint256).max);

        // Add liquidity
        uint256 lpTokens = amm.addLiquidity(LP_AMOUNT, LP_AMOUNT);

        // Verify LP tokens minted
        assertGt(lpTokens, 0, "LP tokens should be minted");
        assertEq(amm.balanceOf(USER1), initialLP + lpTokens, "LP balance should increase");

        // Verify reserves increased
        assertEq(amm.upReserves(), initialUpReserves + LP_AMOUNT, "UP reserves should increase");
        assertEq(amm.downReserves(), initialDownReserves + LP_AMOUNT, "DOWN reserves should increase");

        vm.stopPrank();
    }

    function test_AddLiquidityFirstTime() external {
        vm.startPrank(USER1);

        // Approve tokens
        upToken.approve(address(amm), type(uint256).max);
        downToken.approve(address(amm), type(uint256).max);

        // Add liquidity for the first time
        uint256 lpTokens = amm.addLiquidity(LP_AMOUNT, LP_AMOUNT);

        // For first liquidity, LP tokens should be sqrt(amount1 * amount2)
        uint256 expectedLP = sqrt(LP_AMOUNT * LP_AMOUNT);
        assertEq(lpTokens, expectedLP, "First LP tokens should be sqrt of product");

        vm.stopPrank();
    }

    function test_AddLiquidityWithZeroAmount() external {
        vm.startPrank(USER1);

        upToken.approve(address(amm), type(uint256).max);
        downToken.approve(address(amm), type(uint256).max);

        vm.expectRevert(IAMM.InvalidAmount.selector);
        amm.addLiquidity(0, LP_AMOUNT);

        vm.stopPrank();
    }

    function test_RemoveLiquidity() external {
        vm.startPrank(USER1);

        // Get initial balances
        uint256 initialUP = upToken.balanceOf(USER1);
        uint256 initialDOWN = downToken.balanceOf(USER1);
        uint256 initialUpReserves = amm.upReserves();
        uint256 initialDownReserves = amm.downReserves();

        // Remove half of liquidity
        uint256 removeAmount = amm.balanceOf(USER1) / 2;
        (uint256 upReceived, uint256 downReceived) = amm.removeLiquidity(removeAmount);

        // Verify tokens received
        assertGt(upReceived, 0, "UP tokens should be received");
        assertGt(downReceived, 0, "DOWN tokens should be received");

        // Verify balances
        assertEq(upToken.balanceOf(USER1), initialUP + upReceived, "UP balance should increase");
        assertEq(downToken.balanceOf(USER1), initialDOWN + downReceived, "DOWN balance should increase");

        // Verify reserves decreased
        assertEq(amm.upReserves(), initialUpReserves - upReceived, "UP reserves should decrease");
        assertEq(amm.downReserves(), initialDownReserves - downReceived, "DOWN reserves should decrease");

        vm.stopPrank();
    }

    function test_RemoveLiquidityWithZeroAmount() external {
        vm.startPrank(USER1);

        vm.expectRevert(IAMM.InvalidAmount.selector);
        amm.removeLiquidity(0);

        vm.stopPrank();
    }

    function test_RemoveLiquidityMoreThanOwned() external {
        vm.startPrank(USER1);

        uint256 balance = amm.balanceOf(USER1);

        vm.expectRevert(IAMM.InvalidAmount.selector);
        amm.removeLiquidity(balance + 1);

        vm.stopPrank();
    }

    // ============ CALCULATION TESTS ============

    function test_GetAmountOutCalculation() external {
        vm.startPrank(USER1);

        // Add initial liquidity
        upToken.approve(address(amm), type(uint256).max);
        downToken.approve(address(amm), type(uint256).max);
        amm.addLiquidity(TEN_THOUSAND, TEN_THOUSAND);

        uint256 amountIn = 1000 * 1e18;
        uint256 reserveIn = amm.upReserves();
        uint256 reserveOut = amm.downReserves();

        uint256 amountOut = amm.getAmountOut(amountIn, reserveIn, reserveOut);

        // Verify amount out is less than amount in due to fees
        assertLt(amountOut, amountIn, "Amount out should be less than amount in due to fees");
        assertGt(amountOut, 0, "Amount out should be positive");

        vm.stopPrank();
    }

    function test_GetAmountInCalculation() external {
        vm.startPrank(USER1);

        // Add initial liquidity
        upToken.approve(address(amm), type(uint256).max);
        downToken.approve(address(amm), type(uint256).max);
        amm.addLiquidity(TEN_THOUSAND, TEN_THOUSAND);

        uint256 amountOut = 1000 * 1e18;
        uint256 reserveIn = amm.upReserves();
        uint256 reserveOut = amm.downReserves();

        uint256 amountIn = amm.getAmountIn(amountOut, reserveIn, reserveOut);

        // Verify amount in is greater than amount out due to fees
        assertGt(amountIn, amountOut, "Amount in should be greater than amount out due to fees");
        assertGt(amountIn, 0, "Amount in should be positive");

        vm.stopPrank();
    }

    function test_PriceCalculations() external {
        vm.startPrank(USER1);

        uint256 upPrice = amm.getUpPrice();
        uint256 downPrice = amm.getDownPrice();

        // Prices should be reciprocal (approximately)
        assertApproxEqRel(upPrice * downPrice, 1e36, 0.01e18, "Prices should be reciprocal");

        vm.stopPrank();
    }

    // ============ INTEGRATION TESTS ============

    function test_MultipleUsersSwapping() external {
        // User2 swaps UP for DOWN
        vm.startPrank(USER2);

        // mint UP and DOWN tokens
        usdc.mint(USER2, 2 * TEN_THOUSAND);
        usdc.approve(address(liquidityEngine), 2 * TEN_THOUSAND);
        liquidityEngine.mintTokens(2 * TEN_THOUSAND);

        upToken.approve(address(amm), SWAP_AMOUNT);
        amm.swapUpForDown(SWAP_AMOUNT, 0);
        vm.stopPrank();

        // User3 swaps DOWN for UP
        vm.startPrank(USER3);

        // mint UP and DOWN tokens
        usdc.mint(USER3, 2 * TEN_THOUSAND);
        usdc.approve(address(liquidityEngine), 2 * TEN_THOUSAND);
        liquidityEngine.mintTokens(2 * TEN_THOUSAND);

        downToken.approve(address(amm), SWAP_AMOUNT);
        amm.swapDownForUp(SWAP_AMOUNT, 0);
        vm.stopPrank();

        // Verify all users have tokens
        assertGt(upToken.balanceOf(USER2), 0, "User2 should have UP tokens");
        assertGt(downToken.balanceOf(USER2), 0, "User2 should have DOWN tokens");
        assertGt(upToken.balanceOf(USER3), 0, "User3 should have UP tokens");
        assertGt(downToken.balanceOf(USER3), 0, "User3 should have DOWN tokens");
    }

    function test_PriceImpact() external {
        vm.startPrank(USER1);

        // Get initial price
        uint256 initialPrice = amm.getUpPrice();

        // Make a large swap
        uint256 largeSwap = 5000 * 1e18;
        upToken.approve(address(amm), largeSwap);
        amm.swapUpForDown(largeSwap, 0);

        // Get new price
        uint256 newPrice = amm.getUpPrice();

        // Price should have changed due to large swap
        assertTrue(initialPrice != newPrice, "Price should change after large swap");

        vm.stopPrank();
    }

    // ============ HELPER FUNCTIONS ============

    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;

        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
