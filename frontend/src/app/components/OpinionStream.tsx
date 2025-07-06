import { opinionType } from '../types';

type Props = {
  opinions: opinionType[];
};

export default function OpinionStream({ opinions }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex gap-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Live Opinion Stream</h3>
        <div className={`w-2 h-2 rounded-full mt-2.5 flex-shrink-0 bg-red-500`} />
      </div>

      <div className="space-y-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {opinions.map((opinion, index) => (
          <div
            key={`${opinion.author}-${index}`}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200 hover:bg-gray-100 transition-colors"
          >
            {/* Stance indicator */}
            <div
              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                opinion.stance === 'yes' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />

            <div className="flex-1 min-w-0">
              {/* User info and amount */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900">{opinion.author}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    opinion.stance === 'yes'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {opinion.stance.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-indigo-600">${opinion.amount}</span>
                <span className="text-xs text-gray-400">{opinion.timestamp}</span>
              </div>

              {/* Comment */}
              {opinion.text && <p className="text-sm text-gray-600 line-clamp-2">{opinion.text}</p>}
            </div>
          </div>
        ))}

        {opinions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No opinions voiced yet.</p>
            <p className="text-sm">Be the first to share your stance!</p>
          </div>
        )}
      </div>
    </div>
  );
}
