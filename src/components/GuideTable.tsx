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
        <table className="table text-sm">
          <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox"/>
              </label>
            </th>
            <th>Guide</th>
            <th>PAM strand</th>
            <th>Hits desired site?</th>
            <th>Score</th>
            <th>Off-Target Score</th>
            <th># Bystanders</th>
          </tr>
          </thead>
          <tbody>
          {guides.map((g:Guide) => (
            <tr key={g.guideSeq}>
              <td>
                <label>
                  <input type="checkbox" />
                </label>
              </td>
              <td onClick={() => onSelectGuide(g)} style={{cursor: 'pointer'}}>{g.guideSeq}</td>
              <td>{g.pam.strand}</td>
              <td>{g.hitsDesiredSite ? "Yes" : "No"}</td>
              <td>{g.score}</td>
              <td>{g.score}</td>
              <td>{g.numBystanders}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}