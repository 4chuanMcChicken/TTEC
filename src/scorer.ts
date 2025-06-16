// src/scorer/index.ts
import { trie } from './mapper';
import fs from 'fs';

/**
 * Dictionary set for word lookup
 * Loaded from words.txt and converted to lowercase for case-insensitive matching
 */
const words = new Set(
  fs.readFileSync('assets/words.txt', 'utf-8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(w => w.toLowerCase())      
);

/**
 * Scores a potential vanity number based on word recognition and pattern analysis
 * Uses dynamic programming approach for substring matching
 * 
 * Scoring criteria:
 * 1. Word Recognition: length * 10 points for each valid word
 * 2. Pattern Bonus: 5 points for 3+ consecutive identical characters
 * 
 * Time Complexity: O(n^2) where n is the word length
 * Space Complexity: O(1) using Set for constant-time lookups
 * 
 * @param {string} word - The potential vanity number to score
 * @returns {number} The calculated score
 */
export function score(word: string): number {
  const w = word.toLowerCase();
  let longest = 0;
  const { root, maxWordLength } = trie;

  // We only care about substrings of length ≥ 3
  const minLen = 3;
  for (let i = 0; i <= w.length - minLen; i++) {
    let node = root;
    // Walk the trie from this starting index
    for (let j = i; j < w.length; j++) {
      const ch = w[j];
      node = node.children[ch];
      if (!node) break;             // dead-end: no further matches
      const len = j - i + 1;
      if (node.isWord && len > longest) {
        longest = len;
        // if we've hit the absolute longest in your dictionary, stop early
        if (longest === maxWordLength) break;
      }
    }
    if (longest === maxWordLength) break;
  }

  const repeat = /(.)\1{2,}/.test(w) ? 1 : 0;
  return longest * 10 + repeat;
}
