export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}
