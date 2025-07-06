'use client';

import { mockDebates } from '@/app/mockData';
import { notFound, useParams } from 'next/navigation';
import OpinionCard from '@/app/components/OpinionCard';
import OpinionStream from '@/app/components/OpinionStream';
import DebateOverview from '@/app/components/DebateOverview';
import Position from '@/app/components/Position';

export default function DebateDetailsPage() {
  const params = useParams();
  const debate = mockDebates.find((d) => d.opinionId.toString() === params.opinionId);

  if (!debate) return notFound();

  // Only use real data for the first debate (opinionId: 1)
  const useRealData = debate.opinionId === 1;

  return (
    <div className="min-h-screen p-4">
      <div className="w-full font-bold mx-auto">
        {/* Main Layout Grid - Browser First */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Combined Overview + Position */}
          <div className="col-span-8 space-y-5">
            <DebateOverview debate={debate} useRealData={useRealData} />
            <Position />
          </div>
          {/* Right Column - Opinion Stream + Opinion Card */}
          <div className="col-span-4 space-y-5 sticky top-4 h-fit">
            <OpinionStream opinions={debate.opinionStream || []} />
            <OpinionCard debateId={debate.opinionId} />
          </div>
        </div>
      </div>
    </div>
  );
}
