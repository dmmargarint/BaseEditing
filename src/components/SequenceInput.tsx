interface Props {
    textInput: string;
    cas9Types: string[];
    PamSequences: {};
    onSequenceChange: (sequence: string) => void;
    onCas9TypeChange: (type: string) => void;
    onAnalyse: () => void;
}

function SequenceInput({
                           textInput,
                           onSequenceChange,
                           cas9Types,
                           PamSequences,
                           onCas9TypeChange,
                           onAnalyse}
                       : Props) {

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
                        // value="ACACCTAGGGAGAAGGGGAGCATGG"
                        onChange={(e) => onSequenceChange(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />



                <legend className="fieldset-legend">Cas9 type</legend>
                <select
                    className="select block w-full"
                    id="cas9_type"
                    onChange={(e) => onCas9TypeChange(e.target.value)}
                >
                    {cas9Types.map((cas9Type, index) => (
                        <option key={index} value={cas9Type}>{cas9Type}, PAM
                            Sequence: {PamSequences[cas9Type]} </option>
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

export default SequenceInput;