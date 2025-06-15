export type VanityMode = 'FAST' | 'LLM';

export interface VanityCandidate {
  number: string;
  word: string;
  score: number;
}

export interface VanityResponse {
  vanity1: string;
  vanity2: string;
  vanity3: string;
}

export interface VanityRecord {
  callerNumber: string;
  createdAt: string;
  best5: string[];
  mode: VanityMode;
}

export interface LLMConfig {
  apiKey: string;
  model: string;
} 