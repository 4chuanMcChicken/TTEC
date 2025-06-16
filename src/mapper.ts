// src/mapper/index.ts
import fs from 'fs';
import path from 'path';
import { Trie } from './trie';     

const wordList = fs.readFileSync(
  path.resolve('assets/words.txt'),
  'utf-8'
)
  .split(/\r?\n/)
  .filter(w => w.length >= 3)
  .map(w => w.toLowerCase());

export const trie = new Trie(wordList);

/**
 * Standard phone keypad mapping of digits to possible letters
 * @constant
 */
export const digitToLetters: Record<string, string[]> = {
  2: ['A','B','C'],   3: ['D','E','F'],
  4: ['G','H','I'],   5: ['J','K','L'],
  6: ['M','N','O'],   7: ['P','Q','R','S'],
  8: ['T','U','V'],   9: ['W','X','Y','Z'],
};

/**
 * Generates all possible letter combinations for a phone number using Cartesian product algorithm
 * Time Complexity: O(4^n) where n is the number of digits (max 7)
 * Space Complexity: O(4^n) to store all combinations
 * 
 * @param {string} phone - The input phone number
 * @returns {string[]} Array of all possible letter combinations
 */
export function expand(phone: string): string[] {
  const digits = phone.replace(/\D/g, '').slice(-7);
  let combos: string[] = [''];
  for (const d of digits) {
    const letters = digitToLetters[d] ?? [d];
    combos = combos.flatMap(p => letters.map(l => p + l));
  }
  return combos;
}
