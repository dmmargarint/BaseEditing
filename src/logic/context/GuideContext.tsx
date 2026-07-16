import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Guide } from '../guides.ts';
import { useBaseEditorDesigner } from '../../hooks/useBaseEditorDesigner.ts';

type DesignerType = ReturnType<typeof useBaseEditorDesigner>;

export interface GuideContextType {
  designer: DesignerType
  selectedGuide: Guide | null;
  setSelectedGuide: (guide: Guide | null) => void;
  enrichedGuides: Guide[];
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export function GuideProvider({ children }: { children: React.ReactNode }) {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const designer = useBaseEditorDesigner({
    onAnalyseComplete: () => setSelectedGuide(null),
    onReset: () => setSelectedGuide(null),
  });

  // Memoize the value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    selectedGuide,
    setSelectedGuide,
    designer,
    enrichedGuides: designer.enrichedGuides,
  }), [selectedGuide, designer]);

  return (
    <GuideContext.Provider value={value}>
      {children}
    </GuideContext.Provider>
  );
}

export const useDesigner = () => {
  const context = useContext(GuideContext);
  if (!context) throw new Error("useDesigner must be used within GuideProvider");
  return context;
};