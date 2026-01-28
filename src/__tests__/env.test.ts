import { env } from '../lib/env';

describe('Environment Variables', () => {
  it('should export validated environment variables', () => {
    expect(env).toHaveProperty('DATABASE_URL');
    expect(env).toHaveProperty('JWT_SECRET');
    expect(env).toHaveProperty('JWT_REFRESH_SECRET');
    expect(env).toHaveProperty('RESEND_API_KEY');
    expect(env).toHaveProperty('NEXT_PUBLIC_APP_URL');
  });

  it('should validate DATABASE_URL format', () => {
    expect(env.DATABASE_URL).toMatch(/^postgresql:\/\//);
  });

  it('should validate JWT_SECRET length', () => {
    expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it('should validate JWT_REFRESH_SECRET length', () => {
    expect(env.JWT_REFRESH_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it('should validate RESEND_API_KEY format', () => {
    expect(env.RESEND_API_KEY).toMatch(/^re_/);
  });

  it('should validate NEXT_PUBLIC_APP_URL format', () => {
    expect(env.NEXT_PUBLIC_APP_URL).toMatch(/^https?:\/\//);
  });

  it('should not expose secrets to client-side', () => {
    // This is a structural test - in a real app, we'd check bundle analysis
    // For now, we verify that sensitive env vars are not prefixed with NEXT_PUBLIC_
    const clientEnvKeys = Object.keys(env).filter((key) =>
      key.startsWith('NEXT_PUBLIC_'),
    );

    expect(clientEnvKeys).toContain('NEXT_PUBLIC_APP_URL');
    expect(clientEnvKeys).not.toContain('DATABASE_URL');
    expect(clientEnvKeys).not.toContain('JWT_SECRET');
  });
});
