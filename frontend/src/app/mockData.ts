import { debateType, opinionType } from "./types"

const billionairesOpinions: opinionType[] = [
    { author: "Alex_Crypto", stance: "no", amount: 250, text: "Wealth concentration is fundamentally harmful to society", timestamp: "3m ago" },
    { author: "EconStudent", stance: "yes", amount: 100, text: "They create jobs and drive innovation", timestamp: "5m ago" },
    { author: "Sarah M.", stance: "no", amount: 150, text: "No one needs that much money while others suffer", timestamp: "7m ago" },
    { author: "BusinessOwner", stance: "yes", amount: 300, text: "", timestamp: "10m ago" },
    { author: "SocialActivist", stance: "no", amount: 75, text: "Tax them heavily and redistribute", timestamp: "12m ago" },
    { author: "InvestorMike", stance: "yes", amount: 500, text: "Free market capitalism at work", timestamp: "15m ago" }
];

const gazaOpinions: opinionType[] = [
    { author: "Ahmad K.", stance: "no", amount: 200, text: "Violence never solves underlying issues", timestamp: "7m ago" },
    { author: "PeaceAdvocate", stance: "no", amount: 150, text: "Diplomatic solutions are always better", timestamp: "10m ago" },
    { author: "HistoryBuff", stance: "yes", amount: 100, text: "Sometimes force is the only language understood", timestamp: "12m ago" },
    { author: "MiddleEastExpert", stance: "no", amount: 300, text: "This cycle of violence must end", timestamp: "15m ago" },
    { author: "Realist2024", stance: "yes", amount: 125, text: "", timestamp: "18m ago" }
];

const aiOpinions: opinionType[] = [
    { author: "Tech_Optimist", stance: "yes", amount: 400, text: "AI will free us from mundane tasks and allow more creativity", timestamp: "2m ago" },
    { author: "FutureWorker", stance: "no", amount: 200, text: "Job displacement will cause massive suffering", timestamp: "4m ago" },
    { author: "DataScientist", stance: "yes", amount: 350, text: "AI can solve climate change and disease", timestamp: "6m ago" },
    { author: "PhilosophyMajor", stance: "no", amount: 100, text: "Human connection and meaning will be lost", timestamp: "8m ago" },
    { author: "StartupFounder", stance: "yes", amount: 600, text: "", timestamp: "11m ago" },
    { author: "EthicsProf", stance: "no", amount: 250, text: "Too many risks we don't understand yet", timestamp: "13m ago" }
];

const climateOpinions: opinionType[] = [
    { author: "ClimateScientist", stance: "yes", amount: 500, text: "We have less than 10 years to act decisively", timestamp: "1m ago" },
    { author: "EnergyWorker", stance: "no", amount: 180, text: "Green transition will destroy millions of jobs", timestamp: "3m ago" },
    { author: "GreenActivist", stance: "yes", amount: 220, text: "The planet is more important than short-term profits", timestamp: "5m ago" },
    { author: "EconAnalyst", stance: "no", amount: 400, text: "Cost would bankrupt developing nations", timestamp: "8m ago" },
    { author: "YouthClimate", stance: "yes", amount: 150, text: "My generation will inherit this mess", timestamp: "12m ago" }
];

const cryptoOpinions: opinionType[] = [
    { author: "BitcoinMaxi", stance: "yes", amount: 800, text: "Decentralized money is the future of freedom", timestamp: "4m ago" },
    { author: "TradFi_Banker", stance: "no", amount: 300, text: "Too volatile and risky for mainstream adoption", timestamp: "6m ago" },
    { author: "DeFi_Builder", stance: "yes", amount: 450, text: "Traditional finance is broken, we're fixing it", timestamp: "9m ago" },
    { author: "RegulatorJoe", stance: "no", amount: 200, text: "Needs proper oversight to prevent fraud", timestamp: "11m ago" },
    { author: "TechInvestor", stance: "yes", amount: 600, text: "Blockchain tech will revolutionize everything", timestamp: "14m ago" },
    { author: "EnergyExpert", stance: "no", amount: 250, text: "Environmental impact is catastrophic", timestamp: "17m ago" }
];

const remoteOpinions: opinionType[] = [
    { author: "DigitalNomad", stance: "yes", amount: 320, text: "Best work-life balance I've ever had", timestamp: "2m ago" },
    { author: "OfficeManager", stance: "no", amount: 180, text: "Team collaboration suffers significantly", timestamp: "5m ago" },
    { author: "WorkingParent", stance: "yes", amount: 275, text: "Finally can spend time with my kids", timestamp: "7m ago" },
    { author: "StartupCEO", stance: "no", amount: 400, text: "Company culture dies without in-person interaction", timestamp: "10m ago" },
    { author: "DevOps_Pro", stance: "yes", amount: 350, text: "More productive without office distractions", timestamp: "13m ago" }
];

export const mockDebates: debateType[] = [
    {
      opinionId: 1,
      title: 'Should billionaires exist?',
      description: 'A debate on the existence and role of billionaires in society.',
      image: '/debates/billionaires.png',
      trend: [45, 48, 52, 55, 58, 60, 62, 65, 67, 68, 70, 69, 68, 66, 67, 68, 69, 68],
      yesPercent: 68,
      noPercent: 32,
      yesPrice: 0.68,
      noPrice: 0.32,
      totalLiquidity: 12000,
      participants: 42,
      lastUpdated: '2m ago',
      opinionStream: billionairesOpinions
    },
    {
      opinionId: 2,
      title: 'Is the Gaza conflict necessary?',
      description: 'A look at the ongoing conflict and its implications.',
      image: '/debates/gaza.png',
      trend: [55, 52, 50, 48, 46, 45, 43, 42, 40, 38, 39, 40, 41, 42, 41, 40, 41],
      yesPercent: 41,
      noPercent: 59,
      yesPrice: 0.41,
      noPrice: 0.59,
      totalLiquidity: 8000,
      participants: 28,
      lastUpdated: '5m ago',
      opinionStream: gazaOpinions
    },
    {
      opinionId: 3,
      title: 'Will AI improve human happiness?',
      description: 'Exploring the impact of AI on human well-being.',
      image: '/debates/ai.png',
      trend: [62, 65, 68, 70, 72, 73, 75, 76, 77, 76, 75, 74, 73, 74, 75, 74, 73, 74],
      yesPercent: 74,
      noPercent: 26,
      yesPrice: 0.74,
      noPrice: 0.26,
      totalLiquidity: 15000,
      participants: 35,
      lastUpdated: '1m ago',
      opinionStream: aiOpinions
    },
    {
      opinionId: 4,
      title: 'Should we prioritize climate action over economic growth?',
      description: 'The tension between environmental protection and economic development.',
      image: '/debates/climate.png',
      trend: [40, 42, 45, 48, 50, 52, 55, 58, 60, 61, 59, 57, 56, 58, 60, 61, 62, 62],
      yesPercent: 62,
      noPercent: 38,
      yesPrice: 0.62,
      noPrice: 0.38,
      totalLiquidity: 18000,
      participants: 48,
      lastUpdated: '3m ago',
      opinionStream: climateOpinions
    },
    {
      opinionId: 5,
      title: 'Is cryptocurrency the future of money?',
      description: 'Exploring whether digital currencies will replace traditional finance.',
      image: '/debates/crypto.png',
      trend: [65, 62, 60, 58, 55, 52, 49, 47, 45, 43, 45, 48, 50, 51, 53, 55, 56, 58],
      yesPercent: 58,
      noPercent: 42,
      yesPrice: 0.58,
      noPrice: 0.42,
      totalLiquidity: 22000,
      participants: 67,
      lastUpdated: '4m ago',
      opinionStream: cryptoOpinions
    },
    {
      opinionId: 6,
      title: 'Should remote work become the permanent standard?',
      description: 'The future of work in a post-pandemic world.',
      image: '/debates/remote-work.png',
      trend: [55, 58, 62, 65, 67, 70, 72, 74, 76, 75, 73, 69, 66, 68, 70, 72, 73, 75],
      yesPercent: 75,
      noPercent: 25,
      yesPrice: 0.75,
      noPrice: 0.25,
      totalLiquidity: 14000,
      participants: 39,
      lastUpdated: '6m ago',
      opinionStream: remoteOpinions
    },
  ]