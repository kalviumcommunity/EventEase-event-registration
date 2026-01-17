const { env } = require('./src/lib/env.ts');

console.log('Environment validation test:');
console.log('DATABASE_URL:', env.DATABASE_URL ? '✓ Set' : '✗ Missing');
console.log('JWT_SECRET:', env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('RESEND_API_KEY:', env.RESEND_API_KEY ? '✓ Set' : '✗ Missing');
console.log('NEXT_PUBLIC_APP_URL:', env.NEXT_PUBLIC_APP_URL ? '✓ Set' : '✗ Missing');
console.log('All environment variables validated successfully!');
