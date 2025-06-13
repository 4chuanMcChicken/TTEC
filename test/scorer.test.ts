// test/scorer.test.ts
import { score } from '../src/scorer';

describe('score()', () => {
  it('gives higher score to real words', () => {
    const real = score('house');    
    const fake = score('h0us3');     
    console.log(real)
    console.log(fake)
    expect(real).toBeGreaterThan(fake);
  });

  it('awards bonus for repeated characters', () => {
    const repeat = score('aaaabcd');
    const noRepeat = score('abcdefg');
    expect(repeat).toBeGreaterThan(noRepeat);
  });
});
