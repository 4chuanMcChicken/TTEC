import { expand } from '../src/mapper';

describe('expand()', () => {
  it('returns 3^6 combos for a 7-digit number that contains 1', () => {
    // 5 5 5 1 2 3 4  → 3×3×3×1×3×3×3 = 3^6
    const [combos, stats] = expand('5551234');
    expect(combos.length).toBe(3 ** 6);     // 729
    expect(stats.totalCombinations).toBe(3 ** 6);
  });

  it('keeps digits 0 and 1 unchanged', () => {
    const [combos, stats] = expand('501');
    expect(combos).toContain('J01');        // 5 → J  K  L
    expect(combos).toContain('K01');
    expect(combos).toContain('L01');
    expect(stats.validCombinations).toBe(3);
  });

  it('handles empty input', () => {
    expect(() => expand('')).toThrow();
  });

  it('handles null input', () => {
    expect(() => expand(null as any)).toThrow();
  });

  it('generates correct combinations for simple input', () => {
    const [combos, stats] = expand('23');
    const expected = [
      'AD', 'AE', 'AF',
      'BD', 'BE', 'BF',
      'CD', 'CE', 'CF'
    ];
    expect(combos).toEqual(expect.arrayContaining(expected));
    expect(stats.totalCombinations).toBe(9);
  });

  it('tracks generation time', () => {
    const [_, stats] = expand('1234567');
    expect(stats.generationTime).toBeGreaterThanOrEqual(0);
  });
});
