import SeqViz from 'seqviz';
import { useDesigner } from '../context/GuideContext.tsx';

function onSeqvizHighlight(e) {
  console.log(e);
}

export function SeqvizOverview() {
  const {designer, selectedGuide} = useDesigner();

  return (
    <>
      <div className="">
        <div className="m-2">
          <span className="text-sm">Zoom</span>
          <div className="inline p-2">-</div>
          <input type="range"
                 min="11"
                 max="70"
                 value={designer.seqvizZoom}
                 className="inline w-1/6 range range-info range-xs"
                 onChange={e => designer.setSeqvizZoom(e.target.valueAsNumber)}/>
          <div className="inline p-2">+</div>
        </div>

      </div>


      <SeqViz
        // name="DNA Sequence"
        seq={designer.DNASequence}
        annotations={[{ name: 'mutation', start: 15, end: 16, direction: 1, color: 'red' }]}
        viewer="linear"
        style={{ width: '100%', height: '100%' }}
        onSelection={(s) => {
          onSeqvizHighlight(s);
        }}
        highlights={selectedGuide ? [
          {
            start: selectedGuide.pam.startPos,
            end: selectedGuide.pam.endPos,
            color: 'aquamarine',
          },
          {
            start: Math.min(...selectedGuide.editingWindowGenomic),
            end: Math.max(...selectedGuide.editingWindowGenomic) + 1,
            color: 'yellow',
          },
          // {
          //   start:
          // }
        ] : []}
        zoom={{linear: designer.seqvizZoom}}
        // GTAAT
      />
    </>
  );
}