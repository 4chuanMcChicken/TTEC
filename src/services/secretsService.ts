import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'SecretsService' });

export class SecretsService {
  private client: SecretsManagerClient;

  constructor() {
    this.client = new SecretsManagerClient({});
  }

  /**
   * Retrieve a secret value from AWS Secrets Manager
   */
  public async getSecret(secretId: string): Promise<string> {
    try {
      const command = new GetSecretValueCommand({
        SecretId: secretId,
      });

      const response = await this.client.send(command);
      return response.SecretString || '';

    } catch (error) {
      logger.error('Failed to retrieve secret', {
        error: error instanceof Error ? error.message : 'Unknown error',
        secretId
      });
      throw error;
    }
  }
} 