import type {EditorConfig} from "./editorTypes.ts";

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

//  Some sources claim activity window is 5-7
export const ABE8e_SaCas9: EditorConfig = {
    name: "ABE8e (SaCas9)",
    targetBase: "A",
    productBase: "G",
    nuclease: "SaCas9",
    pamPatterns: ["NNGRRT"],
    guideLength: 20,
    activityWindows: { from: 3, to: 14 },
    pamOrientation: "PAM_3prime",
    notes: ""
}

export const BE4max: EditorConfig = {
  name: "BE4max (SpCas9)",
  targetBase: "C",
  productBase: "T",
  nuclease: "SpCas9",
  pamPatterns: ["NGG"],
  guideLength: 20,
  activityWindows: {from: 3, to: 8},
  pamOrientation: "PAM_3prime",
}

export const ALL_EDITORS: EditorConfig[] = [
    ABE8e_SpCas9,
    ABE8e_SaCas9,
    BE4max,
]