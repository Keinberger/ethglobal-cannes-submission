'use client';

import React from 'react';
import DebateCard from '../components/DebateCard';
import { mockDebates } from '../mockData';

export default function DebatesPage() {
  return (
    <div className="min-h-screen pb-24 relative">
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Active Debates</h1>
        <div className="grid grid-cols-2 gap-10">
          {mockDebates.map((debate) => (
            <DebateCard key={debate.opinionId} debate={debate} />
          ))}
        </div>
      </main>
    </div>
  );
}
