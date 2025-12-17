import EditorConfigPanel from './components/EditorConfigPanel.tsx';
import SeqViz from 'seqviz';
import { useBaseEditorDesigner } from './hooks/useBaseEditorDesigner.ts';
import { GuideTable } from './components/GuideTable.tsx';
import { GuidesView } from './components/GuidesView.tsx';

function App() {
  const designer = useBaseEditorDesigner();

  // const [error, setError] = useState<string>("");
  //
  // const validateSequence = (sequence: string): boolean => {
  //     const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
  //     const validPattern = /^[ATCG]+$/;
  //     return validPattern.test(cleanSeq);
  // };

  function onAnalyse() {
    // setError('');
    //
    // // TODO validate input
    //
    // if (!validateSequence(dnaSequence)) {
    //     setError('Invalid DNA sequence. Please use only A, T, C, and G characters.');
    //     return;
    // }
    //
    // setDnaSequence(dnaSequence.replace(/\s/g, '').toUpperCase());
    // setDnaSequenceInView(dnaSequence);

    // const editor = ALL_EDITORS.find(ed => ed.name === selectedEditorName);

    console.log();
  }

  function onSeqvizHighlight(e) {
    console.log(e);
  }

  return (
    <>
      <div className="flex">
        <div className="w-1/2 mx-auto p-8">
          <EditorConfigPanel
            textInput={designer.DNASequence}
            onSequenceChange={designer.setDNASequence}
            onAnalyse={designer.analyse}
            selectedEditorName={designer.selectedEditorName}
            setSelectedEditorName={designer.setSelectedEditorName}
            desiredEdit={designer.desiredEdit}
            setDesiredEdit={designer.setDesiredEdit}
            targetStrand={designer.targetStrand}
            setTargetStrand={designer.setTargetStrand}
            mutationPos={designer.mutationPos}
            setMutationPos={designer.setMutationPos}
          />
        </div>

        <div className="w-1/2 mx-auto p-8 pb-32">
          {designer.DNASequence && <h2 className="text-center">Sequence Visualiser</h2>}
          {designer.DNASequence && (
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
          )}
        </div>
      </div>

      <div>
        <GuidesView guides={designer.guides} />
      </div>

      {/*{designer.guides && (*/}
      {/*  designer.guides.map((guide, index) => (*/}
      {/*    <div key={index}>{guide.seq}</div>*/}
      {/*  ))*/}
      {/*)}*/}

      {/*<div className="">*/}
      {/*    <div dangerouslySetInnerHTML={{ __html: 'ORIGINAL SEQ: ' + designer.DNASequence }}/>*/}
      {/*</div>*/}

      {/*  {designer.error && (*/}
      {/*      <div role="alert" className="alert alert-error">*/}
      {/*          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none"*/}
      {/*               viewBox="0 0 24 24">*/}
      {/*              <path strokeWidth="2"*/}
      {/*                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>*/}
      {/*          </svg>*/}
      {/*          <span>{designer.error}</span>*/}
      {/*      </div>*/}
      {/*  )}*/}
    </>
  );
}

export default App;