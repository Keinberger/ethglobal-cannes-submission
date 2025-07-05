// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { IAMM } from "src/interfaces/IAMM.sol";
import { AMM } from "src/AMM.sol";

import { BaseScript } from "../../Base.s.sol";
import { AMMDeploymentParams } from "../../Types.sol";
import { console2 } from "forge-std/src/console2.sol";

contract DeployAMM is BaseScript {
    function _deployAMM(AMMDeploymentParams memory params) internal returns (IAMM amm) {
        amm = new AMM(params.upToken, params.downToken, params.owner, params.name);
    }
}
