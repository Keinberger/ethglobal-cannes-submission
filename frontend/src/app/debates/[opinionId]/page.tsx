'use client';

import { mockDebates } from '@/app/mockData';
import { notFound, useParams } from 'next/navigation';
import OpinionCard from '@/app/components/OpinionCard';
import OpinionStream from '@/app/components/OpinionStream';
import OpinionTimeline from '@/app/components/OpinionTimeline';
import DebateHeader from '@/app/components/DebateHeader';

export default function DebateDetailsPage() {
  const params = useParams();
  const debate = mockDebates.find((d) => d.opinionId.toString() === params.opinionId);

  if (!debate) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full mx-auto">
        {/* Main Layout Grid - Browser First */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Column - Header + Opinion Timeline (Expanded) */}
          <div className="col-span-8 space-y-5">
            <DebateHeader debate={debate} />
            <OpinionTimeline trend={debate.trend} />
          </div>
          {/* Right Column - Opinion Stream + Opinion Card*/}
          <div className="col-span-4 space-y-5">
            <OpinionStream opinions={debate.opinionStream || []} />
            <OpinionCard />
          </div>
        </div>
      </div>
    </div>
  );
}
