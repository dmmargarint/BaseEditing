import type { Guide } from '../logic/guides.ts';
import { useState } from 'react';


export function GuideDetails({ guide }: {guide: Guide | null}) {
  if (!guide) return <div>Select a guide to see details.</div>;
  const [showTargetStrand, setShowTargetStrand] = useState(false);

  console.log('GuideDetails render, guide id:', guide?.guideSeq);

  const targetGenomicPos = new Set(guide.targetEdits.map(e => e.genomicPos));
  const bystanderGenomicPos = new Set(guide.bystanderEdits.map(e => e.genomicPos));
  const editGenomicPos = new Set(guide.allEdits.map(e => e.genomicPos));
  const editingWindowGenomicPos = new Set(guide.editingWindowGenomic);
  const pamIndices = new Set();
  for (let i = guide.pam.startPos; i < guide.pam.endPos; i++) {
    pamIndices.add(i);
  }

  const startOffset = guide.genomicRange.start;

  // const originalBases = guide.genomicSeq.split('');
  const originalBases = guide.genomicSeqPlusStrand.split('')
  const editedBases = guide.postEditSeqOverGuideLengthPlusStrand.split('');

  const L: number = originalBases.length;

  /**
   * TODO fix the editable window/target/bystander positions for 3' PAM on - strand
   */


  const renderBases = (bases: string[]) => {
    return bases.map((base, i) => {
      const absPos = startOffset + i;

      const isInWindow = editingWindowGenomicPos.has(absPos);
      const isTarget = targetGenomicPos.has(absPos);
      const isBystander = bystanderGenomicPos.has(absPos);
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

  return (
    <div className="guide-display">
      <div className="sequence-row">
        <span className="label">Original (Genome +):</span>
        <div className="bases">{renderBases(originalBases)}</div>
      </div>
      <div className="sequence-row">
        <span className="label">Edited (Genome +):</span>
        <div className="bases">{renderBases(editedBases)}</div>
      </div>
    </div>
  );
}
