"use client"

"use client"

import React, { useState } from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import StatCard from '@/app/components/StatCard'
import PositionRow from '@/app/components/PositionRow'
import ToggleButton from '@/app/components/ToggleButton'
import { mockMarkets } from '@/app/mockData'
import { notFound, useParams } from 'next/navigation'

  export default function MarketDetailsPage() {
    const params = useParams();
    const [side, setSide] = useState<'yes' | 'no'>('yes')
    const [amount, setAmount] = useState('')
    const priceImpact = amount ? Math.min(Number(amount) * 0.01, 5).toFixed(2) : '0.00'

    const market = mockMarkets.find(m => m.marketId.toString() === params.marketId)
  
    if (!market) return notFound() // show 404 if ID not found
  
    const userPosition = {
      yesTokens: 120,
      noTokens: 0,
      value: 81.6,
      pnl: 12.3,
    }
  
    return (
      <div className="min-h-screen pb-24">
        <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
  
          {/* Title + Description */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{market.title}</h1>
            {market.description && <p className="text-sm text-gray-600 mt-1">{market.description}</p>}
          </div>
  
          {/* Sentiment Chart */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Sentiment History</h2>
            <div className="bg-white rounded-xl shadow p-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={market.trend.map((y, x) => ({ x, y }))}>
                  <XAxis dataKey="x" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip formatter={(v: number) => `${v}% Yes`} />
                  <Line type="monotone" dataKey="y" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
  
          {/* Stats */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Market Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Yes" value={`${market.yesPercent}%`} color="text-green-600" />
              <StatCard label="No" value={`${market.noPercent}%`} color="text-red-600" />
              <StatCard label="Liquidity" value={`$${market.totalLiquidity.toLocaleString()}`} />
              <StatCard label="Users" value={market.participants.toString()} />
            </div>
          </section>
  
          {/* Trade Box */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Trade</h2>
            <div className="bg-white rounded-xl shadow p-4 space-y-3">
              <div className="flex gap-2">
                <ToggleButton label="Buy Yes" active={side === 'yes'} onClick={() => setSide('yes')} color="green" />
                <ToggleButton label="Buy No" active={side === 'no'} onClick={() => setSide('no')} color="red" />
              </div>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Est. Price Impact: <strong className="text-gray-700">{priceImpact}%</strong></span>
                <span>Slippage: <strong className="text-gray-700">0.5%</strong></span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition">Buy</button>
                <button className="flex-1 px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition">Sell</button>
              </div>
            </div>
          </section>
  
          {/* Position */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Position</h2>
            <div className="bg-white rounded-xl shadow p-4 space-y-1 text-sm">
              <PositionRow label="Yes Tokens" value={userPosition.yesTokens} />
              <PositionRow label="No Tokens" value={userPosition.noTokens} />
              <PositionRow label="Current Value" value={`$${userPosition.value.toFixed(2)}`} />
              <PositionRow
                label="Profit/Loss"
                value={`${userPosition.pnl >= 0 ? '+' : ''}${userPosition.pnl.toFixed(2)}`}
                color={userPosition.pnl >= 0 ? 'text-green-600' : 'text-red-600'}
              />
            </div>
          </section>
  
        </div>
      </div>
    )
  }
