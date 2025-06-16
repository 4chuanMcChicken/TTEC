import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { expand } from './mapper';
import { score } from './scorer';

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
 * @param {Object} event - Lambda event object
 * @param {string} event.phoneNumber - Input phone number to convert
 * @returns {Promise<Object>} Top 3 vanity number suggestions
 */
export const handler = async (event: any) => {
  console.log('📞 Received event:', JSON.stringify(event));

  const number =
    event?.phoneNumber ??
    event?.Details?.ContactData?.CustomerEndpoint?.Address ??
    '';
  console.log('🔍 Parsed phoneNumber:', number);

  if (!number) {
    console.error('⚠️ Missing phone number');
    return { statusCode: 400, body: 'Missing phone number' };
  }

  const allCombos = expand(number);
  console.log('➰ All combinations count:', allCombos.length);

  const best5 = allCombos
    .map(v => ({ v, s: score(v) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 5)
    .map(x => x.v);
  console.log('🏆 Top 5 vanity results:', best5);

  try {
    console.log('💾 Writing to DynamoDB table:', TABLE);
    await db.send(
      new PutItemCommand({
        TableName: TABLE,
        Item: {
          callerNumber: { S: number },
          createdAt:    { S: new Date().toISOString() },
          best5:        { SS: best5 },
        },
      })
    );
    console.log('✅ DynamoDB write succeeded');
  } catch (dbErr) {
    console.error('❌ DynamoDB write failed:', dbErr);
    throw dbErr;
  }

  const response = {
    vanity1: best5[0],
    vanity2: best5[1],
    vanity3: best5[2],
  };
  console.log('🔙 Returning response:', response);

  return response;
};
