import type { EditorConfig, PAMSite, Strand } from './editorTypes.ts';
import { findPAMsForEditor } from './pamScanner.ts';
import { COMPLEMENT, getComplement, getReverseComplement } from './sequenceUtils.ts';
import { extractProtospacerFromPam, type Protospacer } from './protospacer.ts';
import { detectMutationTargetStrand, type EditRequestConfig } from './mutation.ts';

// TODO refactor these types

export type Guide = {
  genomicSeqPlusStrand: string, // Plus strand slice over the guide length
  guideSeq: string,
  indexMap: number [], // indexMap[guideIndex] = genomicIndex
  genomicRange: {start: number; end: number}, // [start, end)
  editingWindowGenomic: number[],
  // length: number,
  // startPos: number,
  // endPos: number,
  // targetStrand: string,
  pam: PAMSite,
  // protospacer: Protospacer,
  editor: EditorConfig,
  // editWindowStart: number,
  // editWindowEnd: number,
  targetEdits: EditablePosition[],
  bystanderEdits: EditablePosition[],
  allEdits: EditablePosition[]
  hitsDesiredSite: boolean,
  numBystanders: number,
  score: number,
  editRequest: EditRequestConfig,
  postEditSeqPlusStrand: string,
  postEditSeqOverGuideLengthPlusStrand: string,
}

export type EditablePosition = {
  genomicPos: number;             // absolute genomic position i.e. position in original user input sequence
  // positionInWindow: number;       // 0-based position within editing window
  positionInProtospacer: number;  // e.g.  0-19 position in the protospacer
  base: string;
  editedBase: string;
  isTarget: boolean;
  isBystander: boolean;
  // strand: Strand;
};

// TODO create type mutation, its a number for now
export function designGuidesAroundMutation(
  seq: string,
  absMutationPos: number,
  editRequest: EditRequestConfig,
  editor: EditorConfig
): Guide[] {

  const guides: Guide[] = [];

  // Scan for PAMs using editor.pamPatterns
  const PAMs: PAMSite[] = findPAMsForEditor(seq, editor);
  console.log('PAMs:');
  console.log(PAMs);

  // let targetStrand: Strand = detectMutationTargetStrand(seq, mutationPos0, editRequest, editor);
  // console.log(targetStrand);

  const protospacers: Protospacer[] = [];

  for (const pam of PAMs) {
    // Extract protospacers of editor.guideLength
    // const protospacer = extractProtospacerFromPam(seq, pam, editor);
    //
    // if (protospacer === null) {
    //   continue;
    // }
    //
    // if (!isPositionInEditingWindow(absMutationPos, protospacer)) {
    //   continue;
    // }
    // protospacers.push(protospacer);

    const L: number = editor.guideLength;
    const is3Prime: boolean = editor.pamOrientation === "PAM_3prime";

    let protospacerStartGen: number;
    let protospacerEndGen: number;

    if (is3Prime) {
      protospacerStartGen = pam.strand === "+" ? pam.startPos - L : pam.endPos;
    } else {
      protospacerStartGen = pam.strand === "+" ? pam.endPos : pam.startPos - L;
    }
    protospacerEndGen = protospacerStartGen + L;

    if (protospacerStartGen < 0 || protospacerEndGen > seq.length) continue;

    const genomicSeqPlusStrand: string = seq.substring(protospacerStartGen, protospacerEndGen)
    const guideSeq: string = pam.strand === "+" ? genomicSeqPlusStrand : getReverseComplement(genomicSeqPlusStrand);

    const indexMap: number[] = [];
    if (pam.strand === '+') {
      for (let i = 0; i < L; i++) indexMap.push(protospacerStartGen + i);
    } else {
      // For minus strand, Guide index 0 is at the highest genomic coordinate
      for (let i = 0; i < L; i++) indexMap.push(protospacerEndGen - 1 - i);
    }

    const editingWindowIndices: number [] = indexMap.slice(
      editor.activityWindows.from - 1,
      editor.activityWindows.to
    );

    const editablePositions: { targets: EditablePosition[], bystanders: EditablePosition[] }
      = findEditablePositionsInWindow(guideSeq, indexMap, editingWindowIndices, editRequest);

    const targetEdits = editablePositions.targets;
    const bystanderEdits = editablePositions.bystanders;
    const allEdits = [...targetEdits, ...bystanderEdits];

    const hitsDesiredSite = !! (allEdits.find(e => e.genomicPos === absMutationPos) || null );
    const numBystanders = bystanderEdits.length;
    // TODO move the scoring somewhere else
    const score = 100;

    const postEditSeq: string [] = seq.split('');
    allEdits.map((edit: EditablePosition) => {
      postEditSeq[edit.genomicPos] = edit.editedBase;
    });
    const postEditSeqPlusStrand: string = postEditSeq.join('');

    const postEditSeqOverGuideLengthPlusStrand: string =
      postEditSeq.slice(
        protospacerStartGen,
        protospacerEndGen
      ).
      join('');

    guides.push({
      guideSeq,
      genomicSeqPlusStrand,
      indexMap,
      editingWindowGenomic: editingWindowIndices,
      genomicRange: {start: protospacerStartGen, end: protospacerEndGen},
      pam,
      editRequest,
      editor,
      targetEdits: targetEdits,
      bystanderEdits: bystanderEdits,
      allEdits: allEdits,
      hitsDesiredSite,
      numBystanders,
      score,
      postEditSeqPlusStrand,
      postEditSeqOverGuideLengthPlusStrand,
    });

    /**
     * TODO put this comment somewhere else
     * The editing window is always counted from the 5' end
     *
     * Example:
     * Top Strand:     5' |N1|N2|....|N20|PAM       3'
     * Bottom Strand:  3' |Pam Start|N20|N19...|N1| 5'
     * Therefore the editing window has to either add or subtract the limit values
     */
  }

  console.log('Protospacers:');
  console.log(protospacers);

  // CCTTGTTTTTTATGTAAGATGCCCCCCCCCTGG
  // CCTTGTTTTTTATGTGGGATGCCCCCCCCCTGG

  console.log('Guides:');
  console.log(guides);

  return guides;
}

function findEditablePositionsInWindow(
  guideSeq: string,
  indexMap: number[],
  windowIndices: number[],
  editRequest
  : EditRequestConfig
): { targets: EditablePosition [], bystanders: EditablePosition[] } {

  const targets: EditablePosition[] = [];
  const bystanders: EditablePosition[] = [];


  for (const genomicPos of windowIndices) {
    const guideIdx = indexMap.indexOf(genomicPos);

    const baseInGuide = guideSeq[guideIdx];

    if (baseInGuide !== editRequest.fromBase) continue;

    const isTarget = editRequest.targetPositions?.includes(genomicPos) ?? false;

    const position: EditablePosition = {
      genomicPos: genomicPos,
      positionInProtospacer: guideIdx,
      base: baseInGuide,
      editedBase: editRequest.toBase,
      isTarget: isTarget,
      isBystander: !isTarget,
    };

    if (isTarget) {
      targets.push(position);
    } else {
      bystanders.push(position);
    }
  }

  return { targets, bystanders };



  // // TODO probably incorrect
  // const bases = seq.split('');
  // // const bases = protospacer.genomicSeqPlusStrand.split('');
  //
  // let targetStrand: Strand;
  // let nonTargetStrand: Strand;
  //
  // if (protospacer.pam.strand === "+") {
  //   targetStrand = "-";
  //   nonTargetStrand = "+";
  // } else {
  //   targetStrand = "+";
  //   nonTargetStrand = "-";
  // }
  //
  // const windowStartGenomic: number = protospacer.editWindowStartGenomic;
  // const windowEndGenomic: number = protospacer.editWindowEndGenomic;
  //
  // for (let genomicPos = windowStartGenomic; genomicPos <= windowEndGenomic; genomicPos++) {
  //   const base: string = bases[genomicPos];
  //
  //   const positionInWindow: number = genomicPos - windowStartGenomic;
  //
  //   // this seems accurate
  //   const positionInProtospacer: number = targetStrand === '+'
  //     ? genomicPos - protospacer.startPos
  //     : protospacer.endPos - genomicPos - 1;
  //
  //   // TODO verify. We only want editable bases on the nonTargetStrand (The strand with the PAM sequence)
  //   if (nonTargetStrand === '+') {
  //     if (base !== editRequestConfig.fromBase) continue;
  //   }
  //   if (nonTargetStrand === '-') {
  //     if (COMPLEMENT[base] !== editRequestConfig.fromBase) continue;
  //   }
  //
  //   const isTarget = editRequestConfig.targetPositions?.includes(genomicPos) ?? false;
  //
  //   const position: EditablePosition = {
  //     genomicPos: genomicPos,
  //     positionInWindow,
  //     positionInProtospacer,
  //     base: base,
  //     editedBase: editRequestConfig.toBase,
  //     isTarget: isTarget,
  //     isBystander: !isTarget,
  //     strand: targetStrand
  //   };
  //
  //   if (isTarget) {
  //     targets.push(position);
  //   } else {
  //     bystanders.push(position);
  //   }
  // }
  // return { targets, bystanders };
}

function isPositionInEditingWindow(
  position: number,
  protospacer: Protospacer
): boolean {
  const windowStart = protospacer.editWindowStartGenomic;
  const windowEnd = protospacer.editWindowEndGenomic;

  return position >= windowStart && position < windowEnd;
}