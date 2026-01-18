import { z } from 'zod';
import { getConfig } from './config';

// Server-side environment variables schema
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with "re_"'),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_ACCOUNT: z.string().min(1, 'AZURE_STORAGE_ACCOUNT is required'),
  AZURE_STORAGE_ACCESS_KEY: z.string().min(1, 'AZURE_STORAGE_ACCESS_KEY is required'),
  AZURITE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_CONTAINER_NAME: z.string().min(1, 'AZURE_STORAGE_CONTAINER_NAME is required'),
});

// Client-side environment variables schema
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
});

// Get configuration from Azure Key Vault
const config = getConfig();

// Validate server-side environment variables from Key Vault
const serverEnv = serverEnvSchema.safeParse(config);

if (!serverEnv.success) {
  console.error('❌ Invalid server environment variables from Key Vault:', serverEnv.error.format());
  throw new Error('Invalid server environment variables from Key Vault.');
}

// Validate client-side environment variables
const clientEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: config.NEXT_PUBLIC_APP_URL,
});

if (!clientEnv.success) {
  console.error('❌ Invalid client environment variables:', clientEnv.error.format());
  throw new Error('Invalid client environment variables.');
}

// Export validated environment variables
export const env = {
  ...serverEnv.data,
  ...clientEnv.data,
} as const;

// Type definitions for TypeScript
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type Env = typeof env;
=======
import { z } from 'zod';
import { getConfig } from './config';

// Server-side environment variables schema
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with "re_"'),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_ACCOUNT: z.string().min(1, 'AZURE_STORAGE_ACCOUNT is required'),
  AZURE_STORAGE_ACCESS_KEY: z.string().min(1, 'AZURE_STORAGE_ACCESS_KEY is required'),
  AZURITE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_CONTAINER_NAME: z.string().min(1, 'AZURE_STORAGE_CONTAINER_NAME is required'),
});

// Client-side environment variables schema
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
});

// Get configuration from Azure Key Vault
const config = getConfig();

// Validate server-side environment variables from Key Vault
const serverEnv = serverEnvSchema.safeParse(config);

if (!serverEnv.success) {
  console.error('❌ Invalid server environment variables from Key Vault:', serverEnv.error.format());
  throw new Error('Invalid server environment variables from Key Vault.');
}

// Validate client-side environment variables
const clientEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: config.NEXT_PUBLIC_APP_URL,
});

if (!clientEnv.success) {
  console.error('❌ Invalid client environment variables:', clientEnv.error.format());
  throw new Error('Invalid client environment variables.');
}

// Export validated environment variables
export const env = {
  ...serverEnv.data,
  ...clientEnv.data,
} as const;
