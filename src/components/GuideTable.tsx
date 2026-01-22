import type { Guide } from '../logic/guides.ts';

interface Props {
  guides: Guide[];
  // sortBy: "score" | "bystanders";
  // setSortBy: (sort: "score" | "bystanders") => void;
  onSelectGuide: (guide: Guide) => void; // Takes the guide sequence, not index
}

export function GuideTable ({guides, onSelectGuide}:Props) {
  if (!guides.length) return <div>No guides found.</div>;
  return (
      <div className="">
        <div className="">
          <span>({guides.length}) Guides Found</span>

          <span className="p-10 text-sm">Export Selected</span>
        </div>
        <table className="table text-xs">
          <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox"/>
              </label>
            </th>
            <th>Guide</th>
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
            <tr key={`${g.guideSeq}.${g.editor.name}`}>
              <td>
                <label>
                  <input type="checkbox" />
                </label>
              </td>
              <td>
                <div onClick={() => onSelectGuide(g)} style={{ cursor: 'pointer' }}>
                  {g.guideSeq}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                       stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
              </td>
              <td>{g.editor.name}</td>
              <td>{g.pam.strand}</td>
              <td>{g.allEdits.length}</td>
              <td>{g.score}</td>
              <td>{g.score}</td>
              {/*<td>{g.numBystanders}</td>*/}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}