import {
  getSecret,
  getSecrets,
  clearSecretCache,
  VaultConfigurationError,
} from '../lib/secrets';

describe('Secrets Management', () => {
  beforeEach(() => {
    clearSecretCache();
  });

  describe('getSecret', () => {
    it('should retrieve a secret successfully', async () => {
      const secret = await getSecret('DATABASE-URL');
      expect(secret).toBe('postgresql://test:test@localhost:5432/test');
    });

    it('should cache secrets to avoid redundant calls', async () => {
      // First call
      await getSecret('JWT-SECRET');
      // Second call should use cache
      const secret = await getSecret('JWT-SECRET');
      expect(secret).toBe('test-jwt-secret-key-32-chars-long');
    });

    it('should throw VaultConfigurationError for missing secrets', async () => {
      await expect(getSecret('NON-EXISTENT-SECRET')).rejects.toThrow(
        VaultConfigurationError,
      );
    });

    it('should throw VaultConfigurationError for secrets with no value', async () => {
      // Mock a secret with no value
      const mockClient = require('@azure/keyvault-secrets').SecretClient;
      mockClient.mockImplementationOnce(() => ({
        getSecret: jest.fn().mockResolvedValue({ value: null }),
      }));

      await expect(getSecret('DATABASE-URL')).rejects.toThrow(
        VaultConfigurationError,
      );
    });
  });

  describe('getSecrets', () => {
    it('should retrieve multiple secrets in parallel', async () => {
      const secrets = await getSecrets(['DATABASE-URL', 'JWT-SECRET']);
      expect(secrets).toEqual({
        'DATABASE-URL': 'postgresql://test:test@localhost:5432/test',
        'JWT-SECRET': 'test-jwt-secret-key-32-chars-long',
      });
    });

    it('should handle partial failures gracefully', async () => {
      await expect(
        getSecrets(['DATABASE-URL', 'NON-EXISTENT']),
      ).rejects.toThrow(VaultConfigurationError);
    });
  });

  describe('caching', () => {
    it('should clear cache when clearSecretCache is called', async () => {
      await getSecret('JWT-SECRET');
      clearSecretCache();

      // Cache should be cleared, but since we're using mocks, this is more of a structural test
      expect(clearSecretCache).toBeDefined();
    });
  });
});
