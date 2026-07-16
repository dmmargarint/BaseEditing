import type { Guide } from '../guides.ts';
import { useState, useRef, useEffect, memo, useCallback, Fragment } from 'react';
import MoreInfoIcons from './svg/MoreInfoIcons.tsx';
import { useAnalysis } from '../context/AnalysisContext.tsx';
import { GuideDetails } from './GuideDetails.tsx';

function gcPercent(seq: string) {
  return Math.round((seq.match(/[GC]/g)?.length ?? 0) / seq.length * 100);
}

function downloadCSV(guides: Guide[]) {
  const hasScores = guides.some(g => g.analysis?.efficiencyScore !== undefined);

  const headers = [
    'Guide Sequence', 'Editor', 'Strand', 'GC%',
    'Edit Site', 'Bystander Count',
    ...(hasScores ? ['Efficiency Score (%)', 'Off-Target Safety (%)'] : []),
  ];

  const rows = guides.map(g => [
    g.guideSeq,
    g.editor.name,
    g.pam.strand,
    gcPercent(g.guideSeq),
    g.targetEdits.map(e => `${e.base}${e.positionInProtospacer + 1}→${e.editedBase}`).join('; '),
    g.bystanderEdits.length,
    ...(hasScores ? [
      g.analysis?.efficiencyScore !== undefined ? Math.round(g.analysis.efficiencyScore) : '',
      g.analysis?.globalRiskScore !== undefined ? Math.round(g.analysis.globalRiskScore) : '',
    ] : []),
  ]);

  const note = ['Note: Edit site position is numbered from the 5\' end of the guide sequence. For minus-strand guides, position 1 corresponds to the highest genomic coordinate.'];

  const csv = [headers, ...rows, [], note]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'guides.csv';
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  enrichedGuides: Guide[];
  selectedGuide: Guide | null;
  onSelectGuide: (guide: Guide) => void;
}

function ScorePill({ value, label }: { value: number | undefined; label: string }) {
  if (value === undefined) return <span className=" text-xs">—</span>;

  const pct = Math.round(value);
  const color =
    pct >= 65 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
    pct >= 35 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                'bg-red-100 text-red-800 border-red-200';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${color}`}
      title={label}
    >
      {pct}%
    </span>
  );
}

function RiskPill({ value }: { value: number | undefined }) {
  if (value === undefined) return <span className=" text-xs">—</span>;

  const pct = Math.round(value);
  const color =
    pct >= 70 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
    pct >= 40 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                'bg-red-100 text-red-800 border-red-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${color}`}>
      {pct}%
    </span>
  );
}

function GuideSeq({ guide }: { guide: Guide }) {
  const targetPositions = new Set(guide.targetEdits.map(e => e.positionInProtospacer));
  const bystanderPositions = new Set(guide.bystanderEdits.map(e => e.positionInProtospacer));

  return (
    <span className="font-mono text-xs tracking-wider" title={guide.guideSeq}>
      {guide.guideSeq.split('').map((base, i) => {
        const isTarget = targetPositions.has(i);
        const isBystander = bystanderPositions.has(i);
        const cls = isTarget
          ? 'text-purple-700 font-bold underline decoration-dotted'
          : isBystander
          ? 'text-amber-600'
          : '';
        return <span key={i} className={cls}>{base}</span>;
      })}
    </span>
  );
}

function AlignmentRow({ algn }: { algn: any }) {
  const bindingPct = Math.round((algn.evaluation?.scores?.bindingScore ?? 0) * 100);
  const editPct = Math.round((algn.evaluation?.scores?.cumulativeEditingRisk ?? 0) * 100);
  const finalPct = Math.round((algn.evaluation?.scores?.finalRisk ?? 0) * 100);
  const method = algn.evaluation?.scores?.bindingScoreMethod ?? '';
  const riskColor = finalPct >= 30 ? 'text-red-600 font-semibold' : finalPct >= 10 ? 'text-amber-600' : '';

  return (
    <tr className="hover:bg-slate-50 border-b border-gray-100">
      <td className="px-3 py-1.5 font-mono text-xs ">{algn.alignedSeq}</td>
      <td className="px-3 py-1.5 text-xs ">
        {algn.chr}<span className="">:</span>{algn.faidx?.start}–{algn.faidx?.end}
      </td>
      <td className="px-3 py-1.5 text-xs text-center">{algn.strand}</td>
      <td className="px-3 py-1.5 text-xs text-center ">{algn.nm}</td>
      <td className="px-3 py-1.5 text-xs text-center">
        <span title={method}>{bindingPct}%</span>
      </td>
      <td className="px-3 py-1.5 text-xs text-center">{editPct}%</td>
      <td className={`px-3 py-1.5 text-xs text-center ${riskColor}`}>{finalPct}%</td>
    </tr>
  );
}

function OffTargetTable({ alignments }: { alignments: any[] }) {
  if (!alignments?.length) {
    return <p className="text-sm  italic py-2">No off-target alignments found.</p>;
  }

  const onTarget = alignments.filter((a: any) => a.nm === 0);
  const offTargets = alignments.filter((a: any) => a.nm > 0);

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-100 ">
            <th className="px-3 py-2 text-xs font-semibold rounded-tl-md">Alignment</th>
            <th className="px-3 py-2 text-xs font-semibold">Location</th>
            <th className="px-3 py-2 text-xs font-semibold text-center">Strand</th>
            <th className="px-3 py-2 text-xs font-semibold text-center">MM</th>
            <th className="px-3 py-2 text-xs font-semibold text-center">
              Binding Score
              <span className="ml-1  font-normal">(CFD/MIT)</span>
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-center">Edit Risk</th>
            <th className="px-3 py-2 text-xs font-semibold text-center rounded-tr-md">Final Risk</th>
          </tr>
        </thead>
        <tbody>
          {onTarget.length > 0 && (
            <>
              <tr><td colSpan={7} className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-700">On-target site</td></tr>
              {onTarget.map((a: any, i: number) => <AlignmentRow key={`on-${i}`} algn={a} />)}
            </>
          )}
          {offTargets.length > 0 && (
            <>
              <tr>
                <td colSpan={7} className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest ">
                  Off-target sites ({offTargets.length})
                </td>
              </tr>
              {offTargets.map((a: any, i: number) => <AlignmentRow key={`off-${i}`} algn={a} />)}
            </>
          )}
        </tbody>
      </table>

      <div className="mt-3 flex gap-4 text-[11px]">
        <span><b className="">MM</b> = mismatches vs. guide</span>
        <span><b className="">Binding</b> = CFD score (SpCas9) or MIT score (SaCas9)</span>
        <span><b className="">Final Risk</b> = Binding × Edit Risk</span>
      </div>
    </div>
  );
}

interface GuideRowProps {
  guide: Guide;
  isSelected: boolean;
  isExpanded: boolean;
  isChecked: boolean;
  isAnalysing: boolean;
  onToggle: (g: Guide) => void;
  onCheck: (g: Guide) => void;
}

const GuideRow = memo(function GuideRow({ guide, isSelected, isExpanded, isChecked, isAnalysing, onToggle, onCheck }: GuideRowProps) {
  const [copied, setCopied] = useState(false);
  const gc = gcPercent(guide.guideSeq);
  return (
    <Fragment>
      <tr
        onClick={() => onToggle(guide)}
        className={`
          border-b border-gray-100 cursor-pointer transition-colors
          ${isSelected ? 'bg-blue-50 border-indigo-100' : 'hover:bg-slate-50'}
          ${isAnalysing ? 'animate-pulse' : ''}
        `}
      >
        <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={isChecked}
            onChange={() => onCheck(guide)}
          />
        </td>
        <td className="px-2 py-2.5">
          <div className="flex items-center gap-1.5">
            <GuideSeq guide={guide} />
            <button
              onClick={e => {
                e.stopPropagation();
                navigator.clipboard.writeText(guide.guideSeq);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className={`inline-flex items-center justify-center gap-1 w-16 py-0.5 rounded border text-xs font-medium transition-colors shrink-0 ${copied ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
              title="Copy guide sequence"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </td>
        <td className="px-2 py-2.5 whitespace-nowrap">{guide.editor.name}</td>
        <td className="px-2 py-2.5 text-center">
          <span className={`font-medium ${gc < 40 || gc > 60 ? 'text-amber-600' : ''}`}>{gc}%</span>
        </td>
        <td className="px-2 py-2.5 text-center font-mono ">{guide.pam.strand}</td>
        <td className="px-2 py-2.5 text-center">
          <span className="font-medium text-purple-700">{guide.targetEdits.length}</span>
          {guide.bystanderEdits.length > 0 && (
            <span className="ml-1 text-[12px]">(+{guide.bystanderEdits.length} bystander)</span>
          )}
        </td>
        <td className="px-2 py-2.5 text-center">
          <ScorePill value={guide.analysis?.efficiencyScore} label="On-target efficiency score" />
        </td>
        <td className="px-2 py-2.5 text-center">
          <RiskPill value={guide.analysis?.globalRiskScore} />
        </td>
        <td className="px-2 py-2.5 text-center">
          <MoreInfoIcons expanded={isExpanded} />
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-50 border-b border-gray-200">
          <td colSpan={9} className="px-4 py-4">
            <GuideDetails guide={guide} />
            {guide.analysis && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-semibold ">Off-Target Alignments</h4>
                  <button
                    className=" hover: transition-colors"
                    title="About off-target scoring"
                    onClick={() => (document.getElementById('ot-modal') as HTMLDialogElement)?.showModal()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                  </button>
                </div>
                <OffTargetTable alignments={guide.analysis.alignments ?? []} />
              </div>
            )}
          </td>
        </tr>
      )}
    </Fragment>
  );
});

export function GuideTable({ enrichedGuides, onSelectGuide, selectedGuide }: Props) {
  const [checkedGuides, setCheckedGuides] = useState<Guide[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { status, progress, progressMessage } = useAnalysis();
  const selectAllRef = useRef<HTMLInputElement>(null);

  const checkedIds = new Set(checkedGuides.map(g => g.id));

  useEffect(() => {
    if (!selectAllRef.current) return;
    const n = checkedGuides.length;
    selectAllRef.current.checked = n === enrichedGuides.length && n > 0;
    selectAllRef.current.indeterminate = n > 0 && n < enrichedGuides.length;
  }, [checkedGuides, enrichedGuides]);

  const handleCheckboxToggle = useCallback((g: Guide) => {
    setCheckedGuides(prev =>
      prev.some(e => e.id === g.id) ? prev.filter(e => e.id !== g.id) : [...prev, g]
    );
  }, []);

  const checkAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    setCheckedGuides(e.target.checked ? enrichedGuides : []),
  [enrichedGuides]);

  const toggleExpand = useCallback((g: Guide) => {
    onSelectGuide(g);
    setExpandedId(prev => prev === g.id ? null : g.id);
  }, [onSelectGuide]);

  if (status === 'failed') return (
    <div role="alert" className="alert alert-error text-sm">
      <span>Analysis failed. Please try again or contact the author.</span>
    </div>
  );

  if (!enrichedGuides.length) return (
    <div className="text-sm italic py-4 text-center">No guides found for this sequence and editor combination.</div>
  );

  const isAnalysing = status === 'running';
  const hasScores = status === 'running' || status === 'completed';

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1 py-2 mb-1">
        <span className="font-semibold text-sm">
          {enrichedGuides.length} Guide{enrichedGuides.length !== 1 ? 's' : ''} Found
          {checkedGuides.length > 0 && <span className="ml-2 font-normal text-slate-500">· {checkedGuides.length} selected</span>}
        </span>
        <button
          className="btn btn-xs btn-outline gap-1"
          onClick={() => downloadCSV(checkedGuides.length > 0 ? checkedGuides : enrichedGuides)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {checkedGuides.length > 0 ? `Download ${checkedGuides.length}` : 'Download All'}
        </button>
      </div>

      {isAnalysing && (
        <div className="mb-4 px-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">{progressMessage ?? 'Analysing…'}</span>
            <span className="text-xs font-medium text-slate-600">{progress}%</span>
          </div>
          <progress className="progress progress-info w-full" value={progress} max={100} />
        </div>
      )}

      {/* Table */}
      {enrichedGuides.length > 0 && !isAnalysing && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
            <tr className="border-b border-gray-200">
              <th className="px-2 py-2 w-8">
                <input ref={selectAllRef} type="checkbox" className="cursor-pointer" onChange={checkAll} />
              </th>
              <th className="px-2 py-2 text-left font-semibold text-[15px]">Guide Sequence</th>
              <th className="px-2 py-2 text-left font-semibold">Editor</th>
              <th className="px-2 py-2 text-center font-semibold">GC%</th>
              <th className="px-2 py-2 text-center font-semibold">Strand</th>
              <th className="px-2 py-2 text-center font-semibold">Target Edits</th>
              <th className="px-2 py-2 text-center font-semibold">Efficiency (On-Target)</th>
              <th className="px-2 py-2 text-center font-semibold">Off-Target Safety</th>
              <th className="px-2 py-2 w-8"></th>
            </tr>
            </thead>
            <tbody>
            {enrichedGuides.map((g) => (
              <GuideRow
                key={g.id}
                guide={g}
                isSelected={g.id === selectedGuide?.id}
                isExpanded={expandedId === g.id}
                isChecked={checkedIds.has(g.id)}
                isAnalysing={isAnalysing}
                onToggle={toggleExpand}
                onCheck={handleCheckboxToggle}
              />
            ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend (only when scores present) */}
      {hasScores && status === 'completed' && (
        <div className="mt-2 flex flex-wrap gap-3 text-[12px]  px-1">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-emerald-400" /> ≥65% = Good</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> 35–64% = Moderate</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-red-400" /> &lt;35% = Low</span>
          <span className=" ml-2">
            <span className="text-purple-700 font-semibold">Underlined</span> bases = predicted edit site ·{' '}
            <span className="text-amber-600 font-semibold">Orange</span> = bystander
          </span>
        </div>
      )}

      {/* Off-target info modal */}
      <dialog id="ot-modal" className="modal">
        <div className="modal-box max-w-4xl">
          <h3 className="font-bold text-lg mb-4">Off-Target Scoring</h3>
          <div className="space-y-3">
            <p>Only alignments with a PAM site present at or within 1 bp of the alignment are shown.</p>
            <dl className="space-y-2">
              <div><dt className="font-semibold">MM (Mismatches)</dt><dd className=" mt-0.5">Number of base differences between the guide and the genomic sequence. 0 = perfect match (on-target site).</dd></div>
              <div><dt className="font-semibold">Binding Score</dt><dd className=" mt-0.5">Probability that the guideRNA binds this site. Uses CFD score (Doench et al. 2016) for SpCas9, MIT score (Hsu et al. 2013) for SaCas9. Higher = more likely to bind.</dd></div>
              <div><dt className="font-semibold">Edit Risk</dt><dd className=" mt-0.5">Probability of an edit occurring within the activity window at this site, given it was bound.</dd></div>
              <div><dt className="font-semibold">Final Risk</dt><dd className=" mt-0.5">Binding Score × Edit Risk. Combines binding likelihood with editing probability. Lower is safer.</dd></div>
            </dl>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  );
}
