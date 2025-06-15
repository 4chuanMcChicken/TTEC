"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// test/scorer.test.ts
const scorer_1 = require("../src/scorer");
describe('score()', () => {
    it('gives higher score to real words', () => {
        const real = (0, scorer_1.score)('house');
        const fake = (0, scorer_1.score)('h0us3');
        console.log(real);
        console.log(fake);
        expect(real).toBeGreaterThan(fake);
    });
    it('awards bonus for repeated characters', () => {
        const repeat = (0, scorer_1.score)('aaaabcd');
        const noRepeat = (0, scorer_1.score)('abcdefg');
        expect(repeat).toBeGreaterThan(noRepeat);
    });
});
