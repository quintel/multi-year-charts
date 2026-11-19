import { toFine } from '../vocabulary';

describe('toFine', () => {
  it('rounds to six decimals and drops trailing zeros', () => {
    expect(String(toFine(0.005))).toBe('0.005');
    expect(String(toFine(33.33333333))).toBe('33.333333');
    expect(String(toFine(100.0100000001))).toBe('100.01');
  });
});
