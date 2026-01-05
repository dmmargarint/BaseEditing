import SeqViz from 'seqviz';
import { useBaseEditorDesigner } from '../../hooks/useBaseEditorDesigner.ts';

function onSeqvizHighlight(e) {
  console.log(e);
}

export function SeqvizOverview() {
  const designer = useBaseEditorDesigner();

  return (
    <SeqViz
      // name="DNA Sequence"
      seq={designer.DNASequence}
      annotations={[{ name: 'mutation', start: 15, end: 16, direction: 1, color: 'red' }]}
      viewer="linear"
      style={{ width: '100%', height: '100%' }}
      onSelection={(s) => {
        onSeqvizHighlight(s);
      }}
    />
  );
}