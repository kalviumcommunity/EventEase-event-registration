import { initializeConfig } from './src/lib/config';

export async function register() {
  // Initialize configuration from Azure Key Vault during server startup
  try {
    await initializeConfig();
    console.log('✅ Server configuration initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize server configuration:', error);
    // In production, you might want to exit the process here
    // process.exit(1);
  }
}
