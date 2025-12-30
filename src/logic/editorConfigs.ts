import type {EditorConfig} from "./editorTypes.ts";

// TODO ABE8e for SaCas9
export const ABE8e_SpCas9: EditorConfig = {
    name: "ABE8e (SpCas9)",
    targetBase: "A",
    productBase: "G",
    nuclease: "SpCas9",
    pamPatterns: ["NGG"],
    guideLength: 20,
    activityWindows: { from: 4, to: 8 }, // 1 based
    pamOrientation: "PAM_3prime",
    notes: "High-efficiency ABE with narrow editing window."
}

// TODO add the regex for the rest of them
//  Some sources claim activity window is 5-7
export const ABE8e_SaCas9: EditorConfig = {
    name: "ABE8e (SaCas9)",
    targetBase: "A",
    productBase: "G",
    nuclease: "SaCas9",
    pamPatterns: ["NNGRRT"],
    guideLength: 21,
    activityWindows: { from: 4, to: 12 },
    pamOrientation: "PAM_3prime",
    notes: ""
}

export const ALL_EDITORS: EditorConfig[] = [
    ABE8e_SpCas9,
    ABE8e_SaCas9,
]