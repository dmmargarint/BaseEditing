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
  // postEditSeqOverGuideLengthPlusStrand: string,
  ui: {
    displayStart: number;
    uiGenomicSeq: string,
    uiPostEditGenomicSeq?: string
  },
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

    // const postEditSeqOverGuideLengthPlusStrand: string =
    //   postEditSeq.slice(
    //     protospacerStartGen,
    //     protospacerEndGen
    //   ).
    //   join('');

    const displayPadding = 10;
    const displayStart = Math.max(0, protospacerStartGen - displayPadding);
    const displayEnd = Math.min(seq.length, protospacerEndGen + pam.pamSeq.length + displayPadding);
    //
    const uiGenomicSeq = seq.substring(displayStart, displayEnd);
    // const uiPostEditGenomicSeq = postEditSeqPlusStrand.substring(displayStart, displayEnd);

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
      // postEditSeqOverGuideLengthPlusStrand,
      ui: {displayStart, uiGenomicSeq}
    });
  }

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
}
