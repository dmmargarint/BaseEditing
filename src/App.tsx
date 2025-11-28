import {useState} from "react";
import SequenceInput from './components/SequenceInput.tsx';

function App() {
    const [dnaSequence, setDnaSequence] = useState('');
    const [guideRNAs, setGuideRNAs] = useState<GuideRNA[]>([]);
    const [error, setError] = useState('');
    const [cas9Type, setCas9Type] = useState('spCas9');

    const validateSequence = (sequence: string): boolean => {
        const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
        const validPattern = /^[ATCG]+$/;
        return validPattern.test(cleanSeq);
    };

    const cas9Types = ["spCas9", "saCas9"];

    interface PamSequence {
      [key: string]: string;
    }
    const PamSequences: PamSequence = {
      "spCas9": "NGG",
      "saCas9": "NGGRRT",
    }
  // interface Map {
  //   [key: string]: string | undefined
  // }
  //
  // const HUMAN_MAP: Map = {
  //   draft: "Draft",
  // }
  //
  // export const human = (str: string) => HUMAN_MAP[str] || str

    return (
      <>
        <SequenceInput
          textInput={dnaSequence}
          onSequenceChange={setDnaSequence}
          cas9Types={cas9Types}
          PamSequences={PamSequences}
          onCas9TypeChange={setCas9Type}
        />


        <div>
          {dnaSequence}
        </div>


      </>
    );


}


export default App;