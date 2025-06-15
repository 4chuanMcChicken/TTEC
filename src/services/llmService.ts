import OpenAI from 'openai';
import { Logger } from '@aws-lambda-powertools/logger';
import { VanityCandidate, LLMConfig } from '../types';

const logger = new Logger({ serviceName: 'LLMService' });

export class LLMService {
  private openai: OpenAI;
  private model: string;

  constructor(config: LLMConfig) {
    this.openai = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model;
  }

  /**
   * Use LLM to rank vanity number candidates based on memorability and business value
   */
  public async rankCandidates(candidates: VanityCandidate[]): Promise<VanityCandidate[]> {
    try {
      const prompt = `
        Rate these vanity phone number candidates from 1-100 based on:
        - Memorability (easy to remember)
        - Business value (professional, marketable)
        - Word recognition (contains real words)
        
        Numbers to rate:
        ${candidates.map(c => c.word).join('\n')}
        
        Respond only with the JSON array of scores, no markdown, no backticks, no extra text., like:
        [{"word": "CALLNOW", "score": 95}, ...]
      `;
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are a marketing expert specializing in memorable business phone numbers.' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
      });
      const content = response.choices[0]?.message?.content ?? '';
      // Parse LLM response and update scores
      const parsed = JSON.parse(content);
      console.log(content)

      // 2) normalize into an array
      const scoresArray: { word: string; score: number }[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray((parsed as any).scores)
          ? (parsed as any).scores
          : (() => { throw new Error('Invalid LLM response format'); })();
      
      // 3) now map & sort using scoresArray
      const scoredCandidates = candidates.map(candidate => {
        const m = scoresArray.find(s => s.word === candidate.word);
        return {
          ...candidate,
          score: m ? m.score : candidate.score
        };
      });
      return scoredCandidates.sort((a, b) => b.score - a.score);

    } catch (error) {

      logger.error('Error ranking candidates with LLM', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        candidates: candidates.length
      });
      
      // Fallback to original scores if LLM fails
      return candidates;
    }
  }
} 