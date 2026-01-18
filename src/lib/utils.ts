/**
 * Formats an event date to a readable string.
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted date string in 'MMM DD, YYYY' format
 */
export function formatEventDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
