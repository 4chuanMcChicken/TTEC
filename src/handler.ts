import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { expand } from './mapper';
import { score } from './scorer';

const db = new DynamoDBClient({});
const TABLE = process.env.TABLE_NAME!;

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
