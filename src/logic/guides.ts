import type {EditorConfig, PAMSite, Strand} from "./editorTypes.ts";
import {findPAMsForEditor} from "./pamScanner.ts";
import {COMPLEMENT, findReverseComplement} from "./sequenceUtils.ts";
import {extractProtospacerFromPam, type Protospacer} from "./protospacer.ts";
import {detectMutationTargetStrand, type EditRequestConfig} from "./mutation.ts";

export type Guide = {
    guideStrand: Strand,
    guideSequence: string,
    length?: number,
    protospacer: Protospacer,
    editWindowLowerLimit: number,
    editWindowUpperLimit: number,
}

// TODO create type mutation, nr for now
// TODO create type guide
export function designGuidesAroundMutation(
    seq: string,
    mutationPos0: number,
    // targetStrand: Strand,
    desiredEdit: EditRequestConfig,
    editor: EditorConfig
): Guide[] {

    let guides: Guide[] = [];

    // 1. Determine target strand using editor.targetBase
    // TODO decide how to approach the desired target strand vs actual

    // TODO targetStrand is not type Strand anymore
    // TODO hold on to this idea, might need refactoring

    // 2. Scan for PAMs using editor.pamPatterns
    let PAMs: PAMSite[] = findPAMsForEditor(seq, editor);
    console.log("PAMs:");
    console.log(PAMs);

    let targetStrand: Strand = detectMutationTargetStrand(seq, mutationPos0, desiredEdit, editor);
    console.log(targetStrand);

    // 3. Extract protospacers of editor.guideLength
    let protospacers: Protospacer[] = [];
    PAMs.map((pam: PAMSite) => {
        const protospacer = extractProtospacerFromPam(seq, pam, editor);
        protospacers.push(protospacer);

        let editablePositions = findEditablePositionsInWindow(seq, protospacer, editor, desiredEdit, null);
        console.log(editablePositions);
    });
    console.log("Protospacers:");
    console.log(protospacers);

    /**
     * The editing window is always counted from the 5' end
     *
     * Example:
     * Top Strand:     5' |N1|N2|....|N20|PAM       3'
     * Bottom Strand:  3' |Pam Start|N20|N19...|N1| 5'
     * Therefore editing window has to either add or subtract the limit values
     */

    // TODO should I check the 5Prime vs 3Prime PAM direction
    protospacers.map((protospacer: Protospacer) => {
        const protStart = protospacer.start;
        const protEnd = protospacer.end;
        if (protospacer.pam.strand === "+") {

            let editWindowLowerLimit = protStart + editor.activityWindows.from;
            let editWindowUpperLimit = protStart + editor.activityWindows.to;

            if (mutationPos0 >= editWindowLowerLimit && mutationPos0 <= editWindowUpperLimit) {
                let revcomp = findReverseComplement(protospacer.sequence);
                guides.push({
                    guideStrand: "-",
                    guideSequence: revcomp,
                    length: revcomp?.length,
                    protospacer: protospacer,
                    editWindowLowerLimit: editWindowLowerLimit,
                    editWindowUpperLimit: editWindowUpperLimit,
                });
            }
        } else {
            // TODO explain why
            let editWindowLowerLimit = protEnd - editor.activityWindows.to;
            let editWindowUpperLimit = protEnd - editor.activityWindows.from;

            if (mutationPos0 >= editWindowLowerLimit && mutationPos0 <= editWindowUpperLimit) {
                let revcomp = findReverseComplement(protospacer.sequence);
                guides.push({
                    guideStrand: "+",
                    guideSequence: revcomp,
                    length: revcomp?.length,
                    protospacer: protospacer,
                    editWindowLowerLimit: editWindowLowerLimit,
                    editWindowUpperLimit: editWindowUpperLimit,
                });
            }
        }
    });

    console.log("Guides:");
    console.log(guides);

    guides.map((guide: Guide) => {
        simulateGuideEdits(seq, guide, desiredEdit, targetStrand.targetStrand);
    });

    // TODO apply edits

    // 5. Identify editable bases using editor.activityWindows
    // 6. Identify bystanders based on editor.targetBase
    // 7. Score guides, return sorted list

    return guides;
}

function findEditablePositionsInWindow(
    seq: string,
    protospacer: Protospacer,
    editor: EditorConfig,
    desiredEdit: EditRequestConfig,
    mutation
): number[] {
    const results: number[] = [];
    const bases = seq.split("");

    let newPlusBase: string;
    let windowStart: number = 0;
    let windowEnd: number = 0;

    if (protospacer.pam.strand === "+") {
        windowStart = protospacer.start + editor.activityWindows.from;
        windowEnd = protospacer.start + editor.activityWindows.to;

    } else {
        windowStart = protospacer.end - editor.activityWindows.to;
        windowEnd = protospacer.end - editor.activityWindows.from;
    }

    for (let i = windowStart; i < windowEnd; i++) {
        const plusStrandBase = bases[i];

        if (protospacer.pam.strand === "+") {
            if (plusStrandBase !== desiredEdit.fromBase) {
                continue;
            }
            results.push(i);
        } else {
            const fromComp = COMPLEMENT[desiredEdit.fromBase];
            if (plusStrandBase !== fromComp) {
                continue;
            }
            results.push(i);

        }

    }

    return results
}

function applyEdit(
    seq: string,
    pos0: number,
    desiredEdit: EditRequestConfig,
    targetStrand: Strand
) {
    const bases = seq.split("");
    const plusStrandBase = bases[pos0];

    let newPlusBase: string;

    // TODO check if the editor supports this desiredEdit. !!!!!!!
    if (targetStrand === "+") {
        if (plusStrandBase !== desiredEdit.fromBase) {
            return null;
        }
        newPlusBase = desiredEdit.toBase;
    } else {
        const fromComp = COMPLEMENT[desiredEdit.fromBase];
        if (plusStrandBase !== fromComp) {
            return null;
        }

        const newBottomBase = desiredEdit.toBase;
        newPlusBase = COMPLEMENT[newBottomBase];
    }

    bases[pos0] = newPlusBase;

    return {
        // originalSeq: seq,
        editedSeq: bases.join(""),
        originalBase: plusStrandBase,
        newBase: newPlusBase,
        pos0,
        targetStrand,
    }
}

function simulateGuideEdits(seq: string, guide: Guide, desiredEdit: EditRequestConfig, targetStrand: Strand) {
    const bases = seq.split("");

    let editableBasesInWindow = [];

    let arr = Array(bases.length).fill('-');

    for (let i = guide.editWindowLowerLimit; i < guide.editWindowUpperLimit; i++) {
        if (bases[i] === desiredEdit.fromBase) {
            editableBasesInWindow.push(i);
            let edit = applyEdit(seq, i, desiredEdit, targetStrand);
            bases[i] = edit.newBase;
        }
    }

    editableBasesInWindow.map((i: number) => {
        arr[i] = '^';
    });

    console.log(bases.join(""));
    console.log(arr.join(""));

    return {}
}