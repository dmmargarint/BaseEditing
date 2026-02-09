import type { Guide } from '../guides.ts';
import { GuideTable } from './GuideTable.tsx';
import { useDesigner } from '../context/GuideContext.tsx';

export function GuidesView ({ guides }: { guides: Guide[] }) {
  const { setSelectedGuide, selectedGuide } = useDesigner();

  return (
    <>
      <div className="flex-1">
          <GuideTable
            guides={guides}
            selectedGuide={selectedGuide}
            // sortBy={sortBy}
            // setSortBy={setSortBy}
            onSelectGuide={setSelectedGuide}
          />
      </div>
    </>
  );
}