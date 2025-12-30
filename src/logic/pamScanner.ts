import type {EditorConfig, PAMSite} from "./editorTypes.ts";
import {buildIupacRegex, reverseComplementIupac} from "./sequenceUtils.ts";

export function findPAMsForEditor(seq: string, editor: EditorConfig): PAMSite [] {
    const upperSeq = seq.toUpperCase();
    const results: PAMSite[] = [];

    for (const pam of editor.pamPatterns) {
        const pamLen = pam.length;

        // PAMs on PLUS strand
        const plusRegex = buildIupacRegex(pam);
        let match;

        while((match = plusRegex.exec(upperSeq)) !== null) {
            const matchStart = match.index;
            const matchEnd = match.index + pamLen;

            results.push({
                strand: "+",
                startPos: matchStart,
                endPos: matchEnd,
                pattern: pam,
                pamSeq: upperSeq.slice(matchStart, matchEnd)
            });

            if (plusRegex.lastIndex === match.index) {
                plusRegex.lastIndex++;
            }
        }

        // PAMs on MINUS strand
        const rcPAM = reverseComplementIupac(pam);
        const minusRegex  = buildIupacRegex(rcPAM);

        while((match = minusRegex.exec(upperSeq)) !== null) {
            const rcMatchStart = match.index;       // first base of RC pattern on +

            // That last base in RC corresponds to the 5' base of PAM on the MINUS strand. (CCN -> NGG)
            const rcMatchEnd = rcMatchStart + pamLen; // last base index on +

            results.push({
                strand: "-",
                startPos: rcMatchEnd,   // 5' base of NGG on −, in + coords
                endPos: rcMatchEnd,     // exclusive
                pattern: pam,
                pamSeq: upperSeq.slice(rcMatchStart, rcMatchEnd), // CCN etc. as seen on + strand
            });

            if (minusRegex.lastIndex === match.index) {
                minusRegex.lastIndex++;
            }
        }
    }

    return results;
}
