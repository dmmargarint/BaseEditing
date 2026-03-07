import type { Guide } from '../guides.ts';
import { GuideTable } from './GuideTable.tsx';
import { useDesigner } from '../context/GuideContext.tsx';

export function GuidesView ({ enrichedGuides }: { enrichedGuides: Guide[] }) {
  const { setSelectedGuide, selectedGuide } = useDesigner();

  return (
    <>
      <div className="flex-1">
          <GuideTable
            enrichedGuides={enrichedGuides}
            selectedGuide={selectedGuide}
            // sortBy={sortBy}
            // setSortBy={setSortBy}
            onSelectGuide={setSelectedGuide}
          />
      </div>
    </>
  );
}