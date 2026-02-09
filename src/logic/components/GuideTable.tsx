import type { Guide } from '../guides.ts';
import { useState } from 'react';
import MoreInfoIcons from './svg/MoreInfoIcons.tsx';
import CopyToClipboardIcon from './svg/CopyToClipboardIcon.tsx';

interface Props {
  guides: Guide[];
  selectedGuide: Guide | null;
  // sortBy: "score" | "bystanders";
  // setSortBy: (sort: "score" | "bystanders") => void;
  onSelectGuide: (guide: Guide) => void; // Takes the guide sequence, not index
}

export function GuideTable ({guides, onSelectGuide, selectedGuide}:Props) {
  // Checkbox Ticked Guides
  const [checkedGuides, setCheckedGuides] = useState<Guide[]>([]);

  if (!guides.length) return <div>No guides found.</div>;

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
      setCheckedGuides(guides);
      return;
    }
    setCheckedGuides([]);
  }

  return (
    <>
      <div className="">
        <div className="">
          <span>({guides.length}) Guides Found</span>

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
            <th>Copy</th>
            <th>Editor</th>
            <th>PAM strand</th>
            {/*<th>Hits desired site?</th>*/}
            <th>Edits</th>
            <th>Score</th>
            <th>Off-Target Score</th>
          </tr>
          </thead>
          <tbody>
          {guides.map((g:Guide) => (
            <>
            <tr key={`${g.guideSeq}.${g.editor.name}`} className={isGuideChecked(g) ? 'bg-blue-50': ''}>
              <td className="p-1 m-1">
                <label>
                  <input type="checkbox" checked={isGuideChecked(g)} style={{ cursor: 'pointer' }} onChange={() => handleCheckboxToggle(g)}/>
                </label>
              </td>
              <td>
                <span style={{cursor: 'pointer'}}
                      onClick={() => document.getElementById(`${g.id}.more_info`)?.classList.toggle('hidden')}>
                  <MoreInfoIcons />
                </span>
              </td>
              <td>
                <div className="flex items-center gap-3 whitespace-nowrap font-mono" onClick={() => onSelectGuide(g) } style={{ cursor: 'pointer' }}>
                  <span
                    onClick={() => document.getElementById(`${g.id}.more_info`)?.classList.toggle('hidden')}
                    style={{cursor: 'pointer'}}
                  >
                    {g.guideSeq}
                  </span>
                </div>
              </td>
              <td>
                <span onClick={() => {
                  navigator.clipboard.writeText(g.guideSeq);
                }} style={{ cursor: 'pointer' }} className="tooltip" data-tip="Copy to clipboard">
                  <CopyToClipboardIcon />
                </span>
              </td>
              <td>{g.editor.name}</td>
              <td>{g.pam.strand}</td>
              <td>{g.allEdits.length}</td>
              <td>{g.score}</td>
              <td>{g.score}</td>
            </tr>
              {/*More Guide Info, Initially Hidden */}
            <tr key={`${g.id}.more_info}`} id={`${g.id}.more_info`} className="hidden">
              <td colSpan={100} className="">
                <div>Original Sequence: <span className="font-mono text-md">&emsp;&emsp;&emsp;5' ...{g.ui.uiGenomicSeq}... 3'</span></div>
                <div>&nbsp;</div>
                <div>Post Edit Sequence: <span className="font-mono text-md">&emsp;&emsp;3' ...{g.ui.uiPostEditGenomicSeq}... 5'</span></div>
                Off target effects:
              </td>
            </tr>
            </>
          ))}
          </tbody>
        </table>
      </div>
    </>
  );
}