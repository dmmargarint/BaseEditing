import type { Guide } from '../logic/guides.ts';
import { GuideTable } from './GuideTable.tsx';
import { GuideDetails } from './GuideDetails.tsx';
import { useBaseEditorDesigner } from '../hooks/useBaseEditorDesigner.ts';
import { useGuideTable } from '../hooks/useGuideTable.ts';
import { useGuideSelection } from '../logic/context/GuideContext.tsx';

export function GuidesView ({ guides }: { guides: Guide[] }) {
  // const {
  //   sortBy,
  //   setSortBy,
  //   // sortedGuides,
  //   // selectedGuide,
  //   // setSelectedGuide,
  // } = useGuideTable(guides);

  const { selectedGuide, setSelectedGuide } = useGuideSelection();

  return (
    <>
      <div className="">
          <GuideTable
            guides={guides}
            // sortBy={sortBy}
            // setSortBy={setSortBy}
            onSelectGuide={setSelectedGuide}
          />
      </div>
    </>
  );
}