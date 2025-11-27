import {useState} from "react";

function App() {
    const [dnaSequence, setDnaSequence] = useState('');
    const [guideRNAs, setGuideRNAs] = useState<GuideRNA[]>([]);
    const [error, setError] = useState('');

    const validateSequence = (sequence: string): boolean => {
        const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
        const validPattern = /^[ATCG]+$/;
        return validPattern.test(cleanSeq);
    };

    
}



export default App;