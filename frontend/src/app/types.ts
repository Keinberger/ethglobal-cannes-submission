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
