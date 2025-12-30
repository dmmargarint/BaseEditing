import type { Guide } from '../logic/guides.ts';
import { GuideTable } from './GuideTable.tsx';
import { GuideDetails } from './GuideDetails.tsx';
import { useBaseEditorDesigner } from '../hooks/useBaseEditorDesigner.ts';
import { useGuideTable } from '../hooks/useGuideTable.ts';

export function GuidesView ({ guides }: { guides: Guide[] }) {
  const {
    sortBy,
    setSortBy,
    sortedGuides,
    selectedGuide,
    setSelectedGuide,
  } = useGuideTable(guides);

  return (
    <>
      <div className="flex">
        <div className="">
          <GuideTable
            guides={sortedGuides}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onSelectGuide={setSelectedGuide}
          />
        </div>
        <div style={{ width: 420 }}>
          <GuideDetails key={selectedGuide?.guideSeq} guide={selectedGuide} />
        </div>
      </div>
    </>
  );
}