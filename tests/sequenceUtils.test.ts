import { describe, test, expect } from 'vitest';
import { getReverseComplement } from '../src/logic/sequenceUtils';

describe('getReverseComplement', () => {
  test('reverses and complements a sequence', () => {
    expect(getReverseComplement('ATCG')).toBe('CGAT');
  });

  test('is its own inverse', () => {
    const seq = 'TACCAGGCGT';
    expect(getReverseComplement(getReverseComplement(seq))).toBe(seq);
  });
});
