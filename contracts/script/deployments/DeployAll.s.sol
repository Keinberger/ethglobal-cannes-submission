// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { IAMM } from "../../src/interfaces/IAMM.sol";
import { ILiquidityEngine } from "../../src/interfaces/ILiquidityEngine.sol";

import { MockERC20 } from "../../src/mocks/MockERC20.sol";
import { AMM } from "../../src/AMM.sol";
import { LiquidityEngine } from "../../src/LiquidityEngine.sol";

import { BaseScript } from "../Base.s.sol";
import {
    DeploymentParams,
    MockErc20DeploymentParams,
    AMMDeploymentParams,
    LiquidityEngineDeploymentParams
} from "../Types.sol";
import { DeployMockERC20 } from "./mock-erc20/DeployMockERC20.s.sol";
import { DeployAMM } from "./amm/DeployAMM.s.sol";
import { DeployLiquidityEngine } from "./liquidity-engine/DeployLiquidityEngine.s.sol";

import { console2 } from "forge-std/src/console2.sol";

contract DeployAll is BaseScript, DeployMockERC20, DeployAMM, DeployLiquidityEngine {
    function _deployAll(DeploymentParams memory params)
        internal
        returns (IAMM amm, ILiquidityEngine liquidityEngine, MockERC20 usdc, MockERC20 upToken, MockERC20 downToken)
    {
        usdc = _deployMockERC20(MockErc20DeploymentParams({ name: "USD Coin", symbol: "USDC", decimals: 6 }));
        upToken = _deployMockERC20(params.upTokenParams);
        downToken = _deployMockERC20(params.downTokenParams);

        amm = _deployAMM(
            AMMDeploymentParams({
                upToken: address(upToken),
                downToken: address(downToken),
                owner: params.owner,
                name: params.ammName
            })
        );

        liquidityEngine = _deployLiquidityEngine(
            LiquidityEngineDeploymentParams({
                usdc: address(usdc),
                upToken: address(upToken),
                downToken: address(downToken),
                owner: params.owner
            })
        );

        // Setup (seed AMM with USDC)

        // Mint some USDC to deployer for testing
        uint256 seedAmount = 50_000 * 1e6;
        usdc.mint(params.owner, seedAmount); // 50k USDC
        usdc.approve(address(liquidityEngine), seedAmount);
        liquidityEngine.mintTokens(seedAmount);

        // add liquidity to AMM
        uint256 depositAmount = seedAmount / 2 * 1e12;
        upToken.approve(address(amm), depositAmount);
        downToken.approve(address(amm), depositAmount);
        amm.addLiquidity(depositAmount, depositAmount);
    }
}
