"use client"

import React, { useState } from 'react'

export default function CreateDebatesPage() {
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  // For now, assume user is logged in
  const isLoggedIn = true

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="max-w-xl mx-auto px-2 mt-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Market</h1>
        {!isLoggedIn ? (
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <p className="mb-4 text-gray-700">You must be logged in to create a market.</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Login</button>
          </div>
        ) : (
          <form className="bg-white rounded-xl shadow p-6">
            <label className="block mb-2 font-medium">Market Question</label>
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. Should billionaires exist?"
              className="w-full border rounded px-3 py-2 mb-4"
              maxLength={120}
              required
            />
            <label className="block mb-2 font-medium">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add context or background (optional)"
              className="w-full border rounded px-3 py-2 mb-4"
              rows={3}
              maxLength={300}
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-semibold"
            >
              Submit Market
            </button>
          </form>
        )}
        {/* Real-time Preview */}
        <div className="mt-8">
          <h2 className="font-semibold text-lg mb-2">Preview</h2>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{question || 'Your market question will appear here'}</h3>
            {description && <p className="text-gray-600 text-sm">{description}</p>}
          </div>
        </div>
      </main>
    </div>
  )
}
