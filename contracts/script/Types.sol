// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

struct MockErc20DeploymentParams {
    string name;
    string symbol;
    uint8 decimals;
}

struct LiquidityEngineDeploymentParams {
    address usdc;
    address upToken;
    address downToken;
    address owner;
}

struct AMMDeploymentParams {
    address upToken;
    address downToken;
    address owner;
    string name;
}

struct DeploymentParams {
    MockErc20DeploymentParams upTokenParams;
    MockErc20DeploymentParams downTokenParams;
    address owner;
    string ammName;
}
