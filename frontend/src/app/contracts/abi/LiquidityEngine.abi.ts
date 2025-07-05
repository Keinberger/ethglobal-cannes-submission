export const LIQUIDITY_ENGINE_CONTRACT_ABI =  [
    {
      "type": "constructor",
      "inputs": [
        { "name": "_usdc", "type": "address", "internalType": "address" },
        { "name": "_upToken", "type": "address", "internalType": "address" },
        { "name": "_downToken", "type": "address", "internalType": "address" },
        { "name": "_owner", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "ammContract",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "burnTokens",
      "inputs": [
        { "name": "upAmount", "type": "uint256", "internalType": "uint256" },
        { "name": "downAmount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "downToken",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "contract MockERC20" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "emergencyWithdraw",
      "inputs": [
        { "name": "token", "type": "address", "internalType": "contract IERC20" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" },
        { "name": "to", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getDOWNBalance",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUPBalance",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUSDCBalance",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "mintTokens",
      "inputs": [{ "name": "usdcAmount", "type": "uint256", "internalType": "uint256" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "setAMMContract",
      "inputs": [{ "name": "_ammContract", "type": "address", "internalType": "address" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "upToken",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "contract MockERC20" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "usdc",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "contract IERC20" }],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "AMMContractSet",
      "inputs": [
        { "name": "oldAMM", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "newAMM", "type": "address", "indexed": true, "internalType": "address" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        { "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "TokensBurned",
      "inputs": [
        { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "upAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "downAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "usdcReceived", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "TokensMinted",
      "inputs": [
        { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "usdcAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "upAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "downAmount", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    { "type": "error", "name": "AMMNotSet", "inputs": [] },
    { "type": "error", "name": "InsufficientAllowance", "inputs": [] },
    { "type": "error", "name": "InvalidAMMContract", "inputs": [] },
    { "type": "error", "name": "InvalidAmount", "inputs": [] },
    {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }]
    },
    {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [{ "name": "account", "type": "address", "internalType": "address" }]
    },
    { "type": "error", "name": "ReentrancyGuardReentrantCall", "inputs": [] },
    { "type": "error", "name": "TransferFailed", "inputs": [] }
  ]