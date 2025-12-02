import {useState} from "react";
import SequenceInput from './components/SequenceInput.tsx';

 // TODO if contains internal PAM, discard guide

function App() {
    const [dnaSequence, setDnaSequence] = useState<string>("");
    const [dnaSequenceInView, setDnaSequenceInView] = useState<string>("");
    const [guideRNAs, setGuideRNAs] = useState<GuideRNA[]>([]);
    const [error, setError] = useState<string>("");
    const [cas9Type, setCas9Type] = useState('spCas9');
    const [complement, setComplement] = useState<string>("");
    const [reverseComplement, setReverseComplement] = useState<string>("");

    const validateSequence = (sequence: string): boolean => {
        const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
        const validPattern = /^[ATCG]+$/;
        return validPattern.test(cleanSeq);
    };

    const cas9Types = ["SpCas9", "SaCas9"];

    interface PamSequence {
        [key: string]: string;
    }

    const PamSequences: PamSequence = {
        "SpCas9": "NGG",
        "SaCas9": "NGGRRT",
    }
    const complements = {
        "A": "T",
        "T": "A",
        "C": "G",
        "G": "C",
    }

    function onAnalyse() {
        setError('');

        // TODO validate input

        if (!validateSequence(dnaSequence)) {
            setError('Invalid DNA sequence. Please use only A, T, C, and G characters.');
            return;
        }
        setDnaSequence(dnaSequence.replace(/\s/g, '').toUpperCase());
        setDnaSequenceInView(dnaSequence);


        let compl = findComplement(dnaSequence)
        if (compl !== null) {
            setComplement(compl);
            setReverseComplement(compl.split("").reverse().join(""));
        }

        let pattern = /(.GG)+/dg;
        let regex;
        try {
            regex = new RegExp(pattern);
        } catch (e) {
            console.log(e);
            return;
            // TODO add return here
        }

        let result = "";
        let lastIndex = 0;
        let start = 0;
        let end = 0;
        let match;

        while ((match = regex.exec(dnaSequence)) !== null) {
            start = match.index;
            end = start + match[0].length;

            // TODO create React components
            // split string from last index to current index

            result += dnaSequence.slice(lastIndex, start);
            result += `<span class="PAM" style="color: red">${match[0]}</span>`;
            lastIndex = end;

            // avoids indefinite loops on zero length character matches
            if (regex.lastIndex === match.index) {
                regex.lastIndex++;
            }
        }
        console.log(result);
        setDnaSequenceInView(result);

    }

    function findComplement(dnaSeq: string): string | null {
        if (dnaSeq.length === 0) {
            return null;
        }

        let compl = "";
        for (let i = 0; i <= dnaSeq.length - 1; i++) {
            compl += complements[dnaSeq.charAt(i)];
        }

        return compl;
    }

    return (
        <>
            <div className="">
                <SequenceInput
                    textInput={dnaSequence}
                    onSequenceChange={setDnaSequence}
                    cas9Types={cas9Types}
                    PamSequences={PamSequences}
                    onCas9TypeChange={setCas9Type}
                    onAnalyse={onAnalyse}
                />

            </div>
            <div className="">
                <div dangerouslySetInnerHTML={{ __html: 'ORIGINAL SEQ: '+dnaSequenceInView }}/>
            </div>
            <div>
                COMPLMNT: {complement.length > 0 && (<span>{complement}</span>)}
            </div>
            <div>
                REV COMP: {reverseComplement.length > 0 && (<span>{reverseComplement}</span>)}
            </div>

            {error && (
                <div role="alert" className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none"
                         viewBox="0 0 24 24">
                        <path strokeWidth="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </>
    );
}

export default App;