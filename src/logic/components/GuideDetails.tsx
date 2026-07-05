import type { Guide } from '../guides.ts';


function ScoreSummary({ guide }: { guide: Guide }) {
  const analysis = guide.analysis;
  if (!analysis) return null;

  const eff = analysis.efficiencyScore !== undefined ? Math.round(analysis.efficiencyScore) : null;
  const globalRisk = analysis.globalRiskScore !== undefined ? Math.round(analysis.globalRiskScore) : null;
  const gc = Math.round((guide.guideSeq.match(/[GC]/g)?.length ?? 0) / guide.guideSeq.length * 100);

  const scoreColour = (v: number | null) => {
    if (v === null) return 'text-black-400';
    return v >= 65 ? 'text-emerald-600' : v >= 35 ? 'text-amber-600' : 'text-red-600';
  };

  const scoreLabel = (v: number | null) => {
    if (v === null) return '';
    return v >= 65 ? 'Good' : v >= 35 ? 'Moderate' : 'Low';
  };

  return (
    <div className="flex gap-4 mb-4 flex-wrap">
      <div className="flex-1 min-w-28 bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-xs">
        <div className={`text-2xl font-bold ${scoreColour(eff)}`}>{eff !== null ? `${eff}%` : '—'}</div>
        <div className="text-[13px] mt-0.5">Efficiency</div>
        {eff !== null && <div className={`text-[13px] font-medium mt-0.5 ${scoreColour(eff)}`}>{scoreLabel(eff)}</div>}
      </div>
      <div className="flex-1 min-w-28 bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-xs">
        <div className={`text-2xl font-bold ${scoreColour(globalRisk)}`}>{globalRisk !== null ? `${globalRisk}%` : '—'}</div>
        <div className="text-[13px] mt-0.5">Off-Target Safety</div>
        {globalRisk !== null && <div className={`text-[13px] font-medium mt-0.5 ${scoreColour(globalRisk)}`}>{scoreLabel(globalRisk)}</div>}
      </div>
      <div className="flex-1 min-w-28 bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-xs">
        <div className={`text-2xl font-bold ${gc < 40 || gc > 60 ? 'text-amber-600' : ''}`}>{gc}%</div>
        <div className="text-[13px] mt-0.5">GC Content</div>
        <div className={`text-[13px] font-medium mt-0.5 ${gc < 40 || gc > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
          {gc < 40 || gc > 60 ? 'Outside 40–60%' : '40–60% ideal'}
        </div>
      </div>
      <div className="flex-1 min-w-28 bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-xs">
        <div className="text-2xl font-bold text-purple-700">{guide.targetEdits.length}</div>
        <div className="text-[13px] mt-0.5">Target Edit{guide.targetEdits.length !== 1 ? 's' : ''}</div>
        {guide.bystanderEdits.length > 0 && (
          <div className="text-[13px] font-bold mt-0.5 text-amber-600">+{guide.bystanderEdits.length} bystander</div>
        )}
      </div>
    </div>
  );
}

export function GuideDetails({ guide }: { guide: Guide | null }) {
  if (!guide) return <div className="text-sm  italic">Select a guide to view details.</div>;

  const targetSet = new Set(guide.targetEdits.map(e => e.genomicPos));
  const bystanderSet = new Set(guide.bystanderEdits.map(e => e.genomicPos));
  const editedPosSet = new Set(guide.allEdits.map(e => e.genomicPos));
  const editingWindowSet = new Set(guide.editingWindowGenomic);
  const spacerIndexSet = new Set(guide.indexMap);

  const pamStart = guide.pam.startPos;
  const pamEnd = guide.pam.endPos;
  const pamSet = new Set<number>();
  for (let i = pamStart; i < pamEnd; i++) pamSet.add(i);

  const displayStart = guide.ui.displayStart;
  const originalBases = guide.ui.uiGenomicSeq.split('');
  const postEditBases = (guide.ui.uiPostEditGenomicSeq ?? guide.ui.uiGenomicSeq).split('');

  // Map from genomic pos → edit object for showing "A→G" labels
  const editByPos = new Map(guide.allEdits.map(e => [e.genomicPos, e]));

  return (
    <div className="font-sans">
      <ScoreSummary guide={guide} />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        {/* Header with legend */}
        <div className="px-4 py-3 border-b border-gray-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <span className="font-semibold">
            Sequence Visualisation&ensp;
            <span className="font-normal">(5′ → 3′, genomic + strand)</span>
          </span>
          <div className="flex flex-wrap gap-3 text-[12px]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-1.5 bg-blue-600 rounded-full" /> Spacer
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-1.5 bg-emerald-500 rounded-full" /> PAM
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" /> Editing window
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-red-600 border-red-900" /> Target edit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-500 border border-amber-800" /> Bystander
            </span>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          {/* Column grid: one flex column per base position */}
          <div className="flex flex-row min-w-max gap-0">

            {/* Left label column */}
            <div className="flex flex-col mr-2 shrink-0">
              {/* Ruler spacer */}
              <div className="h-5" />
              {/* Edit icon row spacer */}
              <div className="h-5" />
              {/* Original label */}
              <div className="h-9 flex items-center text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap pr-2">
                Original
              </div>
              {/* Edit label */}
              <div className="h-5 flex items-center text-[12px] font-semibold whitespace-nowrap pr-2">
                Edit
              </div>
              {/* Post-edit label */}
              <div className="h-10 flex items-center text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap pr-2">
                Edited
              </div>
              {/* Feature bar spacer */}
              <div className="h-3" />
            </div>

            {/* Base columns */}
            {originalBases.map((origBase, i) => {
              const absPos = displayStart + i;
              // 1-based position for the ruler
              const pos1 = absPos + 1;

              const isTarget = targetSet.has(absPos);
              const isBystander = bystanderSet.has(absPos);
              const isInWindow = editingWindowSet.has(absPos);
              const isPam = pamSet.has(absPos);
              const isSpacer = spacerIndexSet.has(absPos);
              const isEdited = editedPosSet.has(absPos);
              const editObj = editByPos.get(absPos);
              const postBase = postEditBases[i];
              const baseChanged = origBase !== postBase;

              return (
                <div key={i} className="flex flex-col items-center w-6 shrink-0">
                  {/* Genomic ruler: every 5th position */}
                  <div className="h-5 flex items-end justify-center">
                    {pos1 % 5 === 0 && (
                      <span className="text-[10px] font-mono leading-none">{pos1}</span>
                    )}
                  </div>

                  {/* Edit annotation icons above original */}
                  <div className="h-5 flex items-center justify-center">
                    {isTarget && (
                      <span
                        className="w-3 h-3 rounded-full bg-red-600 border-red-900 cursor-default"
                        title={`Target: ${origBase}→${editObj?.editedBase ?? '?'}`}
                      />
                    )}
                    {isBystander && !isTarget && (
                      <span
                        className="w-3 h-3 rounded-full bg-amber-500 border-amber-800 cursor-default"
                        title={`Bystander: ${origBase}→${editObj?.editedBase ?? '?'}`}
                      />
                    )}
                  </div>

                  {/* Original base */}
                  <div
                    className={`
                      w-7 h-10 flex items-center justify-center font-mono font-bold text-[18px] select-none
                      ${isInWindow ? 'bg-yellow-100' : ''}
                      ${isPam ? 'bg-emerald-200' : ''}
                    `}
                    title={`Position ${pos1}: ${origBase}`}
                  >
                    {origBase}
                  </div>

                  {/* Edit label row: shows "A→G" or empty */}
                  <div className="h-5 flex items-center justify-center">
                    {isEdited && editObj && (
                      <span className="text-[16px] font-bold text-purple-600 whitespace-nowrap leading-none">
                        &#8595;
                      </span>
                    )}
                  </div>

                  {/* Post-edit base */}
                  <div
                    className={`
                      w-6 h-9 flex items-center justify-center font-mono font-bold text-[18px] select-none
                      ${isInWindow ? 'bg-yellow-100' : ''}
                      ${baseChanged ? 'bg-purple-100 rounded' : ''}
                      ${isPam ? 'bg-emerald-200' : ''}
                    `}
                    title={baseChanged ? `Edited: ${origBase}→${postBase}` : postBase}
                  >
                    {postBase}
                  </div>

                  {/* Feature bar: spacer / PAM */}
                  <div className="h-3 w-5 mt-0.5 flex items-center">
                    {isSpacer && <div className="w-full h-1.5 bg-blue-600 rounded-full" title="Spacer" />}
                    {isPam && <div className="w-full h-1.5 bg-emerald-500 rounded-full" title="PAM" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: guide info */}
        <div className="px-4 py-3 bg-slate-50 border-t border-gray-100 flex flex-wrap gap-4">
          <span>
            <span className="font-semibold">Guide:</span>{' '}
            <span className="font-mono">{guide.guideSeq}</span>
          </span>
          <span>
            <span className="font-semibold">PAM:</span>{' '}
            <span className="font-mono">{guide.pam.pamSeq}</span>
          </span>
          <span>
            <span className="font-semibold">Strand:</span> {guide.pam.strand}
          </span>
          <span>
            <span className="font-semibold">Editor:</span> {guide.editor.name}
          </span>
        </div>
      </div>
    </div>
  );
}
