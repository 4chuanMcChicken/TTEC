import fs from 'fs';

const words = new Set(
  fs.readFileSync('assets/words.txt', 'utf-8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(w => w.toLowerCase())      
);

export function score(word: string): number {
  const w = word.toLowerCase();      
  let longest = 0;

  for (let i = 0; i < w.length; i++) {
    for (let j = i + 1; j <= w.length; j++) {
      if (words.has(w.slice(i, j))) longest = Math.max(longest, j - i);
    }
  }

  const repeat = /(.)\1{2,}/.test(w) ? 1 : 0;
  return longest * 10 + repeat;
}
