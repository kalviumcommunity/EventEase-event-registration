export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  AZURE_STORAGE_ACCOUNT: process.env.AZURE_STORAGE_ACCOUNT,
  AZURE_STORAGE_ACCESS_KEY: process.env.AZURE_STORAGE_ACCESS_KEY,
  AZURITE_CONNECTION_STRING: process.env.AZURITE_CONNECTION_STRING,
  AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME,
};

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}
