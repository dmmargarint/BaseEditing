import { describe, test, expect } from 'vitest';
import { designGuidesAroundMutation } from '../src/logic/guides';
import { A_TO_G_EDIT_REQUEST, C_TO_T_EDIT_REQUEST } from '../src/logic/mutation';

const EXAMPLE_SEQ = 'TACCAGGCGTTCCTGGAGAACATGGAGCGATCAGACCCCCTGGGCTTCAGGGGATCAGAGG';
// position 33 (1-based) = index 32 = 'A'
const MUTATION_POS = 32;

describe('designGuidesAroundMutation', () => {
  test('returns only guides that hit the mutation site', () => {
    const guides = designGuidesAroundMutation(EXAMPLE_SEQ, MUTATION_POS, A_TO_G_EDIT_REQUEST, 'auto');
    expect(guides.length).toBeGreaterThan(0);
    expect(guides.every(g => g.hitsDesiredSite)).toBe(true);
  });

  test('returns empty array when no editable base at mutation position', () => {
    // sequence of all G — no A to edit for A_TO_G
    const seq = 'G'.repeat(60);
    const guides = designGuidesAroundMutation(seq, 30, A_TO_G_EDIT_REQUEST, 'auto');
    expect(guides).toHaveLength(0);
  });

  test('each guide sequence length matches editor guide length', () => {
    const guides = designGuidesAroundMutation(EXAMPLE_SEQ, MUTATION_POS, A_TO_G_EDIT_REQUEST, 'auto');
    guides.forEach(g => {
      expect(g.guideSeq.length).toBe(g.editor.guideLength);
    });
  });

  test('only searches within window around mutation', () => {
    // pad sequence so mutation is far from the ends
    const padding = 'G'.repeat(500);
    const seq = padding + EXAMPLE_SEQ + padding;
    const pos = 500 + MUTATION_POS;
    const guides = designGuidesAroundMutation(seq, pos, A_TO_G_EDIT_REQUEST, 'auto');
    guides.forEach(g => {
      expect(g.genomicRange.start).toBeGreaterThanOrEqual(pos - 120);
      expect(g.genomicRange.end).toBeLessThanOrEqual(pos + 120);
    });
  });

  test('C_TO_T edit finds different guides than A_TO_G', () => {
    const aToG = designGuidesAroundMutation(EXAMPLE_SEQ, MUTATION_POS, A_TO_G_EDIT_REQUEST, 'auto');
    const cToT = designGuidesAroundMutation(EXAMPLE_SEQ, MUTATION_POS, C_TO_T_EDIT_REQUEST, 'auto');
    // both may find guides but for different target bases
    aToG.forEach(g => expect(g.editRequest.fromBase).toBe('A'));
    cToT.forEach(g => expect(g.editRequest.fromBase).toBe('C'));
  });
});
