import { formatEventDate } from '@/lib/utils';

describe('formatEventDate', () => {
  it('should format a Date object correctly', () => {
    const date = new Date('2023-10-15');
    expect(formatEventDate(date)).toBe('Oct 15, 2023');
  });

  it('should format a date string correctly', () => {
    const dateString = '2023-10-15';
    expect(formatEventDate(dateString)).toBe('Oct 15, 2023');
  });

  it('should handle different date formats', () => {
    const dateString = '2023-01-01T12:00:00Z';
    expect(formatEventDate(dateString)).toBe('Jan 1, 2023');
  });

  it('should format single digit months and days correctly', () => {
    const date = new Date('2023-01-05');
    expect(formatEventDate(date)).toBe('Jan 5, 2023');
  });
});
