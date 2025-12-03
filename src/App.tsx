import {useState} from "react";
import EditorConfigPanel from './components/EditorConfigPanel.tsx';
import SeqViz from "seqviz";
import type {EditorConfig} from "./editors/editorTypes.ts";
import type {Guide} from "./guides/guide.ts";
import {ALL_EDITORS} from "./editors/editorList.ts";
import type {Mutation} from "./mutations/mutation.ts";

 // TODO if contains internal PAM, discard guide
 // TODO filter the input before it gets to seqviz

function App() {
    const [dnaSequence, setDnaSequence] = useState<string>("");
    const [dnaSequenceInView, setDnaSequenceInView] = useState<string>("");
    const [guideRNAs, setGuideRNAs] = useState<GuideRNA[]>([]);
    const [error, setError] = useState<string>("");
    const [complement, setComplement] = useState<string>("");
    const [reverseComplement, setReverseComplement] = useState<string>("");
    const [selectedEditorName, setSelectedEditorName] = useState<string>("ABE8e_SpCas9");

    const validateSequence = (sequence: string): boolean => {
        const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
        const validPattern = /^[ATCG]+$/;
        return validPattern.test(cleanSeq);
    };

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


        // let compl = findComplement(dnaSequence)
        // if (compl !== null) {
        //     setComplement(compl);
        //     setReverseComplement(compl.split("").reverse().join(""));
        // }
        //
        // let pattern = /(.GG)+/dg;
        // let regex;
        // try {
        //     regex = new RegExp(pattern);
        // } catch (e) {
        //     console.log(e);
        //     return;
        // }
        //
        // let result = "";
        // let lastIndex = 0;
        // let start = 0;
        // let end = 0;
        // let match;
        //
        // while ((match = regex.exec(dnaSequence)) !== null) {
        //     start = match.index;
        //     end = start + match[0].length;
        //
        //     // TODO create React components
        //     // split string from last index to current index
        //
        //     result += dnaSequence.slice(lastIndex, start);
        //     result += `<span class="PAM" style="color: red">${match[0]}</span>`;
        //     lastIndex = end;
        //
        //     // avoids indefinite loops on zero length character matches
        //     if (regex.lastIndex === match.index) {
        //         regex.lastIndex++;
        //     }
        // }
        // console.log(result);
        // setDnaSequenceInView(result);

        // const editor = ALL_EDITORS.find(ed => ed.name === selectedEditorName);
    }

    function designGuidesAroundMutation(
        seq: string,
        mutation: Mutation,
        editor: EditorConfig
    ): Guide[] {
    let guides: Guide[] = [];

        // 1. Determine target strand using editor.targetBase
        // 2. Scan for PAMs using editor.pamPatterns
        // 3. Extract protospacers of editor.guideLength
        // 4. Handle PAM orientation (Cas9 vs Cas12a)
        // 5. Identify editable bases using editor.activityWindows
        // 6. Identify bystanders based on editor.targetBase
        // 7. Score guides, return sorted list

        return guides;
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
            {selectedEditorName}
            <div className="">
                <EditorConfigPanel
                    textInput={dnaSequence}
                    onSequenceChange={setDnaSequence}
                    onAnalyse={onAnalyse}
                    selectedEditorName={selectedEditorName}
                    setSelectedEditorName={setSelectedEditorName}
                />
            </div>

            { dnaSequence && (
                <div style={{ width: 800, height: 400 }}>
                    <SeqViz
                        name="DNA Sequence"
                        seq={dnaSequence}
                        annotations={[{ name: "promoter", start: 0, end: 34, direction: 1, color: "blue" }]}
                        // viewer="linear"
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>
             )}
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