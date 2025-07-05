// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ILiquidityEngine {
    // Events
    event TokensMinted(address indexed user, uint256 usdcAmount, uint256 upAmount, uint256 downAmount);
    event TokensBurned(address indexed user, uint256 upAmount, uint256 downAmount, uint256 usdcReceived);
    event AMMContractSet(address indexed oldAMM, address indexed newAMM);

    // Errors
    error InvalidAmount();
    error InvalidAMMContract();
    error InsufficientAllowance();
    error TransferFailed();
    error AMMNotSet();

    // External/Public Functions
    function mintTokens(uint256 usdcAmount) external;
    function burnTokens(uint256 upAmount, uint256 downAmount) external;
    function setAMMContract(address _ammContract) external;
    function getUSDCBalance() external view returns (uint256);
    function getUPBalance() external view returns (uint256);
    function getDOWNBalance() external view returns (uint256);
    function ammContract() external view returns (address);
}
