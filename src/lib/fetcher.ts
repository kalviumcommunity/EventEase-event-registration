import { UserResponse } from '@/lib/schemas/userSchema';

/**
 * Interface for User data as returned by the API
 */
export interface User extends UserResponse {}

/**
 * Interface for fetcher errors
 */
export interface FetcherError {
  message: string;
  status?: number;
}

/**
 * Robust fetcher function for SWR
 * Handles non-OK responses and parses JSON
 * @param url - The URL to fetch
 * @returns Parsed JSON data or throws an error
 */
export const fetcher = async (url: string): Promise<User[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    const error: FetcherError = {
      message: `Failed to fetch: ${response.statusText}`,
      status: response.status,
    };
    throw error;
  }

  try {
    const data = await response.json();
    return data;
  } catch (_error) {
    throw new Error('Failed to parse JSON response');
  }
};
