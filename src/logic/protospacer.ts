import type { EditorConfig, PAMSite, Strand } from './editorTypes.ts';
import { getReverseComplement, reverseComplementIupac } from './sequenceUtils.ts';


/**
 * Start, end, editWindowStartGen/End are all absolute genomic positions
 */
export type Protospacer = {
  seq: string,                    //  5'->3' as it binds the target strand
  genomicSeqPlusStrand: string,   // Plus strand slice
  startPos: number,               // 0-based index on user DNA
  endPos: number,                 // exclusive, TODO verify
  editWindowStartGenomic: number,
  editWindowEndGenomic: number,
  editWindowStartProt: number,
  editWindowEndProt: number,
  pam: PAMSite,
  targetStrand: Strand,           // the protospacer is located on the target strand
  length: number,
}

export function extractProtospacerFromPam(sequence: string, pam: PAMSite, editor: EditorConfig): Protospacer | null {
  let protospacerStartGen: number;
  let protospacerEndGen: number;    // end-exclusive
  let genomicSeqPlusStrand: string;
  let editWindowStartGen: number;
  let editWindowEndGen: number;
  let editWindowStartProt: number;
  let editWindowEndProt: number;
  let protospacerStrand: Strand;
  let protospacerSeq: string;

  // converting to zero based from 1 based
  const from0: number = editor.activityWindows.from - 1;
  const to0: number = editor.activityWindows.to - 1;

  const L = editor.guideLength;

  // 5' - Protospacer - PAM - 3' TOP STRAND

  // TODO make the pam.strand the outermost if statement (i think)
  if (editor.pamOrientation === 'PAM_3prime') {
    if (pam.strand === '+') {
      protospacerStrand = "-";
      protospacerStartGen = pam.startPos - L; // abs genomic position
      protospacerEndGen = pam.startPos; // abs genomic position
      editWindowStartGen = protospacerStartGen + from0; // abs gen. pos
      editWindowEndGen = protospacerStartGen + to0; // abs gen. pos, end inclusive
      // TODO check for inclusive ends
      editWindowStartProt = from0;
      editWindowEndProt = to0;

      if (editWindowStartGen < 0 || editWindowEndGen > sequence.length) {
        return null; // Invalid protospacer
      }

      genomicSeqPlusStrand = sequence.substring(protospacerStartGen, protospacerEndGen);
      // protospacerSeq = getReverseComplement(genomicSeqPlusStrand);
      protospacerSeq = genomicSeqPlusStrand;
    } else {
      protospacerStrand = "+";
      protospacerStartGen = pam.endPos;
      protospacerEndGen = protospacerStartGen + L;

      editWindowStartGen = protospacerEndGen - 1 - to0;
      editWindowEndGen = protospacerEndGen - 1 - from0;
      editWindowStartProt = to0;
      editWindowEndProt = from0;

      if (editWindowStartGen < 0 || editWindowEndGen > sequence.length) {
        return null; // Invalid protospacer
      }

      genomicSeqPlusStrand = sequence.substring(protospacerStartGen, protospacerEndGen);
      protospacerSeq = getReverseComplement(genomicSeqPlusStrand);
    }
  } else if (editor.pamOrientation === 'PAM_5prime') {
    // TODO add the protospacerSeq and protospacerStrand
    // 5' - PAM - Protospacer - 3' TOP STRAND
    if (pam.strand === '+') {
      protospacerStartGen = pam.endPos;
      protospacerEndGen = pam.endPos + L;

      // TODO check these work for PAM_5Prime
      editWindowStartGen = protospacerStartGen + from0;
      editWindowEndGen = protospacerStartGen + to0;

      // TODO these are wrong, edit them and add the end inclusive bit
      editWindowStartProt = L - to0;
      editWindowEndProt = L - from0;

      if (editWindowStartGen < 0 || editWindowEndGen > sequence.length) {
        return null; // Invalid protospacer
      }

      genomicSeqPlusStrand = sequence.substring(protospacerStartGen, protospacerEndGen);
      protospacerStrand = "-";
      protospacerSeq = genomicSeqPlusStrand; // TODO incorrect??
    } else {
      // TODO rewrite
      protospacerStartGen = pam.startPos - L;
      protospacerEndGen = pam.startPos;
      editWindowStartGen = protospacerEndGen - to0;
      editWindowEndGen = protospacerEndGen - from0;

      editWindowStartProt = L - to0;
      editWindowEndProt = L - from0;

      if (editWindowStartGen < 0 || editWindowEndGen > sequence.length) {
        return null; // Invalid protospacer
      }

      protospacerStrand = "+";
      genomicSeqPlusStrand = sequence.substring(protospacerStartGen, protospacerEndGen);
      protospacerSeq = genomicSeqPlusStrand; // TODO incorrect??
    }
  } else {
    throw new Error('Unknown PAM Orientation');
  }

  return {
    seq: protospacerSeq,
    genomicSeqPlusStrand,
    targetStrand: protospacerStrand,
    startPos: protospacerStartGen,
    endPos: protospacerEndGen,
    editWindowStartGenomic: editWindowStartGen,
    editWindowEndGenomic: editWindowEndGen,
    editWindowStartProt: editWindowStartProt,
    editWindowEndProt: editWindowEndProt,
    pam: pam,
    length: protospacerSeq.length
  };
}