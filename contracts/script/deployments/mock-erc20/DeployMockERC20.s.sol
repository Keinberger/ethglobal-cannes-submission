// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { MockERC20 } from "src/mocks/MockERC20.sol";
import { BaseScript } from "../../Base.s.sol";
import { MockErc20DeploymentParams } from "../../Types.sol";
import { console2 } from "forge-std/src/console2.sol";

contract DeployMockERC20 is BaseScript {
    function _deployMockERC20(MockErc20DeploymentParams memory params) internal returns (MockERC20 token) {
        token = new MockERC20(params.name, params.symbol, params.decimals);
    }
}
