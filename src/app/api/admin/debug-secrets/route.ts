import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { VaultConfigurationError } from '@/lib/secrets';

export async function GET(_request: NextRequest) {
  try {
    // Get configuration to verify secrets are accessible
    const config = getConfig();

    // Log only the keys (not values) to server console for verification
    const secretKeys = Object.keys(config).filter(
      (key) => !key.includes('PUBLIC') && !key.includes('NEXT_PUBLIC'),
    );

    console.log('🔐 Secrets verification - Available keys:', secretKeys);

    // Return success response with key count (not the actual secrets)
    return NextResponse.json({
      status: 'success',
      message: 'Secrets retrieved successfully',
      availableSecrets: secretKeys.length,
      keys: secretKeys,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Secrets verification failed:', error);

    if (error instanceof VaultConfigurationError) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Vault configuration error',
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve secrets',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
