import { getSecrets, VaultConfigurationError } from './secrets';
import { config } from 'dotenv';

// Load .env.local for local build if needed
config({ path: '.env.local' });

// Critical secrets that must be loaded at startup
const CRITICAL_SECRETS: string[] = [
  'DATABASE-URL',
  'JWT-SECRET',
  'JWT-REFRESH-SECRET',
  'RESEND-API-KEY',
  'AZURE-STORAGE-ACCOUNT',
  'AZURE-STORAGE-ACCESS-KEY',
  'AZURE-STORAGE-CONTAINER-NAME',
  'NEXT-PUBLIC-APP-URL',
];

// Cache for configuration to avoid repeated initialization
let configCache: Record<string, string> | null = null;

/**
 * Initialize configuration by fetching all critical secrets from Azure Key Vault
 * This should be called during server startup, before any routes are accessed
 */
export async function initializeConfig(): Promise<void> {
  try {
    console.log('🔐 Initializing configuration from Azure Key Vault...');
    configCache = await getSecrets(CRITICAL_SECRETS);
    console.log('✅ Configuration initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize configuration:', error);
    throw new VaultConfigurationError(
      'Failed to initialize application configuration from Key Vault',
    );
  }
}

/**
 * Get the configuration object
 * Throws an error if configuration hasn't been initialized
 */
export function getConfig(): Record<string, string> {
  if (!configCache) {
    // Fallback to process.env for local development/build
    // Map hyphenated keys to underscore env vars if needed, or assume env vars match
    // The keys in CRITICAL_SECRETS use hyphens (e.g. DATABASE-URL), but standard env vars use underscores.
    const fallbackConfig: Record<string, string> = {};
    CRITICAL_SECRETS.forEach((key) => {
      const envKey = key.replace(/-/g, '_'); // DATABASE-URL -> DATABASE_URL
      const val = process.env[envKey];
      if (val) {
        fallbackConfig[key] = val;
      }
    });

    // Use fallback if we found values, otherwise throw
    if (Object.keys(fallbackConfig).length > 0) {
      return fallbackConfig;
    }

    throw new VaultConfigurationError(
      'Configuration not initialized. Call initializeConfig() first.',
    );
  }
  return configCache;
}

/**
 * Get a specific configuration value
 * Throws an error if configuration hasn't been initialized or key doesn't exist
 */
export function getConfigValue(key: string): string {
  const config = getConfig();
  const value = config[key];
  if (!value) {
    throw new VaultConfigurationError(`Configuration key '${key}' not found`);
  }
  return value;
}

/**
 * Check if configuration has been initialized
 */
export function isConfigInitialized(): boolean {
  return configCache !== null;
}

/**
 * Clear configuration cache (useful for testing)
 */
export function clearConfigCache(): void {
  configCache = null;
}
