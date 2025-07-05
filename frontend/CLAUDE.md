# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "The Opinion Market", a browser-based, on-chain platform that serves as a **source of truth for ongoing debates**. Users voice their opinions on global or controversial topics by staking capital to support their position. The platform is **focused on debate and opinion expression**, not trading or profit-making.

**Key Distinction**: This is NOT a prediction market or trading platform. It's an **ongoing debate platform** where users can easily voice their opinions with financial backing. There's no resolution or final outcome - debates are continuous and reflect the **real-time weight of global belief**. The financial mechanism ensures opinions have weight and conviction behind them.

**Philosophy**: Instead of focusing on betting or market dynamics, the platform emphasizes making it easy for people to voice their stance on important debates and see the collective sentiment of society.

All debate data is stored on-chain. For the MVP, we simulate this with placeholder data until the real smart contracts are integrated.

## Development Commands

```bash
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

## Architecture Overview

### Core Structure

- **Frontend**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS 4.0
- **Charts**: Recharts for data visualization
- **Blockchain**: Viem integration for web3 functionality
- **Authentication**: Privy (social login) - users must log in to create debates
- **AMM Logic**: Simulated constant product formula (`x * y = k`) for token pricing

### Key Components

- `DebateCard`: Displays market overview
- `OpinionCard`: Handles trading interface
- `OpinionStream`: Real-time trade activity
- `StatCard`: Displays statistical information
- `PositionRow`: Shows user position details
- `ToggleButton`: UI toggle component

### Data Structure

Debates are defined by the `debateType` interface with:

- Basic info (title, description, opinionId)
- Visual data (image, recent comments)
- Opinion data (yesPrice, noPrice, yesPercent, noPercent)
- Debate metrics (totalLiquidity, participants)
- Trend data (array of sentiment values over time)

### Routing

- `/` - Home page (redirects to debates)
- `/debates` - Debate overview page
- `/debates/[opinionId]` - Individual debate details with opinion interface
- `/create` - Debate creation form

## MVP Scope

- Users must **log in via social login (Privy)**
- Real token integration (demoed via mock data for now)
- All debate data is **on-chain and persistent**
- Sentiment chart updates **on each trade**
- MVP includes **3 main pages**: Debate Overview, Debate Details, Debate Creation
- **No social features or leaderboards** in MVP
- Fully browser-based, responsive UI
- Creative freedom in design

## Page Specifications

### `/debates` - Debate Overview

Displays all active debates showing the current state of public opinion.

**Components per DebateCard**:

- Debate title
- Debate image (provided when debate is created)
- Current state of the debate (Yes/No split, e.g. 68% Yes)
- Number of people who voiced their opinion
- Most recent comment posted alongside the opinion/bet
- Clickable → navigates to debate details

**Design Notes**:

- Clean, browser-first layout
- Focus on debate content, not financial metrics
- Clear Yes/No visual indicators
- Floating "Create Debate" button
- Populated with demo data for MVP
- **No market-style graphs or trading indicators**

### `/debates/[opinionId]` - Debate Details

Deep dive into one debate. Users can view opinion history and voice their stance.

**Components**:

- **Title & optional description**
- **Debate image** (provided when debate was created)
- **Opinion timeline** (showing how sentiment has evolved)
  - Updates on each opinion voiced
  - Uses mock data for now
- **Debate Stats**:
  - Live Yes/No ratio
  - Number of people who voiced opinions
  - Recent activity feed
- **Opinion Card**:
  - Choose Buy or Sell
  - Buy
    - Choose Yes or No position
    - Enter amount to back opinion
    - Optional comment/reasoning
    - "Voice Opinion" button
  - Sell
    - Enter amount to sell
    - Option to select 25%, 50% or max
- **Opinion Stream**:
  - A twitch-like stream of all previous comments with the amount, position and user name
  - Scrollable

**Implementation Notes**:

- Focus on opinion expression, not profit/loss
- Show community reasoning and comments
- Update local state when opinions are voiced
- Emphasis on debate participation over financial metrics

### `/create` - Create Debate

Users can submit a new debate topic. All users are allowed to create debates.

**Components**:

- Input for debate question
- Optional description/context
- **Image upload** for debate visualization
- Real-time preview
- Submit button
- Must be logged in via Privy

## Example Debate Topics

- "Should billionaires exist?"
- "Is the Gaza conflict necessary?"
- "Will AI improve human happiness?"
- "Should meat be banned in cities?"

### Mock Data

Currently uses `mockDebates` array in `src/app/mockData.ts` for development. Debates include political, social, and technology topics.

## Key Features

1. **Debate Discovery**: Browse active debates and see public sentiment
2. **Debate Creation**: Create new debates with questions, descriptions, and images
3. **Opinion Expression**: Voice your stance with financial backing and optional comments
4. **Sentiment Tracking**: Visual representation of how public opinion evolves over time
5. **Community Engagement**: See recent comments and reasoning from other participants
6. **Source of Truth**: Ongoing debates that reflect real-time societal beliefs

## Implementation Notes

### Mock Data Storage

For the MVP, all debate and user data will be stored in a frontend struct (in-memory, not persistent between reloads).

### Technical Stack

- Uses Next.js App Router with TypeScript strict mode
- Path alias `@/*` configured for `./src/*`
- Tailwind CSS configured with PostCSS
- Charts implemented with Recharts library
- Viem library integrated for blockchain functionality
- Privy credentials provided in `.env` file at project root
- Deployment on Vercel

### Development Notes

- Color palette and styling are left to developer discretion
- Modern, clean, and browser-first design is encouraged
- AMM logic simulated using constant product model
- Chart updates on each trade transaction
- All debate state will eventually be on-chain (mocked for MVP)
