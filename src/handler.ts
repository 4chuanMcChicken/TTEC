import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { expand } from './mapper';
import { score, batchScore } from './scorer';
import {
  ConnectEvent,
  VanityResponse,
  VanityRecord,
  VanityError,
  VanityGenerationError,
  WordScore,
  GenerationStats
} from './types';

const db = new DynamoDBClient({});
const TABLE = process.env.TABLE_NAME!;

/**
 * AWS Lambda handler for vanity number generation
 * Implements a two-phase algorithm:
 * 1. Generation Phase: Creates all possible letter combinations
 * 2. Scoring Phase: Ranks combinations using word recognition and pattern analysis
 * 
 * Time Complexity: O(4^n * m^2) where:
 * - n is the number of digits (max 7)
 * - m is the average length of combinations
 * - 4^n for combination generation
 * - m^2 for scoring each combination
 * 
 * @param {ConnectEvent} event - Lambda event object from Amazon Connect or direct invocation
 * @returns {Promise<VanityResponse>} Top 3 vanity number suggestions
 * @throws {VanityGenerationError} If phone number is invalid or processing fails
 */
export const handler = async (event: ConnectEvent): Promise<VanityResponse> => {
  console.log('📞 Received event:', JSON.stringify(event));

  // Extract phone number from event
  const number =
    event?.phoneNumber ??
    event?.Details?.ContactData?.CustomerEndpoint?.Address;

  console.log('🔍 Parsed phoneNumber:', number);

  if (!number) {
    throw new VanityGenerationError(
      VanityError.INVALID_PHONE_NUMBER,
      'Missing phone number'
    );
  }

  // Generate and score combinations
  const [combinations, stats] = expand(number);
  console.log('➰ Generation stats:', stats);

  const scoredCombos: WordScore[] = batchScore(combinations);
  stats.scoringTime = Date.now() - (stats.generationTime + Date.now());

  // Sort by total score and get top 5
  const best5 = scoredCombos
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5)
    .map(x => x.word);

  console.log('🏆 Top 5 vanity results:', best5);

  try {
    // Store results in DynamoDB
    const record: VanityRecord = {
      callerNumber: number,
      createdAt: new Date().toISOString(),
      best5: best5
    };

    await db.send(
      new PutItemCommand({
        TableName: TABLE,
        Item: {
          callerNumber: { S: record.callerNumber },
          createdAt: { S: record.createdAt },
          best5: { SS: record.best5 }
        }
      })
    );
    console.log('✅ DynamoDB write succeeded');
  } catch (error) {
    console.error('❌ DynamoDB write failed:', error);
    throw new VanityGenerationError(
      VanityError.DYNAMODB_ERROR,
      'Failed to store results',
      error
    );
  }

  const response: VanityResponse = {
    vanity1: best5[0],
    vanity2: best5[1],
    vanity3: best5[2]
  };
  console.log('🔙 Returning response:', response);

  return response;
};
