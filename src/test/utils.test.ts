import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isDeadlinePast, formatDeadline } from '@/lib/utils';

describe('isDeadlinePast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for undefined', () => {
    expect(isDeadlinePast(undefined)).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isDeadlinePast('')).toBe(false);
  });

  it('returns true for a past ISO 8601 deadline', () => {
    expect(isDeadlinePast('2025-12-10T09:00:00+01:00')).toBe(true);
  });

  it('returns false for a future ISO 8601 deadline', () => {
    expect(isDeadlinePast('2026-06-10T09:00:00+02:00')).toBe(false);
  });

  it('returns true for a past date without time', () => {
    expect(isDeadlinePast('2025-01-01T00:00:00+01:00')).toBe(true);
  });

  it('returns false for a future date without time', () => {
    expect(isDeadlinePast('2027-01-01T00:00:00+01:00')).toBe(false);
  });

  it('returns false for an unparseable string', () => {
    expect(isDeadlinePast('not a date')).toBe(false);
  });
});

describe('formatDeadline', () => {
  it('formats a CET (+01:00) deadline', () => {
    expect(formatDeadline('2025-12-10T09:00:00+01:00')).toBe('10 December 2025 at 09:00 CET');
  });

  it('formats a CEST (+02:00) deadline', () => {
    expect(formatDeadline('2026-05-26T23:59:00+02:00')).toBe('26 May 2026 at 23:59 CEST');
  });

  it('formats a single-digit day without zero padding', () => {
    expect(formatDeadline('2026-02-04T23:59:00+01:00')).toBe('4 February 2026 at 23:59 CET');
  });

  it('returns the raw string when not ISO 8601 format', () => {
    expect(formatDeadline('not a date')).toBe('not a date');
  });
});
