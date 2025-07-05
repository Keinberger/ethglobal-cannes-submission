// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IAMM - Interface for Automated Market Maker
 * @dev Interface for UP/DOWN token AMM with constant product formula
 */
interface IAMM {
    // ============ EVENTS ============

    event SwapExecuted(address indexed user, bool isUpToDown, uint256 amountIn, uint256 amountOut, uint256 fee);
    event LiquidityAdded(address indexed user, uint256 upAmount, uint256 downAmount, uint256 lpTokens);
    event LiquidityRemoved(address indexed user, uint256 upAmount, uint256 downAmount, uint256 lpTokens);
    event FeeCollected(uint256 upFees, uint256 downFees);

    // ============ ERRORS ============

    error InvalidAmount();
    error InsufficientLiquidity();
    error SlippageExceeded();
    error MaxTradeSizeExceeded();
    error TransferFailed();
    error InvalidToken();

    // ============ CONSTANTS ============

    function MAX_TRADE_SIZE() external view returns (uint256);
    function FEE_NUMERATOR() external view returns (uint256);
    function FEE_DENOMINATOR() external view returns (uint256);

    // ============ STATE VARIABLES ============

    function upToken() external view returns (IERC20);
    function downToken() external view returns (IERC20);
    function upReserves() external view returns (uint256);
    function downReserves() external view returns (uint256);

    // ============ SWAP FUNCTIONS ============

    /**
     * @dev Swap UP tokens for DOWN tokens
     * @param amountIn Amount of UP tokens to swap
     * @param minAmountOut Minimum amount of DOWN tokens to receive
     */
    function swapUpForDown(uint256 amountIn, uint256 minAmountOut) external;

    /**
     * @dev Swap DOWN tokens for UP tokens
     * @param amountIn Amount of DOWN tokens to swap
     * @param minAmountOut Minimum amount of UP tokens to receive
     */
    function swapDownForUp(uint256 amountIn, uint256 minAmountOut) external;

    // ============ LIQUIDITY FUNCTIONS ============

    /**
     * @dev Add liquidity by providing UP and DOWN tokens
     * @param upAmount Amount of UP tokens to provide
     * @param downAmount Amount of DOWN tokens to provide
     * @return lpTokens Amount of LP tokens minted
     */
    function addLiquidity(uint256 upAmount, uint256 downAmount) external returns (uint256 lpTokens);

    /**
     * @dev Remove liquidity by burning LP tokens
     * @param lpTokens Amount of LP tokens to burn
     * @return upAmount Amount of UP tokens returned
     * @return downAmount Amount of DOWN tokens returned
     */
    function removeLiquidity(uint256 lpTokens) external returns (uint256 upAmount, uint256 downAmount);

    // ============ PRICE FUNCTIONS ============

    /**
     * @dev Get current price of UP token in terms of DOWN tokens
     * @return Price of UP token in DOWN tokens (18 decimals)
     */
    function getUpPrice() external view returns (uint256);

    /**
     * @dev Get current price of DOWN token in terms of UP tokens
     * @return Price of DOWN token in UP tokens (18 decimals)
     */
    function getDownPrice() external view returns (uint256);

    // ============ CALCULATION FUNCTIONS ============

    /**
     * @dev Calculate amount out for a given amount in using constant product formula
     * @param amountIn Amount of input tokens
     * @param reserveIn Reserve of input tokens
     * @param reserveOut Reserve of output tokens
     * @return amountOut Amount of output tokens
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    )
        external
        pure
        returns (uint256 amountOut);

    /**
     * @dev Calculate amount in for a given amount out
     * @param amountOut Amount of output tokens
     * @param reserveIn Reserve of input tokens
     * @param reserveOut Reserve of output tokens
     * @return amountIn Amount of input tokens
     */
    function getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    )
        external
        pure
        returns (uint256 amountIn);
}
