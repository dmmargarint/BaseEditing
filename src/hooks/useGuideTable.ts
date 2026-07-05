import type { Guide } from '../logic/guides.ts';
import { useState, useMemo } from 'react';

export function useGuideTable(guides: Guide[]) {
  const [sortBy, setSortBy] = useState<"score" | "bystanders" | "hitsDesiredSite">("bystanders");

  const sortedGuides = useMemo(() => {
    const copy = [...guides];
    switch (sortBy) {
      case 'score':
        return copy.sort((a, b) =>
          (b.analysis?.efficiencyScore ?? -1) - (a.analysis?.efficiencyScore ?? -1)
        );
      case 'bystanders':
        return copy.sort((a, b) => a.numBystanders - b.numBystanders);
      case 'hitsDesiredSite':
        return copy.sort((a, b) => Number(b.hitsDesiredSite) - Number(a.hitsDesiredSite));
    }
  }, [guides, sortBy]);

  return {
    sortBy,
    setSortBy,
    sortedGuides,
  };
}
