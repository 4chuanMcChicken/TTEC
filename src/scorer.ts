// src/scorer/index.ts
import fs from 'fs';
import { WordScore, ScoringConfig, VanityError, VanityGenerationError } from './types';

/**
 * Default scoring configuration
 * @constant
 */
const DEFAULT_CONFIG: ScoringConfig = {
  pointsPerLetter: 10,
  patternBonus: 5,
  minWordLength: 3
};

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
 * 1. Word Recognition: length * pointsPerLetter points for each valid word
 * 2. Pattern Bonus: patternBonus points for 3+ consecutive identical characters
 * 
 * Time Complexity: O(n^2) where n is the word length
 * Space Complexity: O(1) using Set for constant-time lookups
 * 
 * @param {string} word - The potential vanity number to score
 * @param {ScoringConfig} [config] - Optional scoring configuration
 * @returns {WordScore} Detailed scoring result
 * @throws {VanityGenerationError} If word is invalid
 */
export function score(word: string, config: ScoringConfig = DEFAULT_CONFIG): WordScore {
  if (!word || typeof word !== 'string') {
    throw new VanityGenerationError(
      VanityError.INVALID_PHONE_NUMBER,
      'Invalid word input'
    );
  }

  const w = word.toLowerCase();
  const foundWords: string[] = [];
  let baseScore = 0;

  // Find all valid words using dynamic programming
  for (let i = 0; i < w.length; i++) {
    for (let j = i + config.minWordLength; j <= w.length; j++) {
      const substring = w.slice(i, j);
      if (words.has(substring)) {
        foundWords.push(substring);
        baseScore += substring.length * config.pointsPerLetter;
      }
    }
  }

  // Calculate pattern bonus
  const bonusScore = /(.)\1{2,}/.test(w) ? config.patternBonus : 0;

  return {
    word: word,
    baseScore: baseScore,
    bonusScore: bonusScore,
    totalScore: baseScore + bonusScore,
    foundWords: foundWords
  };
}

/**
 * Batch scores multiple vanity number candidates
 * 
 * @param {string[]} candidates - Array of vanity numbers to score
 * @param {ScoringConfig} [config] - Optional scoring configuration
 * @returns {WordScore[]} Array of scoring results
 */
export function batchScore(candidates: string[], config?: ScoringConfig): WordScore[] {
  return candidates.map(word => score(word, config));
}
