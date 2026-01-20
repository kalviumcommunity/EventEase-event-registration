import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

// Custom error for vault configuration issues
export class VaultConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VaultConfigurationError';
  }
}

// Cache for secrets to avoid redundant network calls
const secretCache = new Map<string, string>();
let secretClient: SecretClient | null = null;

// Initialize the SecretClient with Azure Key Vault URL
function initializeSecretClient(): SecretClient {
  if (!secretClient) {
    const keyVaultName =
      process.env.AZURE_KEY_VAULT_NAME || 'eventease-keyvault';
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;

    const credential = new DefaultAzureCredential();
    secretClient = new SecretClient(keyVaultUrl, credential);
  }
  return secretClient;
}

// Exponential backoff utility for retries
async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Get a secret from Azure Key Vault with caching
export async function getSecret(name: string): Promise<string> {
  // Check cache first
  if (secretCache.has(name)) {
    return secretCache.get(name)!;
  }

  try {
    const client = initializeSecretClient();

    const secret = await withExponentialBackoff(async () => {
      const result = await client.getSecret(name);
      return result;
    });

    if (!secret.value) {
      throw new VaultConfigurationError(`Secret '${name}' has no value`);
    }

    // Cache the secret
    secretCache.set(name, secret.value);
    return secret.value;
  } catch (error) {
    if (error instanceof VaultConfigurationError) {
      throw error;
    }
    throw new VaultConfigurationError(
      `Failed to retrieve secret '${name}': ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// Clear cache (useful for testing or forced refresh)
export function clearSecretCache(): void {
  secretCache.clear();
}

// Get multiple secrets in parallel
export async function getSecrets(
  names: string[],
): Promise<Record<string, string>> {
  const promises = names.map(async (name) => {
    const value = await getSecret(name);
    return { name, value };
  });

  const results = await Promise.all(promises);
  return results.reduce(
    (acc, { name, value }) => {
      acc[name] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
}
