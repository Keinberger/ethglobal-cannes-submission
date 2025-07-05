// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { ILiquidityEngine } from "src/interfaces/ILiquidityEngine.sol";
import { LiquidityEngine } from "src/LiquidityEngine.sol";

import { BaseScript } from "../../Base.s.sol";
import { LiquidityEngineDeploymentParams } from "../../Types.sol";
import { console2 } from "forge-std/src/console2.sol";

contract DeployLiquidityEngine is BaseScript {
    function _deployLiquidityEngine(LiquidityEngineDeploymentParams memory params)
        internal
        returns (ILiquidityEngine liquidityEngine)
    {
        liquidityEngine = new LiquidityEngine(params.usdc, params.upToken, params.downToken, params.owner);
    }
}
