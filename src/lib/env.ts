import { z } from 'zod';
import { getConfig } from './config';

// Helper to detect test environment
const isTest = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

// Server-side environment variables schema
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  RESEND_API_KEY: z
    .string()
    .startsWith('re_', 'RESEND_API_KEY must start with "re_"'),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_ACCOUNT: z.string().min(1, 'AZURE_STORAGE_ACCOUNT is required'),
  AZURE_STORAGE_ACCESS_KEY: z
    .string()
    .min(1, 'AZURE_STORAGE_ACCESS_KEY is required'),
  AZURITE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_CONTAINER_NAME: z
    .string()
    .min(1, 'AZURE_STORAGE_CONTAINER_NAME is required'),
});

// Client-side environment variables schema
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL'),
});

// Normalize keys: replace hyphens with underscores
function normalizeKeys(obj: Record<string, string | undefined>): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const key of Object.keys(obj)) {
    const normalized = key.replace(/-/g, '_');
    out[normalized] = obj[key];
  }
  return out;
}

// Build a config object: try Key Vault first, fallback to process.env
let rawConfig: Record<string, string | undefined> = {};

try {
  const vaultConfig = getConfig();
  rawConfig = normalizeKeys(vaultConfig as Record<string, string | undefined>);
} catch (err) {
  // If config isn't initialized, fallback to process.env
  // Don't throw here so tests that don't call initializeConfig() can proceed
  rawConfig = normalizeKeys(process.env as unknown as Record<string, string | undefined>);
}

// For tests, provide safe defaults for any missing critical values
if (isTest) {
  rawConfig = {
    DATABASE_URL: rawConfig.DATABASE_URL || process.env.DATABASE_URL || 'postgresql://localhost:5432/testdb',
    JWT_SECRET: rawConfig.JWT_SECRET || 'A'.repeat(32),
    JWT_REFRESH_SECRET: rawConfig.JWT_REFRESH_SECRET || 'B'.repeat(32),
    RESEND_API_KEY: rawConfig.RESEND_API_KEY || 're_test_api_key',
    AZURE_STORAGE_ACCOUNT: rawConfig.AZURE_STORAGE_ACCOUNT || 'teststorageaccount',
    AZURE_STORAGE_ACCESS_KEY: rawConfig.AZURE_STORAGE_ACCESS_KEY || 'test-access-key',
    AZURE_STORAGE_CONTAINER_NAME: rawConfig.AZURE_STORAGE_CONTAINER_NAME || 'test-container',
    AZURE_STORAGE_CONNECTION_STRING: rawConfig.AZURE_STORAGE_CONNECTION_STRING,
    AZURITE_CONNECTION_STRING: rawConfig.AZURITE_CONNECTION_STRING,
    NEXT_PUBLIC_APP_URL: rawConfig.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  };
}

// Validate server-side environment variables (throw in non-test environments)
const serverEnv = serverEnvSchema.safeParse({
  DATABASE_URL: rawConfig.DATABASE_URL,
  JWT_SECRET: rawConfig.JWT_SECRET,
  JWT_REFRESH_SECRET: rawConfig.JWT_REFRESH_SECRET,
  RESEND_API_KEY: rawConfig.RESEND_API_KEY,
  AZURE_STORAGE_CONNECTION_STRING: rawConfig.AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_ACCOUNT: rawConfig.AZURE_STORAGE_ACCOUNT,
  AZURE_STORAGE_ACCESS_KEY: rawConfig.AZURE_STORAGE_ACCESS_KEY,
  AZURITE_CONNECTION_STRING: rawConfig.AZURITE_CONNECTION_STRING,
  AZURE_STORAGE_CONTAINER_NAME: rawConfig.AZURE_STORAGE_CONTAINER_NAME,
});

if (!serverEnv.success) {
  if (isTest) {
    // In tests, log and continue with best-effort defaults already set above
    // This allows tests to import env without requiring initializeConfig()
    // but still surfaces validation details to the logs.
    // eslint-disable-next-line no-console
    console.warn('⚠️ Server env validation failed (test mode):', serverEnv.error.format());
  } else {
    // Production / CI should fail fast
    // eslint-disable-next-line no-console
    console.error('❌ Invalid server environment variables from configuration:', serverEnv.error.format());
    throw new Error('Invalid server environment variables from configuration.');
  }
}

// Validate client-side environment variables
const clientEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: rawConfig.NEXT_PUBLIC_APP_URL,
});

if (!clientEnv.success) {
  if (isTest) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ Client env validation failed (test mode):', clientEnv.error.format());
  } else {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid client environment variables:', clientEnv.error.format());
    throw new Error('Invalid client environment variables.');
  }
}

// Export validated environment variables
export const env = {
  ...(serverEnv.success ? serverEnv.data : {}),
  ...(clientEnv.success ? clientEnv.data : {}),
  DATABASE_URL: (serverEnv.success ? serverEnv.data.DATABASE_URL : rawConfig.DATABASE_URL) as string,
  JWT_SECRET: (serverEnv.success ? serverEnv.data.JWT_SECRET : rawConfig.JWT_SECRET) as string,
  JWT_REFRESH_SECRET: (serverEnv.success ? serverEnv.data.JWT_REFRESH_SECRET : rawConfig.JWT_REFRESH_SECRET) as string,
  RESEND_API_KEY: (serverEnv.success ? serverEnv.data.RESEND_API_KEY : rawConfig.RESEND_API_KEY) as string,
  AZURE_STORAGE_CONNECTION_STRING: (serverEnv.success ? serverEnv.data.AZURE_STORAGE_CONNECTION_STRING : rawConfig.AZURE_STORAGE_CONNECTION_STRING) as string | undefined,
  AZURE_STORAGE_ACCOUNT: (serverEnv.success ? serverEnv.data.AZURE_STORAGE_ACCOUNT : rawConfig.AZURE_STORAGE_ACCOUNT) as string,
  AZURE_STORAGE_ACCESS_KEY: (serverEnv.success ? serverEnv.data.AZURE_STORAGE_ACCESS_KEY : rawConfig.AZURE_STORAGE_ACCESS_KEY) as string,
  AZURITE_CONNECTION_STRING: (serverEnv.success ? serverEnv.data.AZURITE_CONNECTION_STRING : rawConfig.AZURITE_CONNECTION_STRING) as string | undefined,
  AZURE_STORAGE_CONTAINER_NAME: (serverEnv.success ? serverEnv.data.AZURE_STORAGE_CONTAINER_NAME : rawConfig.AZURE_STORAGE_CONTAINER_NAME) as string,
  ...(clientEnv.success ? clientEnv.data : { NEXT_PUBLIC_APP_URL: rawConfig.NEXT_PUBLIC_APP_URL }),
} as const;

// Type definitions for TypeScript
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type Env = typeof env;