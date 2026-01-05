import type { Guide } from '../logic/guides.ts';
import { useState } from 'react';


export function GuideDetails({ guide}: {guide: Guide | null}) {
  if (!guide) return <div>Select a guide to see details.</div>;
  const [showTargetStrand, setShowTargetStrand] = useState(false);

  console.log('GuideDetails render, guide id:', guide?.guideSeq);

  const targetSet = new Set(guide.targetEdits.map(e => e.genomicPos));
  const bystanderSet = new Set(guide.bystanderEdits.map(e => e.genomicPos));
  const editGenomicPos = new Set(guide.allEdits.map(e => e.genomicPos));
  const editingWindowSet = new Set(guide.editingWindowGenomic);
  const pamIndices = new Set();
  for (let i = guide.pam.startPos; i < guide.pam.endPos; i++) {
    pamIndices.add(i);
  }

  const displayStart = guide.ui.displayStart;
  const originalBases = guide.ui.uiGenomicSeq.split('')
  // const editedBases = guide.ui.uiPostEditGenomicSeq.split('');

  /**
   * TODO fix the editable window/target/bystander positions for 3' PAM on - strand
   */


  const renderBases = (bases: string[]) => {
    return bases.map((base, i) => {
      const absPos = displayStart + i;

      const isInWindow = editingWindowSet.has(absPos);
      const isTarget = targetSet.has(absPos);
      const isBystander = bystanderSet.has(absPos);
      const isEdited = editGenomicPos.has(absPos);
      const isPam = pamIndices.has(absPos);

      let displayBase = base;

      const className = [
        'base',
        isInWindow && 'in-window',
        isTarget && 'target',
        isBystander && 'bystander',
        isEdited && 'edited',
        isPam && 'pam-highlight',
      ].filter(Boolean).join(' ');

      return (
        <span key={absPos} className={className} title={`Genomic Pos: ${absPos}`}>
          {isEdited ? <b>{displayBase}</b> : displayBase}
        </span>
      );
    });
  }

  // Helper to get display character
  const getChar = (base) => {
    const COMPLEMENT = { A: 'T', T: 'A', C: 'G', G: 'C' };
    // TODO verify guide.pam.strand here
    return (showTargetStrand && guide.pam.strand === '-') ? COMPLEMENT[base] : base;
  };

  return (
    // <div className="guide-display">
    //   <div className="sequence-row">
    //     <span className="label">Original (Genome + strand):</span>
    //     <div className="bases">{renderBases(originalBases)}</div>
    //   </div>
    //   <div className="sequence-row">
    //     <span className="label">Edited (Genome + strand):</span>
    //     <div className="bases">{renderBases(editedBases)}</div>
    //   </div>
    // </div>

    <div className="bg-white border rounded-xl shadow-sm overflow-hidden font-sans">
      {/* Header & Toggle */}
      <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Guide Visualization</h3>
          <p className="text-xs text-slate-500 font-mono">Strand: {guide.pam.strand} | PAM: {guide.pam.pamSeq}</p>
        </div>
        <button
          onClick={() => setShowTargetStrand(!showTargetStrand)}
          className="px-3 py-1.5 bg-white border rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          View: {showTargetStrand ? "Target Strand" : "Genomic Plus Strand"}
        </button>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex flex-row min-w-max">
          {originalBases.map((base, i) => {
            const absPos = displayStart + i;
            const isTarget = targetSet.has(absPos);
            const isBystander = bystanderSet.has(absPos);
            const isInWindow = editingWindowSet.has(absPos);
            const isPam = pamIndices.has(absPos);

            // Determine if part of Spacer or PAM
            // Assuming the extracted slice is [Spacer][PAM]
            const isSpacer = i < 20;
            // const isPam = i >= 20 && i < 20 + guide.pam.length;

            return (
              <div key={absPos} className="flex flex-col items-center group">
                {/* 1. Genomic Ruler (Every 5th base) */}
                <span className="h-6 text-[10px] text-slate-400 font-mono">
                  {absPos % 5 === 0 ? absPos : ''}
                </span>

                {/* 2. Target/Bystander Icons */}
                <div className="h-6 flex items-center justify-center">
                  {isTarget && <span title="Target" className="text-green-500 text-xs">🎯</span>}
                  {isBystander && <span title="Bystander" className="text-amber-500 text-xs">⚠️</span>}
                </div>

                {/* 3. The Sequence Base */}
                <div className={`
                  w-4 h-10 flex items-center justify-center font-mono font-bold text-base
                  ${isInWindow ? 'bg-yellow-50 text-slate-900' : 'text-slate-600'}
                  ${isTarget ? 'text-green-600' : ''}
                  ${isBystander ? 'text-amber-600' : ''}
                  border-x border-transparent group-hover:border-slate-200 group-hover:bg-slate-50
                `}>
                  {getChar(base)}
                </div>

                {/* 4. Feature Brackets (Spacer / PAM) */}
                <div className="w-2/3 h-1 mt-0.5 flex">
                  {isSpacer && <div className="w-full h-full bg-blue-400 rounded-full" title="Spacer" />}
                  {isPam && <div className="w-full h-full bg-purple-500 rounded-full" title="PAM" />}
                </div>

                {/* 5. Feature Labels (Hidden until hover) */}
                {/*<span className="mt-2 text-[5px] uppercase font-bold tracking-tighter text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">*/}
                {/*  {isSpacer ? 'Spacer' : isPam ? 'PAM' : ''}*/}
                {/*</span>*/}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-slate-50 border-t flex gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-400 rounded-full" /> Spacer</div>
        <div className="flex items-center gap-2"><div className="w-3 h-1 bg-purple-500 rounded-full" /> PAM</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded" /> Editing Window</div>
      </div>
    </div>
  );
}
