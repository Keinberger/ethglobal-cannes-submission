"use client"

import React from 'react'
import MarketCard from '../components/MarketCard'
import { mockMarkets } from '../mockData'

export default function MarketsPage() {
    return (
      <div className="min-h-screen pb-24 relative">
        <main className="max-w-2xl mx-auto px-4 mt-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Active Markets</h1>
          <div className="space-y-4">
            {mockMarkets.map(market => (
                <MarketCard key={market.marketId} market={market} />
            ))}
          </div>
        </main>
      </div>
    )
  }
