# API Response Standardization - Integration Guide

## Frontend HTTP Interceptor

### React + Axios Integration

```typescript
// lib/api/axiosConfig.ts
import axios, { AxiosError } from 'axios';

// Create Axios instance with base URL
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

/**
 * Response interceptor ensures all responses match the standardized envelope.
 * Extracts data automatically, handles errors consistently.
 */
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;

    // Verify response matches expected envelope
    if (typeof data.success !== 'boolean') {
      console.warn('[API] Response missing "success" field:', response);
    }

    // On success, return just the data for convenience
    if (data.success) {
      return data.data;
    }

    // On error, throw with standardized error object
    const error = new Error(data.message);
    (error as any).code = data.error?.code;
    (error as any).details = data.error?.details;
    (error as any).timestamp = data.timestamp;
    throw error;
  },
  (error: AxiosError<any>) => {
    // Network errors or non-JSON responses
    if (!error.response?.data?.success) {
      console.error('[API] Error response:', error.response?.data);
      
      const errorData = error.response?.data;
      const apiError = new Error(
        errorData?.message || error.message || 'Network error'
      );
      (apiError as any).code = errorData?.error?.code || 'NETWORK_ERROR';
      (apiError as any).timestamp = errorData?.timestamp || new Date().toISOString();
      
      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);
```

### React Hook for API Calls

```typescript
// hooks/useApi.ts
import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/axiosConfig';
import { ERROR_CODES } from '@/lib/errorCodes';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
}

export function useApi<T = any>(url: string) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    errorCode: null,
  });

  const execute = useCallback(
    async (method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any) => {
      setState({ data: null, loading: true, error: null, errorCode: null });

      try {
        const response = await apiClient({
          method,
          url,
          data: body,
        });

        setState({
          data: response as T,
          loading: false,
          error: null,
          errorCode: null,
        });

        return response as T;
      } catch (err: any) {
        const errorCode = err.code || 'UNKNOWN_ERROR';
        const errorMessage = err.message || 'An error occurred';

        setState({
          data: null,
          loading: false,
          error: errorMessage,
          errorCode,
        });

        throw err;
      }
    },
    [url]
  );

  return { ...state, execute };
}

/**
 * Usage Example:
 * 
 * const { data: users, loading, error, execute } = useApi<User[]>('/api/users');
 * 
 * const handleFetch = async () => {
 *   try {
 *     await execute('GET');
 *   } catch (err: any) {
 *     if (err.code === 'USER_NOT_FOUND') {
 *       toast.error('User not found');
 *     } else if (err.code === 'DATABASE_FAILURE') {
 *       toast.error('Server error, please try again');
 *     }
 *   }
 * };
 */
```

---

## Error Handling in React Components

### Global Error Toast Hook

```typescript
// hooks/useErrorToast.ts
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast'; // or your toast library
import { ERROR_CODES } from '@/lib/errorCodes';

/**
 * Maps error codes to user-friendly messages and auto-shows toast.
 */
export function useErrorToast(error: any | null) {
  const { toast } = useToast();

  useEffect(() => {
    if (!error) return;

    const errorCode = error.code || error.message;
    let message = 'An error occurred';

    // Map error codes to specific messages
    switch (errorCode) {
      case ERROR_CODES.VALIDATION_ERROR:
      case ERROR_CODES.INVALID_INPUT:
      case ERROR_CODES.MISSING_REQUIRED_FIELD:
        message = 'Please check your input and try again';
        break;

      case ERROR_CODES.USER_NOT_FOUND:
      case ERROR_CODES.EVENT_NOT_FOUND:
      case ERROR_CODES.NOT_FOUND:
        message = 'The resource you requested was not found';
        break;

      case ERROR_CODES.DUPLICATE_ENTRY:
      case ERROR_CODES.RESOURCE_ALREADY_EXISTS:
        message = 'This resource already exists';
        break;

      case ERROR_CODES.DATABASE_FAILURE:
      case ERROR_CODES.DATABASE_CONNECTION_ERROR:
      case ERROR_CODES.INTERNAL_ERROR:
        message = 'Server error. Please try again later';
        break;

      case ERROR_CODES.UNAUTHORIZED:
        message = 'You are not authenticated. Please log in';
        break;

      case ERROR_CODES.FORBIDDEN:
        message = 'You do not have permission to perform this action';
        break;

      default:
        message = error.message || 'An error occurred';
    }

    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }, [error, toast]);
}

/**
 * Usage:
 * 
 * const { error } = useApi('/api/users');
 * useErrorToast(error);
 */
```

---

## Testing API Responses

### Jest + Testing Library Example

```typescript
// __tests__/api/users.test.ts
import { GET, POST } from '@/app/api/users/route';

/**
 * Mock request object that matches Next.js Request interface.
 */
function createMockRequest(
  method: string = 'GET',
  body?: any,
  searchParams?: Record<string, string>
): Request {
  const url = new URL('http://localhost:3000/api/users');
  
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return new Request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('GET /api/users', () => {
  it('should return success response with users', async () => {
    const req = createMockRequest('GET', undefined, { page: '1', limit: '10' });
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBeDefined();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.timestamp).toBeDefined();
  });

  it('should return validation error for negative page', async () => {
    const req = createMockRequest('GET', undefined, { page: '-1', limit: '10' });
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_INPUT');
    expect(data.timestamp).toBeDefined();
  });
});

describe('POST /api/users', () => {
  it('should return 201 Created on successful user creation', async () => {
    const req = createMockRequest('POST', {
      email: 'test@example.com',
      name: 'Test User',
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toContain('created');
    expect(data.data.id).toBeDefined();
  });

  it('should return 400 for missing required fields', async () => {
    const req = createMockRequest('POST', { email: 'test@example.com' }); // missing name
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('MISSING_REQUIRED_FIELD');
  });

  it('should return 409 Conflict for duplicate email', async () => {
    // Assuming prisma.user.create throws P2002 error
    const req = createMockRequest('POST', {
      email: 'existing@example.com', // Already exists
      name: 'Test User',
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('DUPLICATE_ENTRY');
  });
});
```

### Integration Test Example

```typescript
// __tests__/integration/api-responses.test.ts
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

describe('API Response Standardization', () => {
  it('all success responses should have required fields', async () => {
    const response = await fetch(`${BASE_URL}/api/users?page=1&limit=5`);
    const data = (await response.json()) as any;

    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('timestamp');
    expect(typeof data.success).toBe('boolean');
    expect(typeof data.message).toBe('string');
    expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);

    if (data.success) {
      expect(data).toHaveProperty('data');
    }
  });

  it('all error responses should have required fields', async () => {
    const response = await fetch(`${BASE_URL}/api/users?page=-1`);
    const data = (await response.json()) as any;

    expect(data).toHaveProperty('success');
    expect(data.success).toBe(false);
    expect(data).toHaveProperty('error');
    expect(data.error).toHaveProperty('code');
    expect(data).toHaveProperty('timestamp');
  });

  it('HTTP status codes should match error codes', async () => {
    const response = await fetch(`${BASE_URL}/api/users/999999`);
    expect(response.status).toBe(404);

    const data = (await response.json()) as any;
    expect(data.error.code).toBe('NOT_FOUND');
  });
});
```

---

## Monitoring & Observability

### Error Code Metrics

```typescript
// lib/analytics/errorTracking.ts
import { ERROR_CODES } from '@/lib/errorCodes';

interface ErrorMetric {
  code: string;
  count: number;
  percentage: number;
  lastOccurred: string;
}

/**
 * Example: Send error metrics to analytics service (Sentry, LogRocket, etc.)
 */
export function trackApiError(code: string, details?: any) {
  // Send to error tracking service
  if (window.sentry) {
    window.sentry.captureException(new Error(code), {
      tags: { errorCode: code },
      extra: details,
    });
  }

  // Track to analytics
  if (window.gtag) {
    window.gtag('event', 'api_error', {
      error_code: code,
      error_type: categorizeErrorCode(code),
    });
  }
}

/**
 * Categorize error codes for monitoring/alerting.
 */
function categorizeErrorCode(code: string): 'validation' | 'client' | 'server' | 'unknown' {
  if ([
    ERROR_CODES.VALIDATION_ERROR,
    ERROR_CODES.INVALID_INPUT,
    ERROR_CODES.MISSING_REQUIRED_FIELD,
  ].includes(code)) {
    return 'validation';
  }

  if ([
    ERROR_CODES.NOT_FOUND,
    ERROR_CODES.USER_NOT_FOUND,
    ERROR_CODES.EVENT_NOT_FOUND,
  ].includes(code)) {
    return 'client';
  }

  if ([
    ERROR_CODES.DATABASE_FAILURE,
    ERROR_CODES.INTERNAL_ERROR,
    ERROR_CODES.DATABASE_CONNECTION_ERROR,
  ].includes(code)) {
    return 'server';
  }

  return 'unknown';
}
```

### Server-Side Error Logging

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

/**
 * Log API errors with proper context.
 */
export function logApiError(
  endpoint: string,
  method: string,
  code: string,
  error: any,
  details?: any
) {
  logger.error({
    endpoint,
    method,
    errorCode: code,
    message: error.message,
    stack: error.stack,
    details,
    timestamp: new Date().toISOString(),
  });
}

// Usage in API route:
// logApiError('/api/users', 'GET', ERROR_CODES.DATABASE_FAILURE, error, { userId: 123 });
```

---

## Debugging Tips

### 1. Check Response Envelope
```typescript
// Always verify the response matches expected structure
console.log('Response structure:', {
  hasSuccess: 'success' in response,
  hasMessage: 'message' in response,
  hasTimestamp: 'timestamp' in response,
  hasData: 'data' in response || 'error' in response,
});
```

### 2. Correlate Timestamps
```typescript
// Use timestamp to correlate client errors with server logs
const clientTimestamp = response.timestamp;
// Search server logs: grep "2026-01-15T10:30:45"
```

### 3. Test Error Paths
```typescript
// Always test error scenarios during development
const testCases = [
  { input: {}, expectedError: 'MISSING_REQUIRED_FIELD' },
  { input: { id: 'invalid' }, expectedError: 'INVALID_INPUT' },
  { input: { id: 99999 }, expectedError: 'NOT_FOUND' },
];
```

### 4. Verify HTTP Status Codes
```typescript
// Status code should match error code
const statusMap = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  DUPLICATE_ENTRY: 409,
  DATABASE_FAILURE: 500,
};
```

---

## Production Checklist

- [ ] All API endpoints return standardized response envelope
- [ ] Error codes are consistent across all routes
- [ ] HTTP status codes follow REST conventions
- [ ] Frontend error interceptor is configured
- [ ] Error tracking (Sentry, etc.) is set up
- [ ] Error metrics are being collected
- [ ] Server-side logging is enabled
- [ ] Timestamps are in UTC/ISO format
- [ ] Rate limiting is in place
- [ ] API documentation matches actual response format
- [ ] Team is trained on error code meanings
- [ ] Monitoring alerts are configured for specific error codes
