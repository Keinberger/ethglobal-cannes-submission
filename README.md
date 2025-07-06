## 🧠 OpinionMarket

This is "The Opinion Market", a browser-based, on-chain platform that serves as a **source of truth for ongoing debates**. Users voice their opinions on global or controversial topics by staking capital to support their position. There's no resolution or final outcome - debates are continuous and reflect the **real-time weight of global belief**. The financial mechanism ensures opinions have weight and conviction behind them.

## Development Commands

1. Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build the project
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Deployment addresses

### Mantle Network (Mainnet)
- AMM: `0xc7893Ca928b4Ad1cA3F96c629EeDEf106D879675`
- Liquidity Engine: `0xFD0cE23b0F2A316ce75Be2306308f14E527bCf69`
- USDC: `0x5c5e821c46b207640B5B71f0D6a49EBBe3bF11d4`
- Up Token: `0xec6afe555Cf56289491BC814d3017b5e0312436D`
- Down Token: `0x9c62ED4be22F8736a1327EAf574295Fd82D836c9`
- Smart Voter: `0xbFead1020cC32842B344852A821C5100c6C394A5`

### Zircuit Network (Testnet)
- AMM: `0xD857b930d6195db70564aF44802c7Eb13ebCC99C`
- Liquidity Engine: `0x301763B5ba8EC4B42134C76dEc1aA2a188077F7B`
- USDC: `0xDFb7EBf9158673Bb11B03d0F07EdA08B8e9cc39E`
- Up Token: `0x2dba7597C80db9462932D6b1Cc628ceD7188686C`
- Down Token: `0x89c8e2D146dc335081850e147364412345B5865B`
- Smart Voter: `0x7267fC55e2D2Aa218136901F417a09a84ADafe9a`

### Flow Network (Testnet)
- AMM: `0xbFead1020cC32842B344852A821C5100c6C394A5`
- Liquidity Engine: `0xdD6acB14fdf832Bc5177B4C3b6b924be93B8c561`
- USDC: `0x9c62ED4be22F8736a1327EAf574295Fd82D836c9`
- Up Token: `0xc7893Ca928b4Ad1cA3F96c629EeDEf106D879675`
- Down Token: `0xFD0cE23b0F2A316ce75Be2306308f14E527bCf69`
- Smart Voter: `0x45f4a8ded95927F6DB410984284BBfde2D7EA469`

### Sepolia Testnet
- AMM: `0x7267fC55e2D2Aa218136901F417a09a84ADafe9a`
- Liquidity Engine: `0xAF39b8412bBf96B05BDc63C7858271fD3F214D50`
- USDC: `0x89c8e2D146dc335081850e147364412345B5865B`
- Up Token: `0xD857b930d6195db70564aF44802c7Eb13ebCC99C`
- Down Token: `0x301763B5ba8EC4B42134C76dEc1aA2a188077F7B`
- Smart Voter: `0x41d7A19804cA8B70E3a01595aF33eADa07C3D9bE`


### How it's made

**Tech Stack:**
- **Frontend**: Next.js 15 with Turbopack, React 19, TypeScript, Tailwind CSS v4, RainbowKit + Wagmi, Viem, React Query
- **Smart Contracts**: Solidity 0.8.29, Foundry, OpenZeppelin contracts, multi-chain deployment
- **Infrastructure**: EIP-7702 native account abstraction, event-driven architecture, real-time price updates

**Smart Contract Architecture:**
The system consists of three core contracts:
1. **LiquidityEngine** - Entry/exit point with fixed 1:1 token minting (1 USDC = 1 UP + 1 DOWN)
2. **Custom AMM** - Constant product formula with 0.3% fees and native slippage protection (ceiled max bet sizes)
3. **SmartVoter7702** - EIP-7702 account abstraction enabling atomic multi-step operations

**User Flow:**
Users deposit USDC into the LiquidityEngine to receive equal amounts of UP and DOWN tokens at a fixed 1:1 ratio. They then swap one token type for the other on the AMM to express their opinion keeping UP tokens for "yes" or DOWN tokens for "no". When exiting users burn their remaining tokens back to the LiquidityEngine, receiving USDC based on current market prices reflecting the collective sentiment.

All of the above is being abstracted and handled using native account abstraction to enable a Web2 like experience.

**Technical Innovations:**
- **Custom AMM with Native Slippage Protection**
- **EIP-7702 Native Account Abstraction**
- **Advanced Liquidity Management** (1:1 entry pricing with market-driven exits and LP token provision for market makers)
