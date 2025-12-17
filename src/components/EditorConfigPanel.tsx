import { ALL_EDITORS } from '../logic/editorConfigs.ts';

interface Props {
  textInput: string;
  onSequenceChange: (sequence: string) => void;
  onAnalyse: () => void;
  selectedEditorName: string;
  setSelectedEditorName: (name: string) => void;
  desiredEdit: string;
  setDesiredEdit: (edit: string) => void;
  mutationPos: string;
  setMutationPos: (string) => void;
  targetStrand: '+' | '-';
  setTargetStrand: (targetStrand: string) => void;
  // seqvizHighlight: {};
  // onSeqvizHighlight: {};
}

function EditorConfigPanel({
                             textInput,
                             onSequenceChange,
                             onAnalyse,
                             selectedEditorName,
                             setSelectedEditorName,
                             desiredEdit,
                             setDesiredEdit,
                             mutationPos,
                             setMutationPos,
                             targetStrand,
                             setTargetStrand

                           }: Props
) {

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAnalyse();
    }
  };

  return (
    <>
      <h2 className="text-center">Base Editing Configuration</h2>
      <legend className="fieldset-legend">DNA Sequence</legend>
      <textarea
        className="textarea block w-full"
        placeholder="Insert DNA Sequence"
        rows={9}
        id="dna_textarea"
        value={textInput}
        onChange={(e) => onSequenceChange(e.target.value)}
        onKeyDown={handleKeyPress}
      />

      <legend className="fieldset-legend">Base Editor Type</legend>
      <select
        className="select block w-full"
        value={selectedEditorName}
        onChange={(e) => setSelectedEditorName(e.target.value)}
      >
        {ALL_EDITORS.map((ed, index) => (
          <option key={index} value={ed.name}>
            {ed.name}
          </option>
        ))}
      </select>

      <legend className="fieldset-legend">Desired Edit</legend>
      <select
        className="select block w-full"
        value={desiredEdit}
        onChange={(e) => setDesiredEdit(e.target.value)}
      >
        <option key="A_TO_G" value="A_TO_G">A &rarr; G</option>
        <option key="C_TO_T" value="C_TO_T">C &rarr; T</option>
        {/*<option key="auto" value="auto">Detect Automatically from Selected Base</option>*/}
      </select>

      <legend className="fieldset-legend">Mutation Position (or highlight the mutation in the visualiser)</legend>
      <input type="text"
             className="input block w-full"
             value={mutationPos ?? ''}
             placeholder="Position number or HGVS i.e. c.4375C>T"
             onChange={(e) => setMutationPos(e.target.value)}
      />

      <button
        className="btn btn-primary mt-4 block"
        onClick={onAnalyse}
      >
        Analyse
      </button>
    </>
  );
}

export default EditorConfigPanel;