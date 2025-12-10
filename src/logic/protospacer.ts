import type {EditorConfig, PAMSite, Strand} from "./editorTypes.ts";

export type Protospacer = {
    sequence: string;      //  5'->3' as it binds the target strand
    start: number;         // 0-based index on user DNA
    end: number;           // exclusive, TODO verify
    guideStrand: Strand;   // which strand the guide binds to
    pam: PAMSite;
    length: number
}

// TODO create a protospacer type for this return
export function extractProtospacerFromPam(sequence: string, pam: PAMSite, editor: EditorConfig): Protospacer {
    let protospacerStart: number;
    let protospacerEnd: number;    // end-exclusive
    let slicePlusStrand: string;

    // 5' - Protospacer - PAM - 3'
    if (editor.pamOrientation === "PAM_3prime") {
        if (pam.strand === "+") {
            protospacerStart = pam.startPos - editor.guideLength;
            protospacerEnd = pam.startPos;

            slicePlusStrand = sequence.substring(protospacerStart, protospacerEnd);
            return {
                guideStrand: "-",    // the guide will bind to the opposite strand
                sequence: slicePlusStrand,
                start: protospacerStart,
                end: protospacerEnd,
                pam: pam,
                length: slicePlusStrand.length,
            };
        } else {
            protospacerStart = pam.startPos + 1;
            protospacerEnd = protospacerStart + editor.guideLength;

            // protospacerStart = pam.startPos + 1 + editor.guideLength;
            // protospacerEnd = protospacerStart;

            slicePlusStrand = sequence.substring(protospacerStart, protospacerEnd);
            return {
                guideStrand: "+",    // the guide will bind to the opposite strand
                sequence: slicePlusStrand,
                start: protospacerStart,
                end: protospacerEnd,
                pam: pam,
                length: slicePlusStrand.length,
            };
        }
    }

    // 5' - PAM - Protospacer - 3'
    if (editor.pamOrientation === "PAM_5prime") {
        if (pam.strand === "+") {
            protospacerStart = pam.endPos;
            protospacerEnd = pam.endPos + editor.guideLength;

            slicePlusStrand = sequence.substring(protospacerStart, protospacerEnd);
            return {
                guideStrand: "-",    // the guide will bind to the opposite strand
                sequence: slicePlusStrand,
                start: protospacerStart,
                end: protospacerEnd,
                pam: pam,
                length: slicePlusStrand.length,
            };

        } else {
            // TODO test
            protospacerStart = pam.startPos + editor.guideLength;
            protospacerEnd = pam.startPos;

            slicePlusStrand = sequence.substring(protospacerStart, protospacerEnd);
            return {
                guideStrand: "+",    // the guide will bind to the opposite strand
                sequence: slicePlusStrand,
                start: protospacerStart,
                end: protospacerEnd,
                pam: pam,
                length: slicePlusStrand.length,
            };
        }
    }

    throw new Error("Unknown PAM Orientation");
}