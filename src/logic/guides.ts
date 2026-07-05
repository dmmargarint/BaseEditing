import type { EditorConfig, PAMSite } from './editorTypes.ts';
import { findPAMsForEditor } from './pamScanner.ts';
import { getReverseComplement } from './sequenceUtils.ts';
import {type EditRequestConfig } from './mutation.ts';
import { ALL_EDITORS } from './editorConfigs.ts';

// TODO refactor these types

export type Guide = {
  id: string;
  genomicSeqPlusStrand: string, // Plus strand slice over the guide length
  guideSeq: string,
  indexMap: number [], // indexMap[guideIndex] = genomicIndex
  genomicRange: {start: number; end: number}, // [start, end)
  editingWindowGenomic: number[],
  pam: PAMSite,
  editor: EditorConfig,
  targetEdits: EditablePosition[],
  bystanderEdits: EditablePosition[],
  allEdits: EditablePosition[]
  hitsDesiredSite: boolean,
  numBystanders: number,
  editRequest: EditRequestConfig,
  postEditSeqPlusStrand: string,
  ui: {
    displayStart: number,
    displayPadding: number,
    uiGenomicSeq: string,
    uiPostEditGenomicSeq?: string
  },
  analysis?: {
    efficiencyScore?: number;
    globalRiskScore?: number;
    alignments?: any[];
    [key: string]: unknown;
  },
}

export type EditablePosition = {
  genomicPos: number;             // absolute genomic position i.e. position in original user input sequence
  positionInProtospacer: number;  // e.g.  0-19 position in the protospacer
  base: string;
  editedBase: string;
  isTarget: boolean;
  isBystander: boolean;
  // strand: Strand;
};

// TODO create type mutation, its a number for now
const SEARCH_WINDOW_BP = 100;

export function designGuidesAroundMutation(
  seq: string,
  absMutationPos: number,
  editRequest: EditRequestConfig,
  editor: EditorConfig | "auto"
): Guide[] {

  const guides: Guide[] = [];

  const windowStart = Math.max(0, absMutationPos - SEARCH_WINDOW_BP);
  const windowEnd = Math.min(seq.length, absMutationPos + SEARCH_WINDOW_BP);
  const searchSeq = seq.substring(windowStart, windowEnd);

  let editorsToSearch = [];

  if (editor === "auto") {
    editorsToSearch = ALL_EDITORS.filter((editor: EditorConfig) => {
      return editor.targetBase === editRequest.fromBase
    });
  } else {
    editorsToSearch.push(editor);
  }

  editorsToSearch.map((editor: EditorConfig) => {
    const PAMs: PAMSite[] = findPAMsForEditor(searchSeq, editor).map(pam => ({
      ...pam,
      startPos: pam.startPos + windowStart,
      endPos: pam.endPos + windowStart,
    }));

    for (const pam of PAMs) {
      const L: number = editor.guideLength;
      const is3Prime: boolean = editor.pamOrientation === "PAM_3prime";

      let protospacerStartGen: number;

      if (is3Prime) {
        protospacerStartGen = pam.strand === "+" ? pam.startPos - L : pam.endPos;
      } else {
        protospacerStartGen = pam.strand === "+" ? pam.endPos : pam.startPos - L;
      }
      const protospacerEndGen = protospacerStartGen + L;

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
        = findEditablePositionsInWindow(guideSeq, absMutationPos, indexMap, editingWindowIndices, editRequest);

      const targetEdits = editablePositions.targets;
      const bystanderEdits = editablePositions.bystanders;
      const allEdits = [...targetEdits, ...bystanderEdits];

      const hitsDesiredSite = !! (allEdits.find(e => e.genomicPos === absMutationPos) || null );
      const numBystanders = bystanderEdits.length;

      const postEditSeq: string [] = seq.split('');
      allEdits.map((edit: EditablePosition) => {
        postEditSeq[edit.genomicPos] = edit.editedBase;
      });
      const postEditSeqPlusStrand: string = postEditSeq.join('');

      const displayPadding = 5;
      const displayStart = Math.max(0, protospacerStartGen - displayPadding);
      const displayEnd = Math.min(seq.length, protospacerEndGen + pam.pamSeq.length + displayPadding);

      const uiGenomicSeq = seq.substring(displayStart, displayEnd);
      const uiPostEditGenomicSeq = postEditSeqPlusStrand.substring(displayStart, displayEnd);

      const id = `${guideSeq}.${editor.name}`;

      if (!hitsDesiredSite) continue;

      guides.push({
        id,
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
        postEditSeqPlusStrand,
        ui: {displayStart, displayPadding, uiGenomicSeq, uiPostEditGenomicSeq},
      });
    }
  });

  return guides;
}

function findEditablePositionsInWindow(
  guideSeq: string,
  absMutationPos: number,
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

    const isTarget = absMutationPos === genomicPos;

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
