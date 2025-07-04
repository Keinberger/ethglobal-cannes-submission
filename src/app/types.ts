export type marketType = {
    marketId: number;
    title: string;
    description: string;
    trend: number[];
    yesPercent: number;
    noPercent: number;
    yesPrice: number;
    noPrice: number;
    totalLiquidity: number;
    participants: number;
    lastUpdated: string;
};
