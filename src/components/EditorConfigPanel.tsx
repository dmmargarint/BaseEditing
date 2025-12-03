import {ALL_EDITORS} from "../editors/editorList.ts";

interface Props {
    textInput: string;
    onSequenceChange: (sequence: string) => void;
    onAnalyse: () => void;
    selectedEditorName: string;
    setSelectedEditorName: (name: string) => void;
}

function EditorConfigPanel({
                           textInput,
                           onSequenceChange,
                           onAnalyse,
                           selectedEditorName,
                           setSelectedEditorName,
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