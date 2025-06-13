import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { expand } from './mapper';
import { score } from './scorer';

const db = new DynamoDBClient({});
const TABLE = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  const number =
    event?.phoneNumber ??
    event?.Details?.ContactData?.CustomerEndpoint?.Address ?? '';

  if (!number) {
    return { statusCode: 400, body: 'Missing phone number' };
  }

  const best5 = expand(number)
    .map(v => ({ v, s: score(v) }))
    .sort((a,b) => b.s - a.s)
    .slice(0,5)
    .map(x => x.v);

  await db.send(new PutItemCommand({
    TableName: TABLE,
    Item: {
      callerNumber: { S: number },
      createdAt:    { S: new Date().toISOString() },
      best5:        { SS: best5 },
    },
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({
      vanity1: best5[0],
      vanity2: best5[1],
      vanity3: best5[2],
    }),
  };
};
