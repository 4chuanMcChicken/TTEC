// src/trie.ts
export class TrieNode {
    children: Record<string, TrieNode> = {};
    isWord = false;
  }
  
  export class Trie {
    root = new TrieNode();
    maxWordLength = 0;
  
    constructor(words: string[]) {
      for (const w of words) {
        // length 2 is too short for vanity numbers
        if (w.length < 3) continue;             
        this.maxWordLength = Math.max(this.maxWordLength, w.length);
        let node = this.root;
        for (const ch of w) {
          if (!node.children[ch]) node.children[ch] = new TrieNode();
          node = node.children[ch];
        }
        node.isWord = true;
      }
    }
  }
  