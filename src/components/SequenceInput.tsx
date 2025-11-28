interface Props {
    textInput: string;
    cas9Types: string[];
    PamSequences: {};
    onSequenceChange: (sequence: string) => void;
    onCas9TypeChange: (type: string) => void;
}

function SequenceInput({textInput, onSequenceChange, cas9Types, PamSequences, onCas9TypeChange}: Props) {

    return (
        <>
            <fieldset className="fieldset">
                <legend className="fieldset-legend">DNA Sequence</legend>
                <textarea
                    className="textarea h24"
                    placeholder="Insert DNA Sequence"
                    id="dna_textarea"
                    value={textInput}
                    onChange={(e) => onSequenceChange(e.target.value)}
                />

                <legend className="fieldset-legend">Cas9 type</legend>
                <select
                    className="select"
                    id="cas9_type"
                    onChange={(e) => onCas9TypeChange(e.target.value)}
                >
                    {/*onCas9TypeChange(e.target.value)*/}
                    {cas9Types.map((cas9Type, index) => (
                        <option key={index} value={cas9Type}>{cas9Type}, PAM Sequence: {PamSequences[cas9Type]} </option>
                    ))}
                </select>
            </fieldset>
        </>
    );
}

export default SequenceInput;