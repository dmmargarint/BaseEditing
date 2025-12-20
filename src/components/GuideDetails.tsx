import type { Guide } from '../logic/guides.ts';


export function GuideDetails({ guide }: {guide: Guide | null}) {
  if (!guide) return <div>Select a guide to see details.</div>;

  const bases = guide.seq.split('');

  // const editPositions = new Map(
  //   guide.editsSimulation.edits.map(e => [
  //     e.positionInProtospacer,
  //     {type: "target", ...e}
  //   ])
  // );



  // {renderSequenceWithHighlights(guide.original, guide.editPositions, 'original')}



  return (
    // <div>
    //   <h3>Guide details</h3>
    //   <div><b>Sequence:</b> {guide.seq}</div>
    //   <div><b>Strand:</b> {guide.guideStrand}</div>
    //   <div><b>Window:</b> {guide.protospacer.editWindowStart}–{guide.protospacer.editWindowEnd}</div>
    //   <div><b>Bystanders:</b> {guide.summary?.numBystanders ?? 0}</div>
    //   {/* show simulation.edits, etc */}
    // </div>

    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">Guide Details</h3>
        {/*<div><b>Sequence:</b> {guide.seq}</div>*/}
        {/*<div><b>Strand:</b> {guide.guideStrand}</div>*/}

        <div className="space-y-2">
          <h3 className="font-semibold text-sm uppercase opacity-70">Basic Info</h3>
          <div><b>Original Sequence:</b> <span>{guide.protospacer.sequence}</span></div>
          <div><b>Edited Sequence:</b> <span>{guide.postEditSeqOverGuideLength}</span></div>
          <div><b>Guide Binds to Strand:</b> {guide.guideStrand}</div>
        </div>

        <div className="divider"></div>

        {/* Edit Window Section */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm uppercase opacity-70">Edit Window</h3>
          <div><b>Editing Window:</b> {guide.editWindowStart}–{guide.editWindowEnd}</div>
        </div>

        <div className="divider"></div>

        {/* Summary Section */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm uppercase opacity-70">Summary</h3>
          <div><b>Bystanders:</b> {guide.numBystanders ?? 0}</div>
          <div><b>Hits Target:</b> {guide.hitsDesiredSite ? "Yes" : "No"}</div>
        </div>

      </div>
    </div>
  );
}

function renderSequenceWithHighlights(guide: Guide, show: 'original' | 'edited') {
  const bases = guide.seq.split("");
  console.log(bases);
}