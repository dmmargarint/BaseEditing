// type BaseEditorKind = "ABE" | "CBE" | "ABE8e" | "BE4" | "A&C-dual";
//
// interface EditorConfig {
//     name: string;
//     targetBase: "A" | "C" | "A&C";
//     productBase: "G" | "T" | "mixed";  // e.g. CBE can give C->T but sometimes other products
//     activityWindows: Array<{ from: number; to: number }>; // protospacer positions
//     nuclease: "SpCas9" | "SaCas9" | "Cas12a";
//     pamPatterns: string[];
//     notes?: string;
// }

export interface EditorConfig {
    /** Display name, e.g. "ABE8e" or "BE4max" */
    name: string;

    /** What base(s) the editor converts */
    targetBase: "A" | "C" | "A&C";

    /** Expected major product (simplified for v1) */
    productBase: "G" | "T" | "mixed";

    /** The nuclease model used by this editor */
    nuclease: "SpCas9" | "SpCas9-NG" | "SaCas9" | "Cas12a";

    /** List of PAM patterns (IUPAC). e.g. ["NGG"] or ["NG"] or ["TTTV"] */
    pamPatterns: string[];

    /** Protospacer size, e.g. 20 for SpCas9, 23 for SaCas9, 20-24 for Cas12a */
    guideLength: number;

    /**
     * Position(s) in the protospacer, relative to PAM, where editing occurs.
     * Example: ABE7.10 uses positions 4-8 (1-indexed from PAM-proximal end).
     */
    activityWindows: Array<{ from: number; to: number }>;

    /**
     * Orientation rules:
     *   - "PAM_3prime": PAM is 3' of protospacer (SpCas9)
     *   - "PAM_5prime": PAM is 5' of protospacer (Cas12a)
     */
    pamOrientation: "PAM_3prime" | "PAM_5prime";

    /** Optional notes, e.g. reduced bystander edits, RNA off-targets, etc. */
    notes?: string;
}