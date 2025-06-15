"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapper_1 = require("../src/mapper");
describe('expand()', () => {
    it('returns 3^6 combos for a 7-digit number that包含1', () => {
        // 5 5 5 1 2 3 4  → 3×3×3×1×3×3×3 = 3^6
        const combos = (0, mapper_1.expand)('5551234');
        expect(combos.length).toBe(3 ** 6); // 729
    });
    it('keeps digits 0 and 1 unchanged', () => {
        const combos = (0, mapper_1.expand)('501');
        expect(combos).toContain('J01'); // 5 → J  K  L
        expect(combos).toContain('K01');
        expect(combos).toContain('L01');
    });
});
