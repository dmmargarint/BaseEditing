import type { Guide } from '../logic/guides.ts';
import { GuideTable } from './GuideTable.tsx';
import { useDesigner } from '../logic/context/GuideContext.tsx';

export function GuidesView ({ guides }: { guides: Guide[] }) {

  console.log('Guides in GuideView:');
  console.log(guides);
  // const {
  //   sortBy,
  //   setSortBy,
  //   // sortedGuides,
  //   // selectedGuide,
  //   // setSelectedGuide,
  // } = useGuideTable(guides);

  const { setSelectedGuide } = useDesigner();

  return (
    <>
      <div className="flex-1">
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