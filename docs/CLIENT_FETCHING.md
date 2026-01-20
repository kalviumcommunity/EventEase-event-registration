# Client-Side Data Fetching with SWR in EventEase

This document explains the implementation of performant client-side data fetching in the EventEase application using SWR (Stale-While-Revalidate), a React hooks library for data fetching.

## Cache Hit vs Cache Miss

### Cache Hit

A **cache hit** occurs when the requested data is already available in the SWR cache. This happens when:

- The same data key has been fetched before and is still valid
- The data is served instantly from memory without making a network request
- Users experience immediate loading of previously fetched content

### Cache Miss

A **cache miss** occurs when the requested data is not in the cache or has expired. This triggers:

- A fresh network request to the API endpoint
- Temporary display of loading states while fetching
- Cache population with the new data for future requests

## Optimistic UI Benefits

Optimistic UI provides a **snappy user experience** by assuming successful operations and updating the interface immediately, rather than waiting for server confirmation.

### Key Benefits:

- **Instant Feedback**: Users see changes immediately, making the app feel responsive
- **Reduced Perceived Latency**: Eliminates waiting time for network round-trips
- **Better UX**: Prevents jarring loading states during common operations like adding items
- **Rollback on Error**: If the operation fails, the UI gracefully reverts to the previous state

### Implementation in EventEase:

When adding a new user, the form:

1. Immediately adds the user to the local cache with a temporary ID
2. Sends the POST request in the background
3. Revalidates the cache once the request completes
4. Rolls back changes if the request fails

## SWR Background Revalidation

SWR's background revalidation keeps EventEase data fresh without showing loading spinners constantly.

### How It Works:

- **Stale-While-Revalidate**: Serves cached (stale) data immediately, then fetches fresh data in the background
- **Automatic Revalidation**: Triggers on window focus, network reconnection, and at intervals
- **Silent Updates**: Fresh data replaces stale data without user interruption
- **Error Recovery**: Continues serving stale data if revalidation fails

### Configuration in EventEase:

- `revalidateOnFocus: true` - Refreshes data when users return to the tab
- `dedupingInterval: 5000` - Prevents duplicate requests within 5 seconds
- Manual revalidation available via debug controls

### Benefits for EventEase:

- **Always Fresh**: Event data stays current without manual refreshes
- **Offline Resilience**: Works with cached data when network is unavailable
- **Performance**: Reduces loading states while maintaining data accuracy
- **Real-time Feel**: Background updates provide near real-time data synchronization

## Usage in EventEase

### Fetching Users

```tsx
const {
  data: users,
  error,
  isLoading,
} = useSWR('/api/users', fetcher, {
  revalidateOnFocus: true,
  dedupingInterval: 5000,
});
```

### Optimistic Mutations

```tsx
const { mutate } = useSWRConfig();

const addUser = async (userData) => {
  const tempId = Date.now();
  const optimisticUser = { ...userData, id: tempId };

  mutate(
    '/api/users',
    (currentUsers) => [...currentUsers, optimisticUser],
    false,
  );

  try {
    await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    mutate('/api/users'); // Revalidate
  } catch (error) {
    mutate(
      '/api/users',
      (currentUsers) => currentUsers.filter((u) => u.id !== tempId),
      false,
    );
  }
};
```

### Cache Monitoring

```tsx
const { cache } = useSWRConfig();
console.log('Cache keys:', Array.from(cache.keys()));
```

This implementation ensures EventEase provides a fast, reliable, and user-friendly data fetching experience.
