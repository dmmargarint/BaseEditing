import type { EditorConfig, PAMSite, Strand } from './editorTypes.ts';

export type Protospacer = {
  sequence: string;      //  5'->3' as it binds the target strand
  start: number;         // 0-based index on user DNA
  end: number;           // exclusive, TODO verify
  editWindowStart: number,
  editWindowEnd: number,
  pam: PAMSite;
  length: number
}

export function extractProtospacerFromPam(sequence: string, pam: PAMSite, editor: EditorConfig): Protospacer | null {
  let protospacerStart: number;
  let protospacerEnd: number;    // end-exclusive
  let slicePlusStrand: string;
  let editWindowStart: number;
  let editWindowEnd: number;

  let L = editor.guideLength;

  // 5' - Protospacer - PAM - 3' TOP STRAND
  if (editor.pamOrientation === 'PAM_3prime') {
    if (pam.strand === '+') {
      protospacerStart = pam.startPos - L;
      protospacerEnd = pam.startPos;
      editWindowStart = protospacerStart + editor.activityWindows.from;
      editWindowEnd = protospacerStart + editor.activityWindows.to;

      if (editWindowStart < 0 || editWindowEnd > sequence.length) {
        return null; // Invalid protospacer
      }

      slicePlusStrand = sequence.substring(protospacerStart, protospacerEnd);
    } else {
      protospacerStart = pam.endPos;
      protospacerEnd = protospacerStart + L;
      editWindowStart = protospacerEnd - editor.activityWindows.to;
      editWindowEnd = protospacerEnd - editor.activityWindows.from;

      if (editWindowStart < 0 || editWindowEnd > sequence.length) {
        return null; // Invalid protospacer
      }

      slicePlusStrand = sequence.substring(protospacerStart, protospacerEnd);
    }
  } else if (editor.pamOrientation === 'PAM_5prime') {

    // 5' - PAM - Protospacer - 3' TOP STRAND
    if (pam.strand === '+') {
      protospacerStart = pam.endPos;
      protospacerEnd = pam.endPos + L;

      // TODO check these work for PAM_5Prime
      editWindowStart = protospacerStart + editor.activityWindows.from;
      editWindowEnd = protospacerStart + editor.activityWindows.to;

      if (editWindowStart < 0 || editWindowEnd > sequence.length) {
        return null; // Invalid protospacer
      }

      slicePlusStrand = sequence.substring(protospacerStart, protospacerEnd);
    } else {
      // TODO rewrite
      protospacerStart = pam.startPos - L;
      protospacerEnd = pam.startPos;
      editWindowStart = protospacerEnd - editor.activityWindows.to;
      editWindowEnd = protospacerEnd - editor.activityWindows.from;

      if (editWindowStart < 0 || editWindowEnd > sequence.length) {
        return null; // Invalid protospacer
      }

      slicePlusStrand = sequence.substring(protospacerStart, protospacerEnd);
    }
  } else {
    throw new Error('Unknown PAM Orientation');
  }

  return {
    sequence: slicePlusStrand,
    start: protospacerStart,
    end: protospacerEnd,
    editWindowStart: editWindowStart,
    editWindowEnd: editWindowEnd,
    pam: pam,
    length: slicePlusStrand.length
  };
}