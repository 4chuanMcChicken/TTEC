"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapper_1 = require("../src/mapper");
describe('expand()', () => {
    it('returns 3^6 combos for a 7-digit number that包含1', () => {
        // 5 5 5 1 2 3 4  → 3×3×3×1×3×3×3 = 3^6
        const [combos, stats] = (0, mapper_1.expand)('5551234');
        expect(combos.length).toBe(3 ** 6); // 729
        expect(stats.totalCombinations).toBe(3 ** 6);
    });
    it('keeps digits 0 and 1 unchanged', () => {
        const [combos, stats] = (0, mapper_1.expand)('501');
        expect(combos).toContainEqual('J01');        // 5 → J  K  L
        expect(combos).toContainEqual('K01');
        expect(combos).toContainEqual('L01');
        expect(stats.validCombinations).toBe(3);
    });
});
