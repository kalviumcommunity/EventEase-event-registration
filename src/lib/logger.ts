import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';

// Create AsyncLocalStorage to store request context
const asyncLocalStorage = new AsyncLocalStorage<{ requestId?: string }>();

// Define logger configuration
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  // Mixin to automatically add requestId to all logs
  mixin() {
    const store = asyncLocalStorage.getStore();
    return store?.requestId ? { requestId: store.requestId } : {};
  },
};

// Use pretty printing in development, JSON in production
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = isDevelopment
  ? pino({
      ...loggerConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    })
  : pino(loggerConfig);

// Utility function to run code within a request context
export const withRequestId = <T>(requestId: string, fn: () => T): T => {
  return asyncLocalStorage.run({ requestId }, fn);
};

// Export the logger
export default logger;
