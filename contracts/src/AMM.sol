// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { IAMM } from "./interfaces/IAMM.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AMM - Automated Market Maker for UP/DOWN tokens
 * @dev Implements delayed swaps with 1-block delay to prevent flash loan attacks
 * Uses constant product formula: x * y = k
 */
contract AMM is IAMM, ERC20, Ownable, ReentrancyGuard {
    // Token contracts
    IERC20 public immutable override upToken;
    IERC20 public immutable override downToken;

    // Constants & Immutables
    uint256 public constant override MAX_TRADE_SIZE = 10_000 * 1e18; // 10k tokens
    uint256 public constant override FEE_NUMERATOR = 30; // 0.3% fee (30/10000)
    uint256 public constant override FEE_DENOMINATOR = 10_000;

    // State variables
    uint256 public override upReserves;
    uint256 public override downReserves;
    string public override ammName;

    /**
     * @dev Constructor
     * @param _upToken UP token address
     * @param _downToken DOWN token address
     * @param _owner Owner of the contract
     */
    constructor(
        address _upToken,
        address _downToken,
        address _owner,
        string memory _name
    )
        ERC20("UP-DOWN LP Token", "UP-DOWN-LP")
        Ownable(_owner)
    {
        if (_upToken == address(0) || _downToken == address(0)) {
            revert InvalidToken();
        }

        upToken = IERC20(_upToken);
        downToken = IERC20(_downToken);
        ammName = _name;
    }

    /**
     * @dev Swap UP tokens for DOWN tokens
     * @param amountIn Amount of UP tokens to swap
     * @param minAmountOut Minimum amount of DOWN tokens to receive
     */
    function swapUpForDown(uint256 amountIn, uint256 minAmountOut) external override nonReentrant {
        if (amountIn == 0 || amountIn > MAX_TRADE_SIZE) {
            revert InvalidAmount();
        }
        if (upReserves == 0 || downReserves == 0) {
            revert InsufficientLiquidity();
        }

        // Transfer tokens from user
        if (!upToken.transferFrom(msg.sender, address(this), amountIn)) {
            revert TransferFailed();
        }

        // Calculate output and fee
        uint256 amountOut = getAmountOut(amountIn, upReserves, downReserves);
        uint256 fee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;

        if (amountOut < minAmountOut) {
            revert SlippageExceeded();
        }

        // Update reserves
        upReserves += amountIn;
        downReserves -= amountOut;

        // Transfer tokens to user
        if (!downToken.transfer(msg.sender, amountOut)) {
            revert TransferFailed();
        }

        emit SwapExecuted(msg.sender, true, amountIn, amountOut, fee);
    }

    /**
     * @dev Swap DOWN tokens for UP tokens
     * @param amountIn Amount of DOWN tokens to swap
     * @param minAmountOut Minimum amount of UP tokens to receive
     */
    function swapDownForUp(uint256 amountIn, uint256 minAmountOut) external override nonReentrant {
        if (amountIn == 0 || amountIn > MAX_TRADE_SIZE) {
            revert InvalidAmount();
        }
        if (upReserves == 0 || downReserves == 0) {
            revert InsufficientLiquidity();
        }

        // Transfer tokens from user
        if (!downToken.transferFrom(msg.sender, address(this), amountIn)) {
            revert TransferFailed();
        }

        // Calculate output and fee
        uint256 amountOut = getAmountOut(amountIn, downReserves, upReserves);
        uint256 fee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;

        if (amountOut < minAmountOut) {
            revert SlippageExceeded();
        }

        // Update reserves
        downReserves += amountIn;
        upReserves -= amountOut;

        // Transfer tokens to user
        if (!upToken.transfer(msg.sender, amountOut)) {
            revert TransferFailed();
        }

        emit SwapExecuted(msg.sender, false, amountIn, amountOut, fee);
    }

    /**
     * @dev Add liquidity by providing UP and DOWN tokens
     * @param upAmount Amount of UP tokens to provide
     * @param downAmount Amount of DOWN tokens to provide
     * @return lpTokens Amount of LP tokens minted
     */
    function addLiquidity(
        uint256 upAmount,
        uint256 downAmount
    )
        external
        override
        nonReentrant
        returns (uint256 lpTokens)
    {
        if (upAmount == 0 || downAmount == 0) {
            revert InvalidAmount();
        }

        // Transfer tokens from user
        if (!upToken.transferFrom(msg.sender, address(this), upAmount)) {
            revert TransferFailed();
        }
        if (!downToken.transferFrom(msg.sender, address(this), downAmount)) {
            revert TransferFailed();
        }

        if (totalSupply() == 0) {
            // First liquidity provision
            lpTokens = sqrt(upAmount * downAmount);
        } else {
            // Calculate LP tokens based on existing ratio
            uint256 upLiquidity = (upAmount * totalSupply()) / upReserves;
            uint256 downLiquidity = (downAmount * totalSupply()) / downReserves;
            lpTokens = upLiquidity < downLiquidity ? upLiquidity : downLiquidity;
        }

        if (lpTokens == 0) {
            revert InvalidAmount();
        }

        // Update reserves
        upReserves += upAmount;
        downReserves += downAmount;
        _mint(msg.sender, lpTokens);

        emit LiquidityAdded(msg.sender, upAmount, downAmount, lpTokens);
    }

    /**
     * @dev Remove liquidity by burning LP tokens
     * @param lpTokens Amount of LP tokens to burn
     * @return upAmount Amount of UP tokens returned
     * @return downAmount Amount of DOWN tokens returned
     */
    function removeLiquidity(uint256 lpTokens)
        external
        override
        nonReentrant
        returns (uint256 upAmount, uint256 downAmount)
    {
        if (lpTokens == 0 || lpTokens > totalSupply()) {
            revert InvalidAmount();
        }

        // Calculate amounts to return
        upAmount = (lpTokens * upReserves) / totalSupply();
        downAmount = (lpTokens * downReserves) / totalSupply();

        if (upAmount == 0 || downAmount == 0) {
            revert InvalidAmount();
        }

        // Update reserves and supply
        upReserves -= upAmount;
        downReserves -= downAmount;
        _burn(msg.sender, lpTokens);

        // Transfer tokens to user
        if (!upToken.transfer(msg.sender, upAmount)) {
            revert TransferFailed();
        }
        if (!downToken.transfer(msg.sender, downAmount)) {
            revert TransferFailed();
        }

        emit LiquidityRemoved(msg.sender, upAmount, downAmount, lpTokens);
    }

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
        public
        pure
        override
        returns (uint256 amountOut)
    {
        if (amountIn == 0) return 0;
        if (reserveIn == 0 || reserveOut == 0) return 0;

        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        amountOut = numerator / denominator;
    }

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
        public
        pure
        override
        returns (uint256 amountIn)
    {
        if (amountOut == 0) return 0;
        if (reserveIn == 0 || reserveOut == 0) return 0;
        if (amountOut >= reserveOut) return 0;

        uint256 numerator = reserveIn * amountOut * FEE_DENOMINATOR;
        uint256 denominator = (reserveOut - amountOut) * (FEE_DENOMINATOR - FEE_NUMERATOR);
        amountIn = (numerator / denominator) + 1;
    }

    /**
     * @dev Get current price of UP token in terms of DOWN tokens
     */
    function getUpPrice() external view override returns (uint256) {
        if (upReserves == 0) return 0;
        return (downReserves * 1e18) / upReserves;
    }

    /**
     * @dev Get current price of DOWN token in terms of UP tokens
     */
    function getDownPrice() external view override returns (uint256) {
        if (downReserves == 0) return 0;
        return (upReserves * 1e18) / downReserves;
    }

    /**
     * @dev Calculate square root using Babylonian method
     * @param x Number to calculate square root of
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;

        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
