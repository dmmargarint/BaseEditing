import SeqViz from 'seqviz';
import { useDesigner } from '../context/GuideContext.tsx';

export function SeqvizOverview() {
  const {designer, selectedGuide} = useDesigner();

  const onSeqvizHighlight = (e: any) => {
    if (e.length !== 1)
      return;

    let mutationPos;
      if (e.clockwise)
        mutationPos = e.end;
      else
        mutationPos = e.start;

    designer.setMutationPos(mutationPos);
  }

  return (
    <>
      <div className="flex items-center gap-2 m-2">
        <span className="text-xs text-gray-500 font-medium">Zoom</span>
        <button
          className="btn btn-xs btn-ghost px-1 text-gray-400 hover:text-gray-600"
          onClick={() => designer.setSeqvizZoom(Math.max(11, designer.seqvizZoom - 10))}>
          −
        </button>
        <input type="range"
               min="11"
               max="70"
               value={designer.seqvizZoom}
               className="w-32 range range-info range-xs"
               onChange={e => designer.setSeqvizZoom(e.target.valueAsNumber)}/>
        <button
          className="btn btn-xs btn-ghost px-1 text-gray-400 hover:text-gray-600"
          onClick={() => designer.setSeqvizZoom(Math.min(70, designer.seqvizZoom + 10))}>
          +
        </button>
        <span className="text-xs w-8 text-center tabular-nums text-gray-400">{designer.seqvizZoom}%</span>
      </div>

      <SeqViz
        // name="DNA Sequence"
        seq={designer.DNASequence}
        annotations={designer.mutationPos ? [
          { name: 'mutation',
            start: designer.mutationPos - 1,
            end: designer.mutationPos,
            direction: 1, color: 'red'
          }
        ] : []
        }
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
        ] : []}
        zoom={{linear: designer.seqvizZoom}}
        selection={selectedGuide ? {
          start: selectedGuide.pam.startPos,
          end: selectedGuide.pam.endPos,
          clockwise: true
        }: undefined}
      />
    </>
  );
}