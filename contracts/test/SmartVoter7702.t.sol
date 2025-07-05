// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { Test } from "forge-std/src/Test.sol";
import { console } from "forge-std/src/console.sol";

import { SmartVoter7702 } from "../src/SmartVoter7702.sol";
import { LiquidityEngine } from "../src/LiquidityEngine.sol";
import { AMM } from "../src/AMM.sol";
import { MockERC20 } from "../src/mocks/MockERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SmartVoter7702
 * @dev Comprehensive tests for SmartVoter7702 EIP-7702 implementation
 */
contract SmartVoter7702Test is Test {
    // Contracts
    SmartVoter7702 public voter;
    LiquidityEngine public liquidityEngine;
    AMM public amm;
    MockERC20 public usdc;
    MockERC20 public upToken;
    MockERC20 public downToken;

    // Test addresses
    address public owner = address(0x1);
    address public user = address(0x2);

    // Test amounts
    uint256 public constant USDC_AMOUNT = 1000 * 1e6; // 1000 USDC
    uint256 public constant INITIAL_LIQUIDITY = 5000 * 1e18; // 5k tokens each

    function setUp() public {
        // Deploy mock tokens
        usdc = new MockERC20("USDC", "USDC", 6);
        upToken = new MockERC20("UP Token", "UP", 18);
        downToken = new MockERC20("DOWN Token", "DOWN", 18);

        // Deploy LiquidityEngine
        liquidityEngine = new LiquidityEngine(address(usdc), address(upToken), address(downToken), owner);

        // Deploy AMM
        amm = new AMM(address(upToken), address(downToken), owner, "Test AMM");

        // Set AMM in LiquidityEngine
        vm.prank(owner);
        liquidityEngine.setAMMContract(address(amm));

        // Deploy SmartVoter7702
        voter = new SmartVoter7702();

        // Setup initial balances
        usdc.mint(address(voter), USDC_AMOUNT * 10); // Give voter some USDC

        // Mint USDC_AMOUNT * 10 / 2 UP and DOWN tokens
        vm.startPrank(owner);
        usdc.mint(address(owner), USDC_AMOUNT * 10); // Give voter some USDC
        usdc.approve(address(liquidityEngine), USDC_AMOUNT * 10);
        liquidityEngine.mintTokens(USDC_AMOUNT * 10);

        // Add initial liquidity to AMM
        upToken.approve(address(amm), INITIAL_LIQUIDITY);
        downToken.approve(address(amm), INITIAL_LIQUIDITY);
        amm.addLiquidity(INITIAL_LIQUIDITY, INITIAL_LIQUIDITY);
        vm.stopPrank();
    }

    function test_EnterMarketUpPosition() public {
        vm.startPrank(owner);

        // Enter market with UP position
        voter.enterMarket(
            usdc,
            liquidityEngine,
            amm,
            true, // UP position
            USDC_AMOUNT,
            0 // No slippage protection for test
        );

        // Verify final balances
        uint256 finalUPBalance = amm.upToken().balanceOf(address(voter));
        uint256 finalDOWNBalance = amm.downToken().balanceOf(address(voter));

        // Voter should have UP tokens (position) and minimal DOWN tokens
        assertGt(finalUPBalance, 0, "Should have UP tokens");
        assertLt(finalDOWNBalance, 1e18, "Should have minimal DOWN tokens");

        vm.stopPrank();
    }

    function test_EnterMarketDownPosition() public {
        vm.startPrank(owner);

        // Enter market with DOWN position
        voter.enterMarket(
            usdc,
            liquidityEngine,
            amm,
            false, // DOWN position
            USDC_AMOUNT,
            0 // No slippage protection for test
        );

        // Verify final balances
        uint256 finalUPBalance = amm.upToken().balanceOf(address(voter));
        uint256 finalDOWNBalance = amm.downToken().balanceOf(address(voter));

        // Voter should have DOWN tokens (position) and minimal UP tokens
        assertGt(finalDOWNBalance, 0, "Should have DOWN tokens");
        assertLt(finalUPBalance, 1e18, "Should have minimal UP tokens");

        vm.stopPrank();
    }

    function test_ExitMarketUpPosition() public {
        vm.startPrank(owner);

        // First enter market with UP position
        voter.enterMarket(usdc, liquidityEngine, amm, true, USDC_AMOUNT, 0);

        uint256 upBalance = amm.upToken().balanceOf(address(voter));
        uint256 initialUSDCBalance = usdc.balanceOf(address(voter));

        uint256 initialGas = gasleft();

        // Exit UP position
        voter.exitMarket(liquidityEngine, amm, upBalance, true);

        uint256 gasUsed = initialGas - gasleft();

        // Verify balances after exit
        uint256 finalUPBalance = amm.upToken().balanceOf(address(voter));
        uint256 finalUSDCBalance = usdc.balanceOf(address(voter));

        assertLt(finalUPBalance, 1e18, "Should have minimal UP tokens after exit");
        assertGt(finalUSDCBalance, initialUSDCBalance, "Should receive USDC back");

        console.log("Gas used for UP position exit:", gasUsed);
        console.log("USDC received:", finalUSDCBalance - initialUSDCBalance);

        vm.stopPrank();
    }

    function test_ExitMarketDownPosition() public {
        vm.startPrank(owner);

        // First enter market with DOWN position
        voter.enterMarket(usdc, liquidityEngine, amm, false, USDC_AMOUNT, 0);

        uint256 downBalance = amm.downToken().balanceOf(address(voter));
        uint256 initialUSDCBalance = usdc.balanceOf(address(voter));

        uint256 initialGas = gasleft();

        // Exit DOWN position
        voter.exitMarket(liquidityEngine, amm, downBalance, false);

        uint256 gasUsed = initialGas - gasleft();

        // Verify balances after exit
        uint256 finalDOWNBalance = amm.downToken().balanceOf(address(voter));
        uint256 finalUSDCBalance = usdc.balanceOf(address(voter));

        assertLt(finalDOWNBalance, 1e18, "Should have minimal DOWN tokens after exit");
        assertGt(finalUSDCBalance, initialUSDCBalance, "Should receive USDC back");

        console.log("Gas used for DOWN position exit:", gasUsed);
        console.log("USDC received:", finalUSDCBalance - initialUSDCBalance);

        vm.stopPrank();
    }

    function test_InputValidation() public {
        vm.startPrank(owner);

        // Test zero amount
        vm.expectRevert(SmartVoter7702.InvalidAmount.selector);
        voter.enterMarket(usdc, liquidityEngine, amm, true, 0, 0);

        vm.expectRevert(SmartVoter7702.InvalidAmount.selector);
        voter.exitMarket(liquidityEngine, amm, 0, true);

        vm.stopPrank();
    }

    function test_InsufficientUSDC() public {
        vm.startPrank(owner);

        // Try to enter market with more USDC than available
        vm.expectRevert(SmartVoter7702.InsufficientUSDC.selector);
        voter.enterMarket(usdc, liquidityEngine, amm, true, USDC_AMOUNT * 100, 0);

        vm.stopPrank();
    }
}
