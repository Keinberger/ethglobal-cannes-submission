export const AMM_CONTRACT_ABI = [
    {
      "type": "constructor",
      "inputs": [
        { "name": "_upToken", "type": "address", "internalType": "address" },
        { "name": "_downToken", "type": "address", "internalType": "address" },
        { "name": "_owner", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "FEE_DENOMINATOR",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "FEE_NUMERATOR",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MAX_TRADE_SIZE",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "addLiquidity",
      "inputs": [
        { "name": "upAmount", "type": "uint256", "internalType": "uint256" },
        { "name": "downAmount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "lpTokens", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "allowance",
      "inputs": [
        { "name": "owner", "type": "address", "internalType": "address" },
        { "name": "spender", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        { "name": "spender", "type": "address", "internalType": "address" },
        { "name": "value", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [{ "name": "account", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "decimals",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint8", "internalType": "uint8" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "downReserves",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "downToken",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "contract IERC20" }],
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
      "name": "getAmountIn",
      "inputs": [
        { "name": "amountOut", "type": "uint256", "internalType": "uint256" },
        { "name": "reserveIn", "type": "uint256", "internalType": "uint256" },
        { "name": "reserveOut", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "amountIn", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getAmountOut",
      "inputs": [
        { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
        { "name": "reserveIn", "type": "uint256", "internalType": "uint256" },
        { "name": "reserveOut", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "amountOut", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getDownPrice",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUpPrice",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "name",
      "inputs": [],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
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
      "name": "removeLiquidity",
      "inputs": [{ "name": "lpTokens", "type": "uint256", "internalType": "uint256" }],
      "outputs": [
        { "name": "upAmount", "type": "uint256", "internalType": "uint256" },
        { "name": "downAmount", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "nonpayable"
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
      "name": "swapDownForUp",
      "inputs": [
        { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
        { "name": "minAmountOut", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "swapUpForDown",
      "inputs": [
        { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
        { "name": "minAmountOut", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "symbol",
      "inputs": [],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "totalSupply",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transfer",
      "inputs": [
        { "name": "to", "type": "address", "internalType": "address" },
        { "name": "value", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferFrom",
      "inputs": [
        { "name": "from", "type": "address", "internalType": "address" },
        { "name": "to", "type": "address", "internalType": "address" },
        { "name": "value", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
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
      "name": "upReserves",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "upToken",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "contract IERC20" }],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "Approval",
      "inputs": [
        { "name": "owner", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "spender", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "value", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "FeeCollected",
      "inputs": [
        { "name": "upFees", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "downFees", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "LiquidityAdded",
      "inputs": [
        { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "upAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "downAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "lpTokens", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "LiquidityRemoved",
      "inputs": [
        { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "upAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "downAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "lpTokens", "type": "uint256", "indexed": false, "internalType": "uint256" }
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
      "name": "SwapExecuted",
      "inputs": [
        { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "isUpToDown", "type": "bool", "indexed": false, "internalType": "bool" },
        { "name": "amountIn", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "amountOut", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "fee", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Transfer",
      "inputs": [
        { "name": "from", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "to", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "value", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "ERC20InsufficientAllowance",
      "inputs": [
        { "name": "spender", "type": "address", "internalType": "address" },
        { "name": "allowance", "type": "uint256", "internalType": "uint256" },
        { "name": "needed", "type": "uint256", "internalType": "uint256" }
      ]
    },
    {
      "type": "error",
      "name": "ERC20InsufficientBalance",
      "inputs": [
        { "name": "sender", "type": "address", "internalType": "address" },
        { "name": "balance", "type": "uint256", "internalType": "uint256" },
        { "name": "needed", "type": "uint256", "internalType": "uint256" }
      ]
    },
    {
      "type": "error",
      "name": "ERC20InvalidApprover",
      "inputs": [{ "name": "approver", "type": "address", "internalType": "address" }]
    },
    {
      "type": "error",
      "name": "ERC20InvalidReceiver",
      "inputs": [{ "name": "receiver", "type": "address", "internalType": "address" }]
    },
    {
      "type": "error",
      "name": "ERC20InvalidSender",
      "inputs": [{ "name": "sender", "type": "address", "internalType": "address" }]
    },
    {
      "type": "error",
      "name": "ERC20InvalidSpender",
      "inputs": [{ "name": "spender", "type": "address", "internalType": "address" }]
    },
    { "type": "error", "name": "InsufficientLiquidity", "inputs": [] },
    { "type": "error", "name": "InvalidAmount", "inputs": [] },
    { "type": "error", "name": "InvalidToken", "inputs": [] },
    { "type": "error", "name": "MaxTradeSizeExceeded", "inputs": [] },
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
    { "type": "error", "name": "SlippageExceeded", "inputs": [] },
    { "type": "error", "name": "TransferFailed", "inputs": [] }
  ]