import { debateType } from '../types';
import Link from 'next/link';
import Image from 'next/image';

type Props = {
  debate: debateType;
};

export default function DebateCard({ debate }: Props) {
  return (
    <Link
      href={`/debates/${debate.opinionId}`}
      className="block bg-white rounded-xl shadow hover:shadow-lg transition relative overflow-hidden"
    >
      {/* Debate Image */}
      <div className="relative w-full h-48">
        <Image
          src={debate.image}
          alt={debate.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and timestamp */}
        <div className="flex justify-between items-start mb-3">
          <h2 className="font-semibold text-lg text-gray-900 line-clamp-2">{debate.title}</h2>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{debate.lastUpdated}</span>
        </div>

        {/* Current state of debate */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{debate.yesPercent}%</div>
              <div className="text-xs text-gray-500">Yes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{debate.noPercent}%</div>
              <div className="text-xs text-gray-500">No</div>
            </div>
          </div>
        </div>

        {/* Recent comment */}
        {debate.opinionStream && debate.opinionStream.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-700">
                {debate.opinionStream[0].author}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  debate.opinionStream[0].stance === 'yes'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {debate.opinionStream[0].stance.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">{debate.opinionStream[0].timestamp}</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{debate.opinionStream[0].text}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
