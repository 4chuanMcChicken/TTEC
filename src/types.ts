/**
 * Standard phone keypad mapping type
 */
export type KeypadMapping = {
  readonly [key: string]: readonly string[];
};

/**
 * Represents a phone number to vanity number conversion request
 */
export interface VanityRequest {
  /** The phone number to convert */
  phoneNumber: string;
  /** Optional mode for conversion */
  mode?: 'FAST' | 'LLM';
}

/**
 * Represents a phone number to vanity number conversion response
 */
export interface VanityResponse {
  /** Top rated vanity number */
  vanity1: string;
  /** Second best vanity number */
  vanity2: string;
  /** Third best vanity number */
  vanity3: string;
}

/**
 * Represents a scored vanity number candidate
 */
export interface VanityCandidate {
  /** Original word/combination */
  word: string;
  /** Calculated score */
  score: number;
}

/**
 * Represents a DynamoDB record for storing vanity results
 */
export interface VanityRecord {
  /** The original caller's phone number */
  callerNumber: string;
  /** ISO timestamp of when the record was created */
  createdAt: string;
  /** Array of top 5 vanity numbers */
  best5: string[];
}

/**
 * Lambda event structure from Amazon Connect
 */
export interface ConnectEvent {
  /** Details about the contact */
  Details?: {
    /** Contact data including phone numbers */
    ContactData?: {
      /** Customer endpoint information */
      CustomerEndpoint?: {
        /** Customer's phone number */
        Address?: string;
      };
    };
  };
  /** Direct phone number input if not from Connect */
  phoneNumber?: string;
}

/**
 * Error types for the application
 */
export enum VanityError {
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  DICTIONARY_LOAD_ERROR = 'DICTIONARY_LOAD_ERROR',
  DYNAMODB_ERROR = 'DYNAMODB_ERROR'
}

/**
 * Custom error class for vanity number generation
 */
export class VanityGenerationError extends Error {
  constructor(
    public readonly code: VanityError,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'VanityGenerationError';
  }
}

/**
 * Configuration type for scoring parameters
 */
export interface ScoringConfig {
  /** Points per letter in a valid word */
  pointsPerLetter: number;
  /** Bonus points for pattern matches */
  patternBonus: number;
  /** Minimum word length to consider */
  minWordLength: number;
}

/**
 * Type for word scoring result
 */
export interface WordScore {
  /** The word being scored */
  word: string;
  /** Base score from word recognition */
  baseScore: number;
  /** Bonus score from patterns */
  bonusScore: number;
  /** Total calculated score */
  totalScore: number;
  /** Found dictionary words */
  foundWords: string[];
}

/**
 * Type for generation statistics
 */
export interface GenerationStats {
  /** Total combinations generated */
  totalCombinations: number;
  /** Number of valid combinations */
  validCombinations: number;
  /** Generation time in milliseconds */
  generationTime: number;
  /** Scoring time in milliseconds */
  scoringTime: number;
} 