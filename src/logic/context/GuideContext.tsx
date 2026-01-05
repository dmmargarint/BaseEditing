import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Guide } from '../guides.ts';

interface GuideContextType {
  selectedGuide: Guide | null;
  setSelectedGuide: (guide: Guide | null) => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export function GuideProvider({ children }: { children: React.ReactNode }) {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  // Memoize the value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({
    selectedGuide,
    setSelectedGuide
  }), [selectedGuide]);

  return (
    <GuideContext.Provider value={value}>
      {children}
    </GuideContext.Provider>
  );


  // return (
  //   <GuideContext.Provider value={{ selectedGuide, setSelectedGuide }}>
  //     {children}
  //   </GuideContext.Provider>
  // );
}

export const useGuideSelection = () => {
  const context = useContext(GuideContext);
  if (!context) throw new Error("useGuideSelection must be used within GuideProvider");
  return context;
};