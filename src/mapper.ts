// src/mapper/index.ts
import fs from 'fs';
import path from 'path';
import { Trie } from './trie';     
import { KeypadMapping, GenerationStats } from './types';

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
export const digitToLetters: KeypadMapping = {
  2: ['A','B','C'] as const,
  3: ['D','E','F'] as const,
  4: ['G','H','I'] as const,
  5: ['J','K','L'] as const,
  6: ['M','N','O'] as const,
  7: ['P','Q','R','S'] as const,
  8: ['T','U','V'] as const,
  9: ['W','X','Y','Z'] as const,
};

/**
 * Generates all possible letter combinations for a phone number using Cartesian product algorithm
 * Time Complexity: O(4^n) where n is the number of digits (max 7)
 * Space Complexity: O(4^n) to store all combinations
 * 
 * @param {string} phone - The input phone number
 * @returns {[string[], GenerationStats]} Tuple of combinations array and generation statistics
 * @throws {Error} If phone number is invalid
 */
export function expand(phone: string): [string[], GenerationStats] {
  const startTime = Date.now();
  
  // Input validation
  if (!phone || typeof phone !== 'string') {
    throw new Error('Invalid phone number input');
  }

  // Extract last 7 digits
  const digits = phone.replace(/\D/g, '').slice(-7);
  let combos: string[] = [''];
  
  // Generate combinations using Cartesian product
  for (const d of digits) {
    const letters = digitToLetters[d] ?? [d];
    combos = combos.flatMap(p => letters.map(l => p + l));
  }

  // Calculate statistics
  const stats: GenerationStats = {
    totalCombinations: combos.length,
    validCombinations: combos.filter(c => /^[A-Z0-9]+$/.test(c)).length,
    generationTime: Date.now() - startTime,
    scoringTime: 0 // Will be set by scorer
  };

  return [combos, stats];
}
