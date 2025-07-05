// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.29;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { console2 } from "forge-std/src/console2.sol";
import { Script } from "forge-std/src/Script.sol";

/// @dev forked from https://github.com/sablier-labs/v2-core/blob/main/script/Base.s.sol
abstract contract BaseScript is Script {
    using Strings for uint256;

    /// @dev Included to enable compilation of the script without a $MNEMONIC environment variable.
    string internal constant TEST_MNEMONIC = "test test test test test test test test test test test junk";

    /// @dev Needed for the deterministic deployments.
    bytes32 internal constant ZERO_SALT = bytes32(0);

    /// @dev Checks that the chain id is the expected chain id.
    modifier checkChainId(uint256 chainId) {
        if (block.chainid != chainId) {
            revert("Invalid chain id");
        }
        _;
    }

    /// @dev Broadcasts the transaction for the specified deployer address.
    modifier broadcast(address deployer) {
        vm.startBroadcast(deployer);
        _;
        vm.stopBroadcast();
    }

    /// @dev Initializes the transaction broadcaster like this:
    ///
    /// - If $ETH_FROM is defined, use it.
    /// - Otherwise, derive the broadcaster address from $MNEMONIC.
    /// - If $MNEMONIC is not defined, default to a test mnemonic.
    ///
    /// The use case for $ETH_FROM is to specify the broadcaster key and its address via the command line.
    constructor() { }

    /// @dev The presence of the salt instructs Forge to deploy contracts via this deterministic CREATE2 factory:
    /// https://github.com/Arachnid/deterministic-deployment-proxy
    ///
    /// Notes:
    /// - The salt format is "ChainID <chainid>, Version <version>".
    /// - The version is obtained from `package.json` using the `ffi` cheatcode:
    /// https://book.getfoundry.sh/cheatcodes/ffi
    /// - Requires `jq` CLI tool installed: https://jqlang.github.io/jq/
    function constructCreate2Salt() public returns (bytes32) {
        string memory chainId = block.chainid.toString();
        string[] memory inputs = new string[](4);
        inputs[0] = "jq";
        inputs[1] = "-r";
        inputs[2] = ".version";
        inputs[3] = "./package.json";
        bytes memory result = vm.ffi(inputs);
        string memory version = string(result);
        string memory create2Salt = string.concat("ChainID ", chainId, ", Version ", version);
        console2.log("The CREATE2 salt is \"%s\"", create2Salt);
        return bytes32(abi.encodePacked(create2Salt));
    }
}
