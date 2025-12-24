import type { Guide } from '../logic/guides.ts';
import { useGuideTable } from "../hooks/useGuideTable";


interface Props {
  guides: Guide[];
  sortBy: "score" | "bystanders";
  setSortBy: (sort: "score" | "bystanders") => void;
  onSelectGuide: (seq: string) => void; // Takes the guide sequence, not index
}

export function GuideTable ({guides,sortBy, setSortBy, onSelectGuide}:Props) {
  if (!guides.length) return <div>No guides found.</div>;

  return (
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
            <th>Guide</th>
            <th>PAM strand</th>
            <th>Hits desired site?</th>
            <th># Bystanders</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          {guides.map((g:Guide) => (
            <tr key={g.guideSeq}>
              <td>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </td>
              <td>{g.guideSeq}</td>
              <td>{g.pam.strand}</td>
              <td>{g.hitsDesiredSite ? "Yes" : "No"}</td>
              <td>{g.numBystanders ?? 0}</td>
              <td>
                <button className="btn btn-soft btn-info" onClick={() => onSelectGuide(g.guideSeq)}>
                  More Info
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}