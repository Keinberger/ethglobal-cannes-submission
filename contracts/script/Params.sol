// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { DeploymentParams, MockErc20DeploymentParams } from "./Types.sol";

abstract contract SepoliaParams {
    address internal DEPLOYER = 0xBc13Bba7f1dFe8cd09fcf9B5954dF137faa9Dccb;
    DeploymentParams internal params = DeploymentParams({
        upTokenParams: MockErc20DeploymentParams({ name: "UP Token", symbol: "UP", decimals: 18 }),
        downTokenParams: MockErc20DeploymentParams({ name: "DOWN Token", symbol: "DOWN", decimals: 18 }),
        owner: DEPLOYER,
        ammName: "UP-DOWN AMM"
    });
}
