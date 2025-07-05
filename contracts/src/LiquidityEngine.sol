// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ILiquidityEngine } from "./interfaces/ILiquidityEngine.sol";
import { IAMM } from "./interfaces/IAMM.sol";

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { MockERC20 } from "./mocks/MockERC20.sol";

/**
 * @title LiquidityEngine
 * @dev Allows minting UP&DOWN tokens at fixed price and burning them at AMM prices
 * 1 USDC deposit => 1 UP + 1 DOWN
 */
contract LiquidityEngine is ILiquidityEngine, Ownable, ReentrancyGuard {
    // Token contracts
    IERC20 public immutable usdc;
    MockERC20 public immutable upToken;
    MockERC20 public immutable downToken;

    // AMM contract interface
    address public ammContract;

    /**
     * @dev Constructor
     * @param _usdc USDC token address
     * @param _upToken UP token address
     * @param _downToken DOWN token address
     * @param _owner Owner of the contract
     */
    constructor(address _usdc, address _upToken, address _downToken, address _owner) Ownable(_owner) {
        if (_usdc == address(0) || _upToken == address(0) || _downToken == address(0)) {
            revert InvalidAMMContract();
        }

        usdc = IERC20(_usdc);
        upToken = MockERC20(_upToken);
        downToken = MockERC20(_downToken);
    }

    /**
     * @dev Mint UP and DOWN tokens at fixed price (1 USDC = 1 UP + 1 DOWN)
     * @param usdcAmount Amount of USDC to deposit
     */
    function mintTokens(uint256 usdcAmount) external override nonReentrant {
        if (usdcAmount == 0) revert InvalidAmount();

        // Transfer USDC from user to this contract
        if (!usdc.transferFrom(msg.sender, address(this), usdcAmount)) {
            revert TransferFailed();
        }

        // Convert USDC (6 decimals) to 18 decimals for UP/DOWN tokens
        // UP and DOWN tokens are both priced at 1 USDC
        uint256 tokenAmount = usdcAmount * 1e12 / 2; // 1 USDC = 1e6, 1 UP/DOWN = 1e18

        // Mint tokens directly to user
        upToken.mint(msg.sender, tokenAmount);
        downToken.mint(msg.sender, tokenAmount);

        emit TokensMinted(msg.sender, usdcAmount, tokenAmount, tokenAmount);
    }

    /**
     * @dev Burn UP and DOWN tokens and redeem USDC at AMM prices
     * @param upAmount Amount of UP tokens to burn
     * @param downAmount Amount of DOWN tokens to burn
     */
    function burnTokens(uint256 upAmount, uint256 downAmount) external override nonReentrant {
        if (upAmount == 0 && downAmount == 0) revert InvalidAmount();
        if (ammContract == address(0)) revert AMMNotSet();

        uint256 totalUsdcReceived = _burnUpTokens(upAmount) + _burnDownTokens(downAmount);

        // Transfer USDC to user
        if (totalUsdcReceived > 0) {
            if (!usdc.transfer(msg.sender, totalUsdcReceived)) {
                revert TransferFailed();
            }
        }

        emit TokensBurned(msg.sender, upAmount, downAmount, totalUsdcReceived);
    }

    /**
     * @dev Set the AMM contract address
     * @param _ammContract Address of the AMM contract
     */
    function setAMMContract(address _ammContract) external override onlyOwner {
        if (_ammContract == address(0)) revert InvalidAMMContract();

        address oldAMM = ammContract;
        ammContract = _ammContract;

        emit AMMContractSet(oldAMM, _ammContract);
    }

    /**
     * @dev Get the current balance of USDC in the contract
     */
    function getUSDCBalance() external view override returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    /**
     * @dev Get the current balance of UP tokens in the contract
     */
    function getUPBalance() external view override returns (uint256) {
        return upToken.balanceOf(address(this));
    }

    /**
     * @dev Get the current balance of DOWN tokens in the contract
     */
    function getDOWNBalance() external view override returns (uint256) {
        return downToken.balanceOf(address(this));
    }

    /**
     * @dev Burn UP tokens and return USDC value
     * @param upAmount Amount of UP tokens to burn
     * @return usdcValue USDC value received
     */
    function _burnUpTokens(uint256 upAmount) internal returns (uint256 usdcValue) {
        if (upAmount == 0) return 0;

        // Transfer UP tokens from user to this contract
        if (!upToken.transferFrom(msg.sender, address(this), upAmount)) {
            revert TransferFailed();
        }

        // Burn the UP tokens (for test, just leave them in contract)
        upToken.burn(address(this), upAmount); // If you want to actually burn, add a burn function to MockERC20

        // Get USDC value from AMM for UP tokens
        return getTokenValueFromAMM(upToken, upAmount) / 1e12;
    }

    /**
     * @dev Burn DOWN tokens and return USDC value
     * @param downAmount Amount of DOWN tokens to burn
     * @return usdcValue USDC value received
     */
    function _burnDownTokens(uint256 downAmount) internal returns (uint256 usdcValue) {
        if (downAmount == 0) return 0;

        // Transfer DOWN tokens from user to this contract
        if (!downToken.transferFrom(msg.sender, address(this), downAmount)) {
            revert TransferFailed();
        }

        // Burn the DOWN tokens (for test, just leave them in contract)
        downToken.burn(address(this), downAmount); // If you want to actually burn, add a burn function to MockERC20

        // Get USDC value from AMM for DOWN tokens
        return getTokenValueFromAMM(downToken, downAmount) / 1e12;
    }

    /**
     * @dev Get the USDC value of tokens from AMM
     * @param token Token to get value for
     * @param amount Amount of tokens
     * @return usdcValue USDC value of the tokens
     */
    function getTokenValueFromAMM(IERC20 token, uint256 amount) internal view returns (uint256 usdcValue) {
        if (ammContract == address(0)) {
            // Fallback to 1:1 ratio if AMM not set
            return amount;
        }

        IAMM amm = IAMM(ammContract);

        if (token == upToken) {
            // Get UP token price in terms of DOWN tokens, then convert to USDC
            uint256 upPrice = amm.getUpPrice();
            if (upPrice == 0) return amount; // Fallback

            // Calculate DOWN tokens equivalent
            uint256 downEquivalent = (amount * upPrice) / 1e18;
            // For now, assume 1 DOWN = 1 USDC (you might want to add a price oracle later)
            return downEquivalent;
        } else if (token == downToken) {
            // Get DOWN token price in terms of UP tokens, then convert to USDC
            uint256 downPrice = amm.getDownPrice();
            if (downPrice == 0) return amount; // Fallback

            // Calculate UP tokens equivalent
            uint256 upEquivalent = (amount * downPrice) / 1e18;
            // For now, assume 1 UP = 1 USDC (you might want to add a price oracle later)
            return upEquivalent;
        }

        return amount; // Fallback
    }
}
