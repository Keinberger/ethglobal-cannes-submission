import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { marketType } from '../types'
import Link from 'next/link'

type Props = {
    market: marketType;
}

export default function MarketCard({ market }: Props) {
    return (
      <Link
        href={`/markets/${market.marketId}`}
        className="block bg-white rounded-xl shadow p-4 mb-4 hover:shadow-lg transition relative"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg text-gray-900">{market.title}</h2>
          <span className="text-xs text-gray-400">{market.lastUpdated}</span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex flex-col items-center">
            <span className="text-green-600 font-bold">{market.yesPercent}%</span>
            <span className="text-xs text-gray-500">Yes</span>
          </div>
          <div className="w-20 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={market.trend.map((v, i) => ({ x: i, y: v }))}>
                <Line type="monotone" dataKey="y" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-red-600 font-bold">{100 - market.yesPercent}%</span>
            <span className="text-xs text-gray-500">No</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total Liquidity: <span className="font-medium">${market.totalLiquidity.toLocaleString()}</span></span>
        </div>
      </Link>
    )
  }