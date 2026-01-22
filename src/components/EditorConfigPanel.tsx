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
  setTargetStrand: (targetStrand: string) => void;
  onFastaFileUpload: (file: string) => void;
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
                             onFastaFileUpload,
                           }: Props
) {

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAnalyse();
    }
  };

  return (
    <>
      <div className="w-full justify-center">
        <legend className="fieldset-legend text-xs">DNA Sequence</legend>
        <textarea
          className="textarea textarea-sm block w-full"
          placeholder="Insert DNA Sequence"
          rows={3}
          id="dna_textarea"
          value={textInput}
          onChange={(e) => onSequenceChange(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-xs">Upload Fasta File</legend>
          <input type="file"
                 className="file-input file-input-ghost file-input-sm"
                 accept=".fasta, .fa"
                 onChange={onFastaFileUpload}
          />
          {/*<label className="label">Max size 2MB</label>*/}
        </fieldset>

        <fieldset>

          <legend className="fieldset-legend text-xs">
            Base Editor Type
            <div className="tooltip tooltip-content" onClick={()=>document.getElementById('base_editor_type_info').showModal()} style={{cursor: 'pointer'}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5"
                 stroke="currentColor" className="size-[1.2em]">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            </div>
          </legend>

          <dialog id="base_editor_type_info" className="modal">
            <div className="modal-box">
              {/*<h3 className="font-bold text-lg">Hello!</h3>*/}
              <p className="py-4">
                Choose between a list of base editors or select Auto-Discover for an automatic discovery of suitable editors
              </p>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>

          <select
            className="select input-sm block w-full"
            value={selectedEditorName}
            onChange={(e) => setSelectedEditorName(e.target.value)}
          >
            <option key="auto" value="auto">Auto-Discover</option>
            {ALL_EDITORS.map((ed, index) => (
              <option key={index} value={ed.name}>
                {ed.name}
              </option>
            ))}
          </select>
        </fieldset>


        <legend className="fieldset-legend text-xs">Desired Edit</legend>
        <select
          className="select input-sm block w-full"
          value={desiredEdit}
          onChange={(e) => setDesiredEdit(e.target.value)}
        >
          <option key="A_TO_G" value="A_TO_G">A &rarr; G</option>
          <option key="C_TO_T" value="C_TO_T">C &rarr; T</option>
            {/*<option key="auto" value="auto">Detect Automatically from Selected Base</option>*/}
          </select>

          <legend className="fieldset-legend text-xs">Mutation Position (or highlight the mutation in the visualiser)
          </legend>
          <input type="text"
                 className="input input-sm block w-full"
                 value={mutationPos ?? ''}
                 placeholder="Position number or HGVS i.e. c.4375C>T"
                 onChange={(e) => setMutationPos(e.target.value)}
          />

          <p className="text-sm text-right">Advanced Settings</p>

          <button
            className="btn btn-primary input-sm mt-4 block"
            onClick={onAnalyse}
          >
            Find Guides
          </button>
      </div>
    </>
);
}

export default EditorConfigPanel;