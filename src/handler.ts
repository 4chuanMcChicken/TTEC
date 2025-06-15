import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { expand } from './mapper';
import { score } from './scorer';
import { SecretsService } from './services/secretsService';
import { LLMService } from './services/llmService';
import { Logger } from '@aws-lambda-powertools/logger';
import { VanityMode } from './types';

const logger = new Logger({ serviceName: 'VanityHandler' });
const db = new DynamoDBClient({});
const secretsService = new SecretsService();
const TABLE = process.env.TABLE_NAME!;
const OPENAI_KEY_SECRET = process.env.OPENAI_API_KEY_SECRET!;

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

  // Default to FAST mode if not specified
  const mode: VanityMode = event?.mode ?? 'FAST';
  logger.info('Using mode', { mode });

  const allCombos = expand(number);
  console.log('➰ All combinations count:', allCombos.length);

  let best5;
  if (mode === 'LLM') {
    try {
      const apiKeyJson = await secretsService.getSecret(OPENAI_KEY_SECRET);
      const apiKey = JSON.parse(apiKeyJson).OPENAI_API_KEY;
      console.log('🔑 API key retrieved:', apiKey);
      const llmService = new LLMService({ 
        apiKey, 
        model: 'o4-mini-2025-04-16' 
      });

      // Get initial candidates using heuristic scoring
      const candidates = allCombos
        .map(v => ({ 
          number,
          word: v, 
          score: score(v) 
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20); // Take top 20 for LLM ranking

      // Use LLM to re-rank candidates
      const rankedCandidates = await llmService.rankCandidates(candidates);
      best5 = rankedCandidates.slice(0, 5).map(c => c.word);
      
    } catch (error) {
      logger.error('LLM ranking failed, falling back to heuristic scoring', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Fall back to FAST mode
      best5 = allCombos
        .map(v => ({ v, s: score(v) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, 5)
        .map(x => x.v);
    }
  } else {
    best5 = allCombos
      .map(v => ({ v, s: score(v) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)
      .map(x => x.v);
  }

  console.log('🏆 Top 5 vanity results:', best5);

  try {
    await db.send(
      new PutItemCommand({
        TableName: TABLE,
        Item: {
          callerNumber: { S: number },
          createdAt: { S: new Date().toISOString() },
          best5: { SS: best5 },
          mode: { S: mode }
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
