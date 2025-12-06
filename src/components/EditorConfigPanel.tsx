import {ALL_EDITORS} from "../editors/editorList.ts";
import {ALL_EDIT_REQUESTS} from "../mutations/mutation.ts";

interface Props {
    textInput: string;
    onSequenceChange: (sequence: string) => void;
    onAnalyse: () => void;
    selectedEditorName: string;
    setSelectedEditorName: (name: string) => void;
    desiredEdit: string;
    setDesiredEdit: (edit: string) => void;
}

function EditorConfigPanel({
                           textInput,
                           onSequenceChange,
                           onAnalyse,
                           selectedEditorName,
                           setSelectedEditorName,
                               desiredEdit,
                           setDesiredEdit,
                       }: Props

)
{

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onAnalyse();
        }
    };

    return (
        <>
            <div className="w-2/3 mx-auto flex flex-col gap-4">
                <legend className="fieldset-legend">DNA Sequence</legend>
                <textarea
                    className="textarea block w-full"
                    placeholder="Insert DNA Sequence"
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

                <button
                    className="btn btn-primary mt-4 block"
                    onClick={onAnalyse}
                >
                    Analyse
                </button>
            </div>
        </>
    );
}

export default EditorConfigPanel;