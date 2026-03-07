import type { Guide } from '../guides.ts';
import { useState } from 'react';
import MoreInfoIcons from './svg/MoreInfoIcons.tsx';
import CopyToClipboardIcon from './svg/CopyToClipboardIcon.tsx';
import { useAnalysis } from '../context/AnalysisContext.tsx';
import { GuideDetails } from './GuideDetails.tsx';

interface Props {
  enrichedGuides: Guide[];
  selectedGuide: Guide | null;
  // sortBy: "score" | "bystanders";
  // setSortBy: (sort: "score" | "bystanders") => void;
  onSelectGuide: (guide: Guide) => void; // Takes the guide sequence, not index
}

export function GuideTable ({enrichedGuides, onSelectGuide, selectedGuide}:Props) {
  // Checkbox Ticked Guides
  const [checkedGuides, setCheckedGuides] = useState<Guide[]>([]);

  const { status, progress, progressMessage } = useAnalysis();

  if (!enrichedGuides.length) return <div>No guides found.</div>;

  const handleCheckboxToggle = (g: Guide) => {
    const isAlreadyChecked = checkedGuides.some(e => e.id === g.id);

    console.log(checkedGuides);

    // is in array, we remove it
    if (isAlreadyChecked) {
      setCheckedGuides(checkedGuides.filter(e => e.id !== g.id));
      return;
    }

    // push to array
    setCheckedGuides([...checkedGuides, g]);
  };

  const isGuideChecked = (g: Guide) => checkedGuides.some(e => e.id === g.id);

  const checkAllGuides = (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      setCheckedGuides(enrichedGuides);
      return;
    }
    setCheckedGuides([]);
  }

  const displaySequenceWithHighlightedPositions = (seq: string, positions: number[], displayStart: number, padding: number) => {
    console.log(seq, positions, padding);

    let splitSeq = seq.split('');

    let str = '';

    const positionSet = new Set(positions);

    for (let i = 0; i < splitSeq.length; i++) {
      const absPos = displayStart + padding + i;
      if (positionSet.has(absPos)) {
        str += `<span style="color: rebeccapurple">${splitSeq[absPos]}</span>`;
      } else {
        str += `<span style="">${splitSeq[absPos]}</span>`;
      }
    }

    console.log(str);

    return str;
  }

  return (
    <>
      <div>
        <div>
          <span>({enrichedGuides.length}) Guides Found</span>

          <span className="p-10 text-sm">Export Selected</span>
        </div>
        <table className="table text-xs">
          <thead>
          <tr>
            <th className="p-1 m-1">
              <input type="checkbox" style={{ cursor: 'pointer' }} onChange={checkAllGuides}/>
            </th>
            <th></th>
            <th>Guide</th>
            <th>Editor</th>
            <th>GC %</th>
            <th>PAM strand</th>

            {(status === 'running' || status === 'completed') && (
              <>
                <th>Edits</th>
                <th>Efficiency Score %</th>
                <th>Off-Target Score %</th>
              </>
            )}
          </tr>
          </thead>
          <tbody>
          {enrichedGuides.map((g:Guide) => (
            <>
            <tr key={`${g.guideSeq}.${g.editor.name}`} className={`${g.id === selectedGuide?.id ? 'bg-green-200' : ''} ${status === 'running' ? 'pulse-row' : ''}`}>
              <td className="p-1 m-1">
                <label>
                  <input type="checkbox" checked={isGuideChecked(g)} style={{ cursor: 'pointer' }} onChange={() => handleCheckboxToggle(g)}/>
                </label>
              </td>
              <td>
                <span style={{cursor: 'pointer'}}
                      onClick={() => {onSelectGuide(g); document.getElementById(`${g.id}.more_info`)?.classList.toggle('hidden')}}>
                  <MoreInfoIcons />
                </span>
              </td>
              <td>
                <div className="flex items-center gap-3 whitespace-nowrap font-mono" onClick={() => onSelectGuide(g)} style={{ cursor: 'pointer' }}>
                  <span
                    onClick={() => document.getElementById(`${g.id}.more_info`)?.classList.toggle('hidden')}
                    style={{cursor: 'pointer'}}
                  >
                    {status === 'running' ? `${progressMessage} ${progress}%` : `${g.guideSeq.substring(0,5)}...`}
                  </span>
                </div>
              </td>
              <td>{g.editor.name}</td>
              <td>GC%</td>
              <td>{g.pam.strand}</td>
              {(status === 'running' || status === 'completed') && (
                <>
                  <td>{status === 'running' ? 'Calculating...' : g.allEdits.length}</td>
                  {/*Efficiency Score*/}
                  <td>{status === 'running' ? 'Calculating...' : g.analysis.efficiencyScore}</td>
                  {/*Off Target Score*/}
                  <td>{status === 'running' ? 'Calculating...' : g.analysis.globalRiskScore}</td>
                </>
              )}
            </tr>
              {/*More Guide Info, Initially Hidden */}
            <tr key={`${g.id}.more_info}`} id={`${g.id}.more_info`} className="bg-gray-50 hidden">
              <td colSpan={100} className="">
                <div className="m-1">Guide Sequence:&emsp;&emsp;&emsp; {g.guideSeq}</div>

                <GuideDetails guide={g}></GuideDetails>

                {/*{displaySequenceWithHighlightedPositions(g.guideSeq, g.editingWindowGenomic, g.ui.displayPadding)}*/}
                {/*<div>Original Sequence: <span className="font-mono text-md">&emsp;&emsp;&emsp;5' ...{g.ui.uiGenomicSeq}... 3'</span></div>*/}
                {/*<div>&nbsp;</div>*/}
                {/*<div>Post Edit Sequence: <span className="font-mono text-md">&emsp;&emsp;3' ...{g.ui.uiPostEditGenomicSeq}... 5'</span></div>*/}

                {g.analysis && (
                  <>
                    <div className="mt-5">
                      <div className="items-center justify-center">
                        <h3 className="text-lg font-bold text-center">
                          <span style={{display: 'inline-flex'}}>Off-Target Analysis
                          <div onClick={()=>document.getElementById('off_target_analysis_more_info_modal')?.showModal()} style={{cursor: 'pointer'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                            </svg>
                          </div>
                          </span>
                        </h3>
                      </div>
                      <table className="border-collapse border border-blue-400">
                        <thead>
                        <tr>
                          <th className="pl-1 justify-center items-center border border-blue-400">
                            Alignment
                          </th>
                          <th className="border border-blue-400">Location</th>
                          <th className="border border-blue-400">Strand</th>
                          {/*<th>Mismatches</th>*/}
                          <th className="border border-blue-400">Binding Risk</th>
                          <th className="border border-blue-400">Editing Risk</th>
                          <th className="border border-blue-400">Final Risk</th>
                        </tr>
                        </thead>
                        <tbody>
                        {g.analysis.alignments?.map((algn) => (
                          <tr key={`${algn.alignedSeq}`} className="">
                            {/*TODO add the pam sequence next to the aligned seq somehow*/}
                            <td className="pl-1 border border-blue-400">{algn.alignedSeq}</td>
                            <td className="border border-blue-400">{`${algn.chr}, ${algn.faidx.start}:${algn.faidx.end}`}</td>
                            <td className="border border-blue-400">{algn.strand}</td>
                            {/*<td>{algn.nm}</td>*/}
                            <td className="border border-blue-400">{algn.evaluation.scores.bindingScore} ({algn.evaluation.scores.bindingScoreMethod})</td>
                            <td className="border border-blue-400">{algn.evaluation.scores.cumulativeEditingRisk}</td>
                            <td className="border border-blue-400">{algn.evaluation.scores.finalRisk}</td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                      </>
                    )}
                  </td>
                </tr>
            </>
          ))}
          </tbody>
        </table>

        <dialog id="off_target_analysis_more_info_modal" className="modal">
          <div className="modal-box" style={{maxWidth: 'none', width: '80%'}}>

            <p className="py-2">Note: Only the alignments with a PAM site present directly next to or 1bp away from the alignments are displayed.</p>

            <p className="py-1">The table contains the following columns:</p>

            <p className="py-2">
              <b>Alignment</b> - The Off-Target alignment in the genome.
            </p>
            <p className="py-2">
              <b>Location</b> - Location of the alignment in the genome.
            </p>
            <p className="py-2">
              <b>Strand</b> - The strand the alignment was found on.
            </p>
            <p className="py-2">
              <b>Binding Risk</b> - The risk of the guideRNA binding to the alignment.
              Uses the Cutting Frequency Determination (<b>CFD</b>) score (Doench et al. 2016) for SpCas9 and the <b>MIT</b> score (Hsu et al. 2013) for SaCas9.
            </p>
            <p className="py-2">
              <b>Editing Risk</b> - This score predicts how likely the guideRNA is to make an edit within its target window. It is calculated by identifying all editable positions and weighting them; The weights were assigned using a normal distribution centered at the midpoint of the editing window,
              meaning bases at the middle of the editing window have a greater chance of being edited.
            </p>
            <p className="py-2">
              <b>Final Risk</b> - Calculated as <b>Binding Risk * Editing Risk</b>. Example: If the Binding Risk is high but Editing Risk is close to 0 the off-target could be regarded as safe.
            </p>

          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </>
  );
}