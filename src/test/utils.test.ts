import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isDeadlinePast } from '@/lib/utils';

describe('isDeadlinePast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15'));
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

  it('returns true for a date in the past', () => {
    expect(isDeadlinePast('10 December 2025 at 09:00 CET')).toBe(true);
  });

  it('returns false for a date in the future', () => {
    expect(isDeadlinePast('10 June 2026 at 09:00 CET')).toBe(false);
  });

  it('handles a date string without time portion', () => {
    expect(isDeadlinePast('1 January 2025')).toBe(true);
    expect(isDeadlinePast('1 January 2027')).toBe(false);
  });

  it('returns false for an unparseable string', () => {
    expect(isDeadlinePast('not a date')).toBe(false);
  });
});
