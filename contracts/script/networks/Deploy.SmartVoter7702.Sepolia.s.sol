// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { BaseScript } from "../Base.s.sol";
import { SepoliaParams } from "../Params.sol";
import { SmartVoter7702 } from "../../src/SmartVoter7702.sol";
import { console2 } from "forge-std/src/console2.sol";

/**
 * @title DeploySmartVoter7702Sepolia
 * @dev Network-specific deployment script for SmartVoter7702 on Sepolia
 */
contract DeploySmartVoter7702Sepolia is BaseScript, SepoliaParams {
    function run() external broadcast(DEPLOYER) returns (SmartVoter7702 smartVoter) {
        // Deploy SmartVoter7702 using Sepolia parameters
        smartVoter = new SmartVoter7702();
    }
}
