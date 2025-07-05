// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { SmartVoter7702 } from "../../../src/SmartVoter7702.sol";

import { BaseScript } from "../../Base.s.sol";

contract DeploySmartVoter7702 is BaseScript {
    function _deploySmartVoter7702() internal returns (SmartVoter7702 smartVoter) {
        smartVoter = new SmartVoter7702();
    }
}
