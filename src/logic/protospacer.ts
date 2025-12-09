import type {EditorConfig, PAMSite} from "./editorTypes.ts";

// TODO create a protospacer type for this return
export function extractProtospacerFromPam(sequence: string, pam: PAMSite, editor: EditorConfig) {
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
                editor: editor,
                pam: pam,
                length: slicePlusStrand.length,
            };
        } else {
            protospacerStart = pam.startPos + 1;
            protospacerEnd = protospacerStart + editor.guideLength;

            slicePlusStrand = sequence.substring(protospacerStart, protospacerEnd);
            return {
                guideStrand: "+",
                sequence: slicePlusStrand,
                editor: editor,
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
                guideStrand: "-",
                sequence: slicePlusStrand,
                editor: editor,
                pam: pam,
                length: slicePlusStrand.length,
            };

        } else {
            // TODO test
            protospacerStart = pam.startPos + editor.guideLength;
            protospacerEnd = pam.startPos;

            slicePlusStrand = sequence.substring(protospacerStart, protospacerEnd);
            return {
                guideStrand: "+",
                sequence: slicePlusStrand,
                editor: editor,
                pam: pam,
                length: slicePlusStrand.length,
            };
        }
    }

    throw new Error("Unknown PAM Orientation");
}