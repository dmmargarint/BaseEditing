import type {EditorConfig, PAMSite, Strand} from "./editorTypes.ts";
import {findPAMsForEditor} from "./pamScanner.ts";
import {COMPLEMENT, findReverseComplement} from "./sequenceUtils.ts";
import {extractProtospacerFromPam, type Protospacer} from "./protospacer.ts";
import {detectMutationTargetStrand, type EditRequestConfig} from "./mutation.ts";

export type Guide = {
  guideStrand: Strand,
  seq: string,
  length?: number,
  protospacer: Protospacer,
  editsSimulation: GuideEditSimulation,
  summary: GuideEditSummary
}

interface SimulatedEdit {
  pos0: number;
  originalBase: string;
  newBase: string;
}

interface GuideEditSimulation {
  finalSeq: string;           // plus-strand after all edits for THIS guide
  finalSeqOverGuideLength: string; // plus-strand after all edits, covering only the guide length
  edits: SimulatedEdit[];     // includes main + bystanders
}

export interface GuideEditSummary {
  hitsDesiredSite: boolean;
  desiredEdit?: SimulatedEdit;      // if hitsDesiredSite === true
  bystanders: SimulatedEdit[];      // all edits except the main site
  numBystanders: number;
  score: number;                    // higher = better (e.g. hit - penalty * bystanders)
}

// TODO create type mutation, nr for now
export function designGuidesAroundMutation(
    seq: string,
    mutationPos0: number,
    // targetStrand: Strand,
    desiredEdit: EditRequestConfig,
    editor: EditorConfig
): Guide[] {

    const guides: Guide[] = [];

    // 1. Determine target strand using editor.targetBase
    // TODO decide how to approach the desired target strand vs actual

    // TODO targetStrand is not type Strand anymore
    // TODO hold on to this idea, might need refactoring

    // 2. Scan for PAMs using editor.pamPatterns
    const PAMs: PAMSite[] = findPAMsForEditor(seq, editor);
    console.log("PAMs:");
    console.log(PAMs);

    // let targetStrand: Strand = detectMutationTargetStrand(seq, mutationPos0, desiredEdit, editor);
    // console.log(targetStrand);

    // 3. Extract protospacers of editor.guideLength
    const protospacers: Protospacer[] = [];

    for (const pam of PAMs) {
        const protospacer = extractProtospacerFromPam(seq, pam, editor);

        if (protospacer === null) {
          continue;
        }
        protospacers.push(protospacer);

        const editablePositions: [] = findEditablePositionsInWindow(seq, protospacer, desiredEdit);

        // decide which strand is EDITED for this guide (not the guide strand)
        // TODO rewrite for different editors
        const editedStrand: Strand = pam.strand;

        const edits = simulateGuideEdits(seq, protospacer, editablePositions, desiredEdit, editedStrand);

        const guideSummary = evaluateGuideSimulation(edits, mutationPos0);

        guides.push({
          seq: findReverseComplement(protospacer.sequence) ?? "",
          guideStrand: editedStrand === "+" ? "-" : "+",  // inverse of edited strand
          length: protospacer.length,
          protospacer: protospacer,
          editsSimulation: edits,
          summary: guideSummary,
        });

        // console.log("Guide summary:");
        // console.log(guideSummary);

        // console.log(editablePositions);
    }

    console.log("Guides:");
    console.log(guides);

    console.log("Protospacers:");
    console.log(protospacers);

    // CCTTGTTTTTTATGTAAGATGCCCCCCCCCTGG
    // CCTTGTTTTTTATGTGGGATGCCCCCCCCCTGG


    // if (!isPositionInEditingWindow(mutationPos0, protospacer, editor))
    //     protospacers.push(protospacer);

    /**
     * The editing window is always counted from the 5' end
     *
     * Example:
     * Top Strand:     5' |N1|N2|....|N20|PAM       3'
     * Bottom Strand:  3' |Pam Start|N20|N19...|N1| 5'
     * Therefore editing window has to either add or subtract the limit values
     */

    // TODO should I check the 5Prime vs 3Prime PAM direction
    // protospacers.map((protospacer: Protospacer) => {
    //     const protStart = protospacer.start;
    //     const protEnd = protospacer.end;
    //     if (protospacer.pam.strand === "+") {
    //
    //         let editWindowLowerLimit = protStart + editor.activityWindows.from;
    //         let editWindowUpperLimit = protStart + editor.activityWindows.to;
    //
    //         if (mutationPos0 >= editWindowLowerLimit && mutationPos0 <= editWindowUpperLimit) {
    //             let revcomp = findReverseComplement(protospacer.sequence);
    //             guides.push({
    //                 guideStrand: "-",
    //                 guideSequence: revcomp,
    //                 length: revcomp?.length,
    //                 protospacer: protospacer,
    //                 editWindowLowerLimit: editWindowLowerLimit,
    //                 editWindowUpperLimit: editWindowUpperLimit,
    //             });
    //         }
    //     } else {
    //         // TODO explain why
    //         let editWindowLowerLimit = protEnd - editor.activityWindows.to;
    //         let editWindowUpperLimit = protEnd - editor.activityWindows.from;
    //
    //         if (mutationPos0 >= editWindowLowerLimit && mutationPos0 <= editWindowUpperLimit) {
    //             let revcomp = findReverseComplement(protospacer.sequence);
    //             guides.push({
    //                 guideStrand: "+",
    //                 guideSequence: revcomp,
    //                 length: revcomp?.length,
    //                 protospacer: protospacer,
    //                 editWindowLowerLimit: editWindowLowerLimit,
    //                 editWindowUpperLimit: editWindowUpperLimit,
    //             });
    //         }
    //     }
    // });

    console.log("Guides:");
    console.log(guides);

    // guides.map((guide: Guide) => {
    //     simulateGuideEdits(seq, guide, desiredEdit, targetStrand.targetStrand);
    // });

    // TODO apply edits

    // 5. Identify editable bases using editor.activityWindows
    // 6. Identify bystanders based on editor.targetBase
    // 7. Score guides, return sorted list

    return guides;
}
//
// function getEditedStrandForGuide(
//     pam: PAMSite,
//     editor: EditorConfig
// ) {
//     const pamStrand = pam.strand;
//
//     return pamStrand;
// }

function evaluateGuideSimulation(
  sim: GuideEditSimulation,
  mutationPos0
): GuideEditSummary {

  const desiredEdit = sim.edits.find(e => e.pos0.position === mutationPos0) || null;
  const bystanders  = sim.edits.filter(e => e.pos0.position !== mutationPos0);

  const hitsDesiredSite = !!desiredEdit;
  const numBystanders = bystanders.length;

  // TODO compute score
  const score = 0;

  return {
    hitsDesiredSite,
    desiredEdit: desiredEdit || undefined,
    bystanders,
    numBystanders,
    score
  };
}

function findEditablePositionsInWindow(
    seq: string,
    protospacer: Protospacer,
    desiredEdit: EditRequestConfig
): [] {
    const results: [] = [];
    const bases = seq.split("");

    const windowStart: number = protospacer.editWindowStart;
    const windowEnd: number = protospacer.editWindowEnd;

    for (let i = windowStart; i < windowEnd; i++) {
        const plusStrandBase = bases[i];

        if (protospacer.pam.strand === "+") {
            if (plusStrandBase !== desiredEdit.fromBase) {
                continue;
            }
            results.push({
                position: i,
                positionInWindow: i - windowStart,
                // base: bases[i], // Plus Strand
            });
        } else {
            const fromComp = COMPLEMENT[desiredEdit.fromBase];
            if (plusStrandBase !== fromComp) {
                continue;
            }
            results.push({
                position: i,
                positionInWindow: i - windowStart,
                // base: bases[i], // Plus Strand
            });
        }
    }
    return results;
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
        originalSeq: seq,
        editedSeq: bases.join(""),
        originalBase: plusStrandBase,
        newBase: newPlusBase,
        pos0,
        targetStrand,
    }
}

function simulateGuideEdits(
    seq: string,
    prot: Protospacer,
    editableBasesInWindow: [],
    desiredEdit: EditRequestConfig,
    targetStrand: Strand
) {
    let workingSeq = seq;
    const edits: SimulatedEdit[] = [];
    const bases = seq.split("");

    let arr = Array(bases.length).fill('-');

    for (const pos0 of editableBasesInWindow) {
        const res = applyEdit(workingSeq, pos0.position, desiredEdit, targetStrand);
        if (!res) continue;

        workingSeq = res.editedSeq;
        edits.push({
           pos0,
           originalBase: res.originalBase,
           newBase: res.newBase,
        });
    }

    // for (let i = windowStart; i < windowEnd; i++) {
    //     if (bases[i] === desiredEdit.fromBase) {
    //         let edit = applyEdit(seq, i, desiredEdit, targetStrand);
    //         bases[i] = edit.newBase;
    //     }
    // }

    // editableBasesInWindow.map((i: number) => {
    //     arr[i] = '^';
    // });

    //
    // console.log(seq);
    // console.log(workingSeq);

    const finalSeqOverGuideLength = workingSeq.slice(prot.start, prot.end);

    return { finalSeq: workingSeq, finalSeqOverGuideLength, edits };
}

function isPositionInEditingWindow(
  position: number,
  protospacer: Protospacer
): boolean {
  const windowStart = protospacer.editWindowStart;
  const windowEnd = protospacer.editWindowEnd;

  return position >= windowStart && position < windowEnd;
}