import type {EditorConfig, Strand} from "./editorTypes.ts";
import {COMPLEMENT} from "./sequenceUtils.ts";

export interface EditRequestConfig {
    name: string;
    fromBase: "A" | "C";
    toBase: "G" | "T";
}

export const A_TO_G_EDIT_REQUEST: EditRequestConfig = {
    name: 'A_TO_G',
    fromBase: "A",
    toBase: "G",
}

export const C_TO_T_EDIT_REQUEST: EditRequestConfig = {
    name: 'C_TO_T',
    fromBase: "C",
    toBase: "T",
}

export const ALL_EDIT_REQUESTS: EditRequestConfig[] = [
    A_TO_G_EDIT_REQUEST,
    C_TO_T_EDIT_REQUEST,
];

export function detectMutationTargetStrand(
    seq: string,
    mutationPos0,
    desiredEdit: EditRequestConfig,
    editor: EditorConfig
) {
    let targetStrand: Strand;
    let base = seq.charAt(mutationPos0)?.toUpperCase(); // base on + strand
    if (!base) {
        throw new Error("Position out of range");
    }
    const comp = COMPLEMENT[base];

    if (base !== editor.targetBase &&
        comp !== editor.targetBase) {
        // Base is not editable with this editor
        return {
            isEditable: false,
            targetStrand: null,
            originalBase: base,
            desiredBase: desiredEdit.toBase
        }
    }

    if (base === desiredEdit.fromBase){
        // console.log("Nucleotide matches");
        targetStrand = "+";
    } else if (base === COMPLEMENT[desiredEdit.fromBase]){
        // console.log("Nucleotide matches complement");
        targetStrand = "-";
    } else{
        // console.log("Nucleotide does not match");
        return {
            isEditable: false,
            targetStrand: null,
            originalBase: base,
            desiredBase: desiredEdit.toBase
        }
    }

    return {
        isEditable: true,
        targetStrand: targetStrand,     // which strand contains the editable base
        originalBase: base,             // A, T, C, or G
        desiredBase: desiredEdit.toBase,// conceptual: user’s chosen edit outcome
    }
}

