// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { BaseScript } from "../Base.s.sol";
import { TestnetParams } from "../Params.sol";
import { DeployAll } from "../deployments/DeployAll.s.sol";
import { IAMM } from "../../src/interfaces/IAMM.sol";
import { ILiquidityEngine } from "../../src/interfaces/ILiquidityEngine.sol";
import { MockERC20 } from "../../src/mocks/MockERC20.sol";
import { SmartVoter7702 } from "../../src/SmartVoter7702.sol";
import { console2 } from "forge-std/src/console2.sol";

contract DeployTestnet is BaseScript, TestnetParams, DeployAll {
    function run()
        external
        broadcast(DEPLOYER)
        returns (
            IAMM amm,
            ILiquidityEngine liquidityEngine,
            MockERC20 usdc,
            MockERC20 upToken,
            MockERC20 downToken,
            SmartVoter7702 smartVoter
        )
    {
        // Deploy all contracts using the Sepolia parameters
        (amm, liquidityEngine, usdc, upToken, downToken, smartVoter) = _deployAll(params);
    }
}
