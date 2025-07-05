// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { Test } from "forge-std/src/Test.sol";
import { console2 } from "forge-std/src/console2.sol";
import { LiquidityEngine } from "../src/LiquidityEngine.sol";
import { AMM } from "../src/AMM.sol";
import { MockERC20 } from "src/mocks/MockERC20.sol";
import { ILiquidityEngine } from "../src/interfaces/ILiquidityEngine.sol";

contract LiquidityEngineTest is Test {
    LiquidityEngine public liquidityEngine;
    AMM public amm;
    MockERC20 public usdc;
    MockERC20 public upToken;
    MockERC20 public downToken;

    address constant OWNER = address(0xABC);
    address constant USER1 = address(0x123);
    address constant USER2 = address(0x456);

    uint256 constant INITIAL_BALANCE = 10_000 * 1e6; // 10k USDC
    uint256 constant ONE_THOUSAND = 1000 * 1e6; // 1k USDC

    function setUp() public {
        // Deploy mock tokens
        usdc = new MockERC20("USD Coin", "USDC", 6);
        upToken = new MockERC20("UP Token", "UP", 18);
        downToken = new MockERC20("DOWN Token", "DOWN", 18);

        // Deploy AMM
        amm = new AMM(address(upToken), address(downToken), OWNER, "UP-DOWN AMM");

        // Deploy LiquidityEngine
        liquidityEngine = new LiquidityEngine(address(usdc), address(upToken), address(downToken), OWNER);

        // Set AMM in LiquidityEngine
        vm.prank(OWNER);
        liquidityEngine.setAMMContract(address(amm));

        // Mint initial USDC balances to users
        usdc.mint(USER1, INITIAL_BALANCE);
        usdc.mint(USER2, INITIAL_BALANCE);
    }

    // ============ MINTING TESTS ============

    function test_MintTokensAtFixedPrice() external {
        vm.startPrank(USER1);

        uint256 initialUSDC = usdc.balanceOf(USER1);
        uint256 initialUP = upToken.balanceOf(USER1);
        uint256 initialDOWN = downToken.balanceOf(USER1);

        // Approve USDC spending
        usdc.approve(address(liquidityEngine), ONE_THOUSAND);

        // Mint tokens
        liquidityEngine.mintTokens(ONE_THOUSAND);

        uint256 expectedTokenAmount = ONE_THOUSAND * 1e12 / 2;

        // Verify balances
        assertEq(usdc.balanceOf(USER1), initialUSDC - ONE_THOUSAND, "USDC should be deducted");
        assertEq(upToken.balanceOf(USER1), initialUP + expectedTokenAmount, "UP tokens should be minted");
        assertEq(downToken.balanceOf(USER1), initialDOWN + expectedTokenAmount, "DOWN tokens should be minted");

        vm.stopPrank();
    }

    function test_MintTokensWithZeroAmount() external {
        vm.startPrank(USER1);
        usdc.approve(address(liquidityEngine), 0);

        vm.expectRevert(ILiquidityEngine.InvalidAmount.selector);
        liquidityEngine.mintTokens(0);

        vm.stopPrank();
    }

    function test_MintTokensWithoutApproval() external {
        vm.startPrank(USER1);

        vm.expectRevert();
        liquidityEngine.mintTokens(ONE_THOUSAND);

        vm.stopPrank();
    }

    // ============ BURNING TESTS ============

    function test_BurnTokensAtAMMPrice() external {
        // First mint tokens through the LiquidityEngine
        vm.startPrank(USER1);
        usdc.approve(address(liquidityEngine), ONE_THOUSAND);
        liquidityEngine.mintTokens(ONE_THOUSAND); // Results in 500 UP and 500 DOWN tokens

        // Add initial liquidity to AMM to ensure price is nonzero
        uint256 liquidityAmount = 100 * 1e18;
        upToken.approve(address(amm), liquidityAmount);
        downToken.approve(address(amm), liquidityAmount);
        amm.addLiquidity(liquidityAmount, liquidityAmount);

        // swap some tokens to the AMM to ensure price changes
        uint256 swapAmount = 10 * 1e18;
        upToken.approve(address(amm), swapAmount);
        amm.swapUpForDown(swapAmount, 0);

        // Get remaining UP balance
        uint256 upBalance = upToken.balanceOf(USER1);
        upToken.approve(address(liquidityEngine), upBalance);

        uint256 usdcBalanceBefore = usdc.balanceOf(USER1);

        liquidityEngine.burnTokens(100 * 1e18, 0);

        uint256 usdcBalanceAfter = usdc.balanceOf(USER1);

        // test that it received less than 100 USDC
        assertGt(usdcBalanceAfter, usdcBalanceBefore, "USDC should be received");
        assertLt(usdcBalanceAfter - usdcBalanceBefore, 100 * 1e6, "USDC should be received");

        vm.stopPrank();
    }

    function test_BurnBothTokens() external {
        // First mint tokens through the LiquidityEngine
        vm.startPrank(USER1);
        usdc.approve(address(liquidityEngine), ONE_THOUSAND);
        liquidityEngine.mintTokens(ONE_THOUSAND);

        // Add initial liquidity to AMM to ensure price is nonzero
        uint256 liquidityAmount = 100 * 1e18;
        upToken.approve(address(amm), liquidityAmount);
        downToken.approve(address(amm), liquidityAmount);
        amm.addLiquidity(liquidityAmount, liquidityAmount);

        // swap some tokens to the AMM to ensure price changes
        uint256 swapAmount = 10 * 1e18;
        upToken.approve(address(amm), swapAmount);
        amm.swapUpForDown(swapAmount, 0);

        // Get actual token balances after minting
        uint256 upBalance = upToken.balanceOf(USER1);
        uint256 downBalance = downToken.balanceOf(USER1);

        // Approve the actual balances
        upToken.approve(address(liquidityEngine), upBalance);
        downToken.approve(address(liquidityEngine), downBalance);

        uint256 burnDownAmount = 100 * 1e18;
        uint256 burnUpAmount = 100 * 1e18;

        uint256 usdcBalanceBefore = usdc.balanceOf(USER1);

        liquidityEngine.burnTokens(burnUpAmount, burnDownAmount);

        uint256 usdcBalanceAfter = usdc.balanceOf(USER1);
        assertGt(usdcBalanceAfter, usdcBalanceBefore, "USDC should be received");

        // Verify tokens were burned
        assertEq(upToken.balanceOf(USER1), upBalance - burnUpAmount, "All UP tokens should be burned");
        assertEq(downToken.balanceOf(USER1), downBalance - burnDownAmount, "All DOWN tokens should be burned");

        vm.stopPrank();
    }

    function test_BurnTokensWithoutAMM() external {
        // Deploy new LiquidityEngine without AMM
        LiquidityEngine newEngine = new LiquidityEngine(address(usdc), address(upToken), address(downToken), OWNER);

        vm.startPrank(USER1);
        usdc.approve(address(newEngine), ONE_THOUSAND);
        newEngine.mintTokens(ONE_THOUSAND);

        upToken.approve(address(newEngine), 100 * 1e18);
        downToken.approve(address(newEngine), 100 * 1e18);

        vm.expectRevert(ILiquidityEngine.AMMNotSet.selector);
        newEngine.burnTokens(100 * 1e18, 100 * 1e18);

        vm.stopPrank();
    }

    function test_BurnTokensWithZeroAmounts() external {
        vm.startPrank(USER1);

        vm.expectRevert(ILiquidityEngine.InvalidAmount.selector);
        liquidityEngine.burnTokens(0, 0);

        vm.stopPrank();
    }

    // ============ ADMIN TESTS ============

    function test_SetAMMContract() external {
        address newAMM = address(0x999);

        vm.prank(OWNER);
        liquidityEngine.setAMMContract(newAMM);

        assertEq(liquidityEngine.ammContract(), newAMM, "AMM should be updated");
    }

    function test_SetAMMContractByNonOwner() external {
        vm.prank(USER1);
        vm.expectRevert();
        liquidityEngine.setAMMContract(address(0x999));
    }

    function test_SetAMMContractToZero() external {
        vm.prank(OWNER);
        vm.expectRevert(ILiquidityEngine.InvalidAMMContract.selector);
        liquidityEngine.setAMMContract(address(0));
    }

    // ============ VIEW FUNCTION TESTS ============

    function test_GetBalances() external {
        // Initially, LiquidityEngine should have no tokens
        assertEq(liquidityEngine.getUSDCBalance(), 0, "USDC balance should be 0 initially");
        assertEq(liquidityEngine.getUPBalance(), 0, "UP balance should be 0 initially");
        assertEq(liquidityEngine.getDOWNBalance(), 0, "DOWN balance should be 0 initially");

        // After minting, check balances
        vm.startPrank(USER1);
        usdc.approve(address(liquidityEngine), ONE_THOUSAND);
        liquidityEngine.mintTokens(ONE_THOUSAND);
        vm.stopPrank();

        uint256 expectedTokenAmount = 0; // Engine only holds USDC after mint
        assertEq(liquidityEngine.getUSDCBalance(), ONE_THOUSAND, "USDC balance should match minted amount");
        assertEq(liquidityEngine.getUPBalance(), expectedTokenAmount, "UP balance should be 0 after mint");
        assertEq(liquidityEngine.getDOWNBalance(), expectedTokenAmount, "DOWN balance should be 0 after mint");
    }
}
