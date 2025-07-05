import { useState } from 'react';

export default function OpinionCard() {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [stance, setStance] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  // Mock prices - in real app these would come from props
  const yesPrice = 0.68;
  const noPrice = 0.32;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-2">
      {/* Compact Buy/Sell Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('buy')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'buy'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'sell'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Yes/No Buttons with Prices */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={() => setStance('yes')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              stance === 'yes'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">Yes</div>
              <div className="text-lg font-bold text-green-600">${yesPrice.toFixed(2)}</div>
            </div>
          </button>
          <button
            onClick={() => setStance('no')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              stance === 'no' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">No</div>
              <div className="text-lg font-bold text-red-600">${noPrice.toFixed(2)}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
            $
          </span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-8 pr-4 py-3 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Comment Dropdown */}
      <div className="space-y-2">
        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">Add reasoning (optional)</span>
          <svg
            className={`w-4 h-4 transition-transform ${showComment ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showComment && (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share why you feel this way..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        )}
      </div>

      {/* Submit Button */}
      <button
        className={`w-full px-6 py-4 rounded-lg text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
          mode === 'buy' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
        }`}
        disabled={!amount || parseFloat(amount) <= 0}
      >
        {mode === 'buy' ? 'Voice Opinion' : 'Sell Position'}
      </button>
    </div>
  );
}
