import Image from 'next/image';
import { debateType } from '../types';

type Props = {
  debate: debateType;
};

export default function DebateHeader({ debate }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image src={debate.image} alt={debate.title} fill className="object-cover rounded" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{debate.title}</h1>
          <p className="text-gray-600 text-sm mb-3">{debate.description}</p>

          {/* Compact Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-lg text-gray-500 mb-1">
              <span className="text-green-600 font-medium">{debate.yesPercent}% Yes</span>
              <span className="text-red-600 font-medium">{debate.noPercent}% No</span>
            </div>
            <div className="w-full bg-red-600 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${debate.yesPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{debate.participants} participants</span>
            <span>•</span>
            <span>Updated {debate.lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
