export type opinionType = {
  text: string;
  author: string;
  stance: 'yes' | 'no';
  amount: number;
  timestamp: string;
};

export type debateType = {
  opinionId: number;
  title: string;
  description: string;
  image: string;
  trend: number[];
  yesPercent: number;
  noPercent: number;
  yesPrice: number;
  noPrice: number;
  totalLiquidity: number;
  participants: number;
  lastUpdated: string;
  opinionStream?: opinionType[];
};

export type HistoricalPrice = {
  upPriceUSD: number; // USD value of 1 UP token
  timestamp: number;
  formattedDate: string; // Formatted date for charts (e.g., "2024-01-15 14:30:25")
  blockNumber: bigint;
  swapBlockNumber: bigint; // The block where the swap happened
};
