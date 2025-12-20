import type {EditorConfig, PAMSite, Strand} from "./editorTypes.ts";
import {findPAMsForEditor} from "./pamScanner.ts";
import {COMPLEMENT, findReverseComplement} from "./sequenceUtils.ts";
import {extractProtospacerFromPam, type Protospacer} from "./protospacer.ts";
import {detectMutationTargetStrand, type EditRequestConfig} from "./mutation.ts";

// TODO refactor these types

export type Guide = {
  guideStrand: Strand,
  seq: string,
  length: number,
  start: number,
  end: number,
  pam: PAMSite,
  protospacer: Protospacer,
  editor: EditorConfig,
  editWindowStart: number,
  editWindowEnd: number,
  targetEdits: EditablePosition[],
  bystanderEdits: EditablePosition[],
  // editsSimulation: GuideEditSimulation,
  allEdits: EditablePosition[]
  // summary: GuideEditSummary
  hitsDesiredSite: boolean,
  numBystanders: number,
  score: number,
  desiredEdit: EditRequestConfig,
  postEditSeq: string,
  postEditSeqOverGuideLength: string,
}

export type EditablePosition = {
  genomicPos: number;             // absolute genomic position i.e. position in original user input sequence
  positionInWindow: number;       // 0-based position within editing window
  positionInProtospacer: number; // e.g.  0-19 position in the protospacer
  base: string;
  editedBase: string;
  isTarget: boolean;
  isBystander: boolean;
  strand: Strand;
};

export type SimulatedEdit = {
  pos: EditablePosition;
  originalBase: string;
  newBase: string;
}

export type GuideEditSimulation = {
  finalSeq: string;           // plus-strand after all edits for THIS guide
  finalSeqOverGuideLength: string; // plus-strand after all edits, covering only the guide length
  edits: SimulatedEdit[];     // includes main + bystanders
}

export type GuideSummary =  {
  hitsDesiredSite: boolean;
  // TODO rewrite, simulatedEdit should not be the type
  desiredEdit?: SimulatedEdit;      // if hitsDesiredSite === true
  bystanders: SimulatedEdit[];      // all edits except the main site
  numBystanders: number;
  score: number;                    // higher = better (e.g. hit - penalty * bystanders)
}

// TODO create type mutation, nr for now
export function designGuidesAroundMutation(
    seq: string,
    absMutationPos: number,
    editRequest: EditRequestConfig,
    editor: EditorConfig
): Guide[] {

    const guides: Guide[] = [];

    // Scan for PAMs using editor.pamPatterns
    const PAMs: PAMSite[] = findPAMsForEditor(seq, editor);
    console.log("PAMs:");
    console.log(PAMs);

    // let targetStrand: Strand = detectMutationTargetStrand(seq, mutationPos0, editRequest, editor);
    // console.log(targetStrand);


    const protospacers: Protospacer[] = [];

    for (const pam of PAMs) {
      // Extract protospacers of editor.guideLength
        const protospacer = extractProtospacerFromPam(seq, pam, editor);

        if (protospacer === null) {
          continue;
        }

      if (!isPositionInEditingWindow(absMutationPos, protospacer)) {
        continue;
      }
      protospacers.push(protospacer);

        const editablePositions: {targets: EditablePosition[], bystanders: EditablePosition[]}
          = findEditablePositionsInWindow(seq, protospacer, editRequest);

        const targetEdits = editablePositions.targets;
        const bystanderEdits = editablePositions.bystanders;
        const allEdits = [...targetEdits, ...bystanderEdits];

        // decide which strand is EDITED for this guide (not the guide strand)
        // TODO rewrite for different editors
        const editedStrand: Strand = pam.strand;

        // const editsSim = simulateGuideEdits(seq, protospacer, editablePositions, editRequest, editedStrand);

        // const guideSummary = evaluateGuideEditSimulation(editsSim, absMutationPos);

      const guideStrand: Strand = protospacer.pam.strand === "+"
        ? "-"
        : "+";

      // TODO move the summary, scoring, somewhere else

      const desiredEdit = allEdits.find(e => e.genomicPos === absMutationPos) || null;
      const hitsDesiredSite = !!desiredEdit;
      const numBystanders = bystanderEdits.length;
      // TODO for now
      const score = 100;

      let postEditSeq: string [] = seq.split("");
      allEdits.map((edit:EditablePosition) => {
        postEditSeq[edit.genomicPos] = edit.editedBase;
      });
      const postEditSeqOverGuideLength: string = postEditSeq.slice(protospacer.start, protospacer.end);

      guides.push({
        seq: findReverseComplement(protospacer.sequence) ?? "",
        guideStrand,
        length: protospacer.length,
        protospacer: protospacer,
        start: protospacer.start,
        end: protospacer.end,
        pam: protospacer.pam,
        editor: editor,
        desiredEdit: desiredEdit,
        editWindowStart: protospacer.editWindowStart,
        editWindowEnd: protospacer.editWindowEnd,
        targetEdits: targetEdits,
        bystanderEdits: bystanderEdits,
        allEdits: allEdits,
        hitsDesiredSite,
        numBystanders,
        score,
        postEditSeq: postEditSeq.join(""),
        postEditSeqOverGuideLength,
      });

      /**
       * The editing window is always counted from the 5' end
       *
       * Example:
       * Top Strand:     5' |N1|N2|....|N20|PAM       3'
       * Bottom Strand:  3' |Pam Start|N20|N19...|N1| 5'
       * Therefore editing window has to either add or subtract the limit values
       */

        // guides.push({
        //   seq: findReverseComplement(protospacer.sequence) ?? "",
        //   guideStrand: editedStrand === "+" ? "-" : "+",  // inverse of edited strand
        //   length: protospacer.length,
        //   protospacer: protospacer,
        //   editsSimulation: editsSim,
        //   summary: guideSummary,
        // });
    }

    console.log("Guides:");
    console.log(guides);

    console.log("Protospacers:");
    console.log(protospacers);

    // CCTTGTTTTTTATGTAAGATGCCCCCCCCCTGG
    // CCTTGTTTTTTATGTGGGATGCCCCCCCCCTGG

    console.log("Guides:");
    console.log(guides);

    // guides.map((guide: Guide) => {
    //     simulateGuideEdits(seq, guide, editRequest, targetStrand.targetStrand);
    // });

    // TODO apply edits

    // 5. Identify editable bases using editor.activityWindows
    // 6. Identify bystanders based on editor.targetBase
    // 7. Score guides, return sorted list

    return guides;
}

function findEditablePositionsInWindow(
    seq: string,
    protospacer: Protospacer,
    desiredEdit: EditRequestConfig
): {targets: EditablePosition [], bystanders: EditablePosition[]} {

    const targets: EditablePosition[] = [];
    const bystanders: EditablePosition[] = [];
    const bases = seq.split("");

    const targetStrand = protospacer.pam.strand;

    const windowStart: number = protospacer.editWindowStart;
    const windowEnd: number = protospacer.editWindowEnd;

    for (let genomicPos = windowStart; genomicPos < windowEnd; genomicPos++) {
        const base = bases[genomicPos];

        const positionInWindow: number = genomicPos - windowStart;

        const positionInProtospacer: number = targetStrand === "+"
        ? genomicPos - protospacer.start
        : protospacer.end - genomicPos - 1;

          // what the guide sees
          let guideBase: string;

          if (targetStrand === "+") {
            // the guide binds to the opposite strand (-) and sees the {base} on top
            guideBase = base;
            if (guideBase !== desiredEdit.fromBase) {
                continue;
            }
          } else {
            guideBase = COMPLEMENT[base];  // Guide sees complement
            if (guideBase !== COMPLEMENT[desiredEdit.fromBase])
              continue;
          }


          // TODO test
          // const genomicPosition = protospacer.pam.strand === "+"
          //   ? protospacer.start + genomicPos
          //   : protospacer.end - genomicPos - 1;

          const isTarget = desiredEdit.targetPositions?.includes(genomicPos) ?? false;

          const position: EditablePosition = {
            genomicPos: genomicPos,
            positionInWindow,
            positionInProtospacer,
            base: base,
            editedBase: desiredEdit.toBase,
            isTarget: isTarget,
            isBystander: !isTarget,
            strand: targetStrand,
          };

          if (isTarget) {
            targets.push(position);
          } else {
            bystanders.push(position);
          }
    }
    return { targets, bystanders };
}

function simulateGuideEdits(
    seq: string,
    prot: Protospacer,
    editableBasesInWindow: EditablePosition [],
    desiredEdit: EditRequestConfig,
    targetStrand: Strand
): GuideEditSimulation {
    let workingSeq = seq;
    const edits: SimulatedEdit[] = [];
    const bases = seq.split("");

    let arr = Array(bases.length).fill('-');

    for (const base of editableBasesInWindow) {
        const res = applyEdit(workingSeq, base.absPosition, desiredEdit, targetStrand);
        if (!res) continue;

        workingSeq = res.editedSeq;

        // TODO look at what the type has to be and update pos
        edits.push({
          pos: res,
          originalBase: res.originalBase,
          newBase: res.newBase,
        });
    }

  const finalSeqOverGuideLength = workingSeq.slice(prot.start, prot.end);
  return {
    finalSeq: workingSeq,
    finalSeqOverGuideLength,
  };
}

function isPositionInEditingWindow(
  position: number,
  protospacer: Protospacer
): boolean {
  const windowStart = protospacer.editWindowStart;
  const windowEnd = protospacer.editWindowEnd;

  return position >= windowStart && position < windowEnd;
}