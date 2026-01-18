import { jest } from '@jest/globals';

// Mock Azure Key Vault
jest.mock('@azure/identity', () => ({
  DefaultAzureCredential: jest.fn().mockImplementation(() => ({})),
}));

const mockSecrets: Record<string, string> = {
  'DATABASE-URL': 'postgresql://test:test@localhost:5432/test',
  'JWT-SECRET': 'test-jwt-secret-key-32-chars-long',
  'JWT-REFRESH-SECRET': 'test-jwt-refresh-secret-key-32-chars',
  'RESEND-API-KEY': 're_test-api-key-from-resend',
  'AZURE-STORAGE-ACCOUNT': 'teststorageaccount',
  'AZURE-STORAGE-ACCESS-KEY': 'test-access-key',
  'AZURE-STORAGE-CONTAINER-NAME': 'test-container',
};

jest.mock('@azure/keyvault-secrets', () => ({
  SecretClient: jest.fn().mockImplementation(() => ({
    getSecret: jest.fn().mockImplementation((name: string) => {
      const value = mockSecrets[name];
      if (!value) {
        const error = new Error(`Secret ${name} not found`);
        return Promise.reject(error);
      }

      return Promise.resolve({ value });
    }) as any,
  })),
}));

// Mock environment variables for config
process.env.AZURE_KEY_VAULT_NAME = 'test-vault';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
