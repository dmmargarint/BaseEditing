import type { Guide } from '../guides.ts';
import { useState } from 'react';


export function GuideDetails({ guide}: {guide: Guide | null}) {
  if (!guide) return <div>Select a guide to see details.</div>;
  const [showTargetStrand, setShowTargetStrand] = useState(false);

  console.log('GuideDetails render, guide id:', guide?.guideSeq);

  const targetSet = new Set(guide.targetEdits.map(e => e.genomicPos));
  const bystanderSet = new Set(guide.bystanderEdits.map(e => e.genomicPos));
  const editGenomicPos = new Set(guide.allEdits.map(e => e.genomicPos));
  const editingWindowSet = new Set(guide.editingWindowGenomic);
  const indexMap = new Set(guide.indexMap);

  const pamIndices = new Set();
  for (let i = guide.pam.startPos; i < guide.pam.endPos; i++) {
    pamIndices.add(i);
  }

  const displayStart = guide.ui.displayStart;
  const originalBases = guide.ui.uiGenomicSeq.split('')
  const postEditBases = guide.ui.uiPostEditGenomicSeq.split('');

  /**
   * TODO fix the editable window/target/bystander positions for 3' PAM on - strand
   */

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
          <h3 className="text-lg text-center justify-center font-bold text-slate-800">Visualisation (5' - 3') + Strand</h3>
          {/*TODO fix the strand */}
          {/*<p className="text-xs text-slate-500 font-mono">Guide Strand (incorrect): {guide.pam.strand} | PAM: {guide.pam.pamSeq}</p>*/}
        </div>
        {/*<button*/}
        {/*  onClick={() => setShowTargetStrand(!showTargetStrand)}*/}
        {/*  className="px-3 py-1.5 bg-white border rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"*/}
        {/*>*/}
        {/*  View: {showTargetStrand ? "Target Strand" : "Genomic Plus Strand"}*/}
        {/*</button>*/}
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex flex-row min-w-max">
          <div className="flex flex-col items-center group">
            <span className="h-6 text-[10px]"></span>
            <div className="h-6 flex items-center justify-center"></div>
            <div className="w-34 h-10 flex items-center font-mono font-bold text-base border-x border-transparent "><span>Original</span></div>
          </div>
          {originalBases.map((base, i) => {
            const absPos = displayStart + i;
            const absPos1Base = absPos + i;
            const isTarget = targetSet.has(absPos);
            const isBystander = bystanderSet.has(absPos);
            const isInWindow = editingWindowSet.has(absPos);
            const isPam = pamIndices.has(absPos);

            const isSpacer = indexMap.has(absPos);

            return (
              <div key={`guide_details_original_seq_${i}`} className="flex flex-col items-center group">
                {/* Genomic Ruler (Every 5th base) */}
                <span className="h-6 text-[10px] text-slate-400 font-mono">
                  {absPos1Base % 5 === 0 ? absPos1Base : ''}
                </span>

                {/* Target/Bystander Icons */}
                <div className="h-6 flex items-center justify-center">
                  {isTarget && <span className="tooltip tooltip-content text-green-500 text-xs" data-tip="Target" style={{cursor: 'pointer'}}>🎯</span>}
                  {isBystander && <span className="tooltip tooltip-content text-amber-500 text-xs" data-tip="Bystander" style={{cursor: 'pointer'}}>⚠️</span>}
                </div>

                {/* The Sequence Base */}
                <div className={`
                  w-4 h-10 flex items-center justify-center font-mono font-bold text-base
                  ${isInWindow ? 'bg-yellow-50 text-slate-900' : 'text-slate-600'}
                  ${isTarget ? 'text-green-600' : ''}
                  ${isBystander ? 'text-amber-600' : ''}
                  border-x border-transparent group-hover:border-slate-200 group-hover:bg-slate-50
                `} style={{cursor: 'pointer'}}>
                  {getChar(base)}
                </div>

                {/* Feature Brackets (Spacer / PAM) */}
                <div className="w-2/3 h-1 mt-0.5 flex">
                  {isSpacer && <div className="w-full h-full bg-blue-700 rounded-full" title="Spacer" />}
                  {isPam && <div className="w-full h-full bg-green-600 rounded-full" title="PAM" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-row min-w-max">
          <div className="w-34 h-10 flex"></div>
          {originalBases.map((base, i) => {
            const absPos = displayStart + i;
            const isEdited = editGenomicPos.has(absPos);
            return (
              <div key={`guide_details_edit_arrows_${i}`}>
                <div className={`
                    w-4 h-10 flex items-center justify-center font-mono font-bold text-base
                    border-x border-transparent group-hover:border-slate-200 group-hover:bg-slate-50
                  `} style={{cursor: 'pointer'}}>
                  {isEdited && '↓'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-row min-w-max">
          <div className="flex flex-col items-center group">
            <div className="w-34 h-10 flex items-center font-mono font-bold text-base border-x border-transparent"><span>Post Editing</span></div>
          </div>
          {postEditBases.map((base, i) => {
            const absPos = displayStart + i;
            const isBystander = bystanderSet.has(absPos);
            const isInWindow = editingWindowSet.has(absPos);
            const isPam = pamIndices.has(absPos);

            const isSpacer = indexMap.has(absPos);

            return (
              <div key={`guide_details_edited_seq_${i}`} className="flex flex-col items-center group">

                {/* The Sequence Base */}
                <div className={`
                  w-4 h-10 flex items-center justify-center font-mono font-bold text-base
                  ${isInWindow ? 'bg-yellow-50 text-slate-900' : 'text-slate-600'}
                  ${isBystander ? 'text-amber-600' : ''}
                  border-x border-transparent group-hover:border-slate-200 group-hover:bg-slate-50
                `} style={{cursor: 'pointer'}}>
                  {getChar(base)}
                </div>

                {/* Feature Brackets (Spacer / PAM) */}
                <div className="w-2/3 h-1 mt-0.5 flex">
                  {isSpacer && <div className="w-full h-full bg-blue-700 rounded-full" title="Spacer" />}
                  {isPam && <div className="w-full h-full bg-green-600 rounded-full" title="PAM" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Legend */}
      <div className="px-6 py-3 bg-slate-50 border-t flex gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-700 rounded-full" /> Spacer</div>
        <div className="flex items-center gap-2"><div className="w-3 h-1 bg-green-600 rounded-full" /> PAM</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded" /> Editing Window</div>
      </div>
    </div>
  );
}
