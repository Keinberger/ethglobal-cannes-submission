# 🧠 The Opinion Market

The **Opinion Market** is a browser-based, on-chain platform where users express their stance on global or controversial topics by staking into real-money liquidity pools. It functions as a **market-driven global sentiment layer** — users buy **Yes** or **No** tokens, shifting the market and representing their opinion with capital.

Unlike prediction markets (e.g. Polymarket), there's no resolution or final outcome. Each market is ongoing and reflects the **real-time weight of global belief**. Token prices fluctuate based on an AMM model (like Uniswap) and update on every trade.

All market data is stored on-chain. For the MVP, we simulate this with placeholder data until the real smart contracts are integrated.

---

## ✅ MVP Scope

- Users must **log in via social login (Privy)**.
- Real token integration (demoed via mock data for now).
- All market data is **on-chain and persistent**.
- Sentiment chart updates **on each trade**.
- MVP includes **3 main pages**:
  1. Market Overview
  2. Market Details
  3. Market Creation
- **No social features or leaderboards** in MVP.
- Fully browser-based, responsive UI.
- Creative freedom in design.

---

## 🗂️ Pages & Specifications

### 1. `/markets` — Markets Overview

Displays all active opinion markets with key sentiment information.

**Components**:
- `MarketCard` (repeated per market):
  - **Market title**
  - **Yes/No split** (e.g. 68% Yes)
  - **Total liquidity**
  - **Mini sparkline** (trend)
  - **Last updated** timestamp
  - Clickable → navigates to market details

**Design Notes**:
- Clean, mobile-first layout
- Clear Yes/No visual indicators
- Add floating "Create Market" button or in top-right corner
- Populate with demo data for MVP

---

### 2. `/markets/[marketId]` — Market Details

Deep dive into one market. Users can view sentiment history and buy/sell tokens.

**Components**:
- **Title & optional description**
- **Sentiment chart** (token price history)
  - Updates **on each trade**
  - Uses mock data for now
- **Market Stats**:
  - Live Yes/No ratio
  - Token prices
  - Pool liquidity
  - Number of users
- **Trade Box**:
  - Choose Yes or No
  - Enter amount
  - Show estimated price impact/slippage
  - Buy/Sell buttons
- **Your Position**:
  - Token holdings
  - Current value
  - (Optional) Profit/loss

**Implementation Notes**:
- Simulate AMM logic (e.g. constant product formula)
- Update local state on buy/sell
- Responsive chart (hover to inspect prices over time)

---

### 3. `/create` — Create Market

Users can submit a new opinion market. All users are allowed to create markets.

**Expected Components** (details TBD):
- Input for **market question**
- Optional **description/context**
- Real-time preview
- Submit button
- Must be logged in via Privy

---

## 💬 Example Opinion Markets

- "Should billionaires exist?"
- "Is the Gaza conflict necessary?"
- "Will AI improve human happiness?"
- "Should meat be banned in cities?"

---

## 🛠️ Tech Notes

- Authentication: **Privy (social login)**
- Data: All market state is **on-chain**, mocked for now
- Design: Creative freedom encouraged
- AMM: Simulated using constant product model (`x * y = k`)
- Frontend: Fully responsive, browser-based app

---

## 🔄 Implementation Notes

- **Mock Data Storage:** For the MVP, all market and user data will be stored in a frontend struct (in-memory, not persistent between reloads).
- **Charting Library:** Recharts will be used for the sentiment/price history chart.
- **Styling:** Color palette and styling are left to developer discretion; modern, clean, and mobile-first design is encouraged.
- **Privy Credentials:** Privy app ID and secret are provided in the `.env` file at the project root.
- **Deployment:** The app will be deployed on Vercel.