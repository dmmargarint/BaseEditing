import type { Guide } from '../logic/guides.ts';
import { useMemo, useState } from 'react';
import type { EditorConfig } from '../logic/editorTypes.ts';
import { ALL_EDITORS } from '../logic/editorConfigs.ts';
import { useGuideSelection } from '../logic/context/GuideContext.tsx';

export function useGuideTable(guides: Guide[]) {
  const [sortBy, setSortBy] = useState<"score" | "bystanders" | "hitsDesiredSite">("bystanders");

  // const { selectedGuide } = useGuideSelection();

  // const [selectedGuideSeq, setSelectedGuideSeq] = useState<string | null>(null);

  // const sortedGuides: Guide[] = useMemo((): Guide[] => {
  //   if (sortBy === "score") {
  //     // TODO rewrite
  //     return guides;
  //   }
  //
  //   if (sortBy === "bystanders") {
  //     return [...guides].sort((a, b) => (a.numBystanders ?? 0) - (b.numBystanders ?? 0));
  //   }
  //
  //   if (sortBy === "hitsDesiredSite") {
  //     //
  //   }
  // }, [guides, sortBy]);

  const sortedGuides = guides;

  console.log('selectedGuide', selectedGuide);

  return {
    sortBy,
    setSortBy,
    sortedGuides,
    // selectedGuide,
    // setSelectedGuide: setSelectedGuideSeq,
  };
}