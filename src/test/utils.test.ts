import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isDeadlinePast, formatDeadline, isSolutionUnlocked, resolveDiscussionUrl, escapeHtmlAttr } from '@/lib/utils';

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

describe('isSolutionUnlocked', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true when deadline is undefined (no deadline = always unlocked)', () => {
    expect(isSolutionUnlocked(undefined)).toBe(true);
  });

  it('returns true when deadline has passed', () => {
    expect(isSolutionUnlocked('2025-12-10T09:00:00+01:00')).toBe(true);
  });

  it('returns false when deadline is in the future', () => {
    expect(isSolutionUnlocked('2026-06-10T09:00:00+02:00')).toBe(false);
  });

  it('returns false for an unparseable deadline string', () => {
    expect(isSolutionUnlocked('not a date')).toBe(false);
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

  it('formats a deadline with fractional seconds (milliseconds)', () => {
    expect(formatDeadline('2026-07-01T23:59:59.000+01:00')).toBe('1 July 2026 at 23:59 CET');
  });

  it('formats a UTC (Z suffix) deadline', () => {
    expect(formatDeadline('2026-07-01T23:59:59Z')).toBe('1 July 2026 at 23:59 UTC');
  });

  it('formats a UTC deadline with fractional seconds and Z suffix', () => {
    expect(formatDeadline('2026-07-01T23:59:59.500Z')).toBe('1 July 2026 at 23:59 UTC');
  });

  it('formats an arbitrary offset as UTC±HH:MM', () => {
    expect(formatDeadline('2026-07-01T23:59:59+05:30')).toBe('1 July 2026 at 23:59 UTC+05:30');
  });
});

describe('escapeHtmlAttr', () => {
  it('passes through a plain string unchanged', () => {
    expect(escapeHtmlAttr('hello world')).toBe('hello world');
  });

  it('escapes ampersands', () => {
    expect(escapeHtmlAttr('a&b')).toBe('a&amp;b');
  });

  it('escapes double quotes', () => {
    expect(escapeHtmlAttr('say "hi"')).toBe('say &quot;hi&quot;');
  });

  it('escapes less-than', () => {
    expect(escapeHtmlAttr('a<b')).toBe('a&lt;b');
  });

  it('escapes greater-than', () => {
    expect(escapeHtmlAttr('a>b')).toBe('a&gt;b');
  });

  it('escapes a URL with query params containing ampersands', () => {
    const url = 'https://example.com/?foo=1&bar=2';
    expect(escapeHtmlAttr(url)).toBe('https://example.com/?foo=1&amp;bar=2');
  });

  it('escapes all unsafe characters in a single string', () => {
    expect(escapeHtmlAttr('<script src="x&y">'))
      .toBe('&lt;script src=&quot;x&amp;y&quot;&gt;');
  });
});

describe('resolveDiscussionUrl', () => {
  const COMMUNITY = 'https://community.offon.dev';

  it('returns communityUrl when rawUrl is undefined', () => {
    expect(resolveDiscussionUrl(undefined, COMMUNITY)).toBe(COMMUNITY);
  });

  it('returns communityUrl when rawUrl is null', () => {
    expect(resolveDiscussionUrl(null, COMMUNITY)).toBe(COMMUNITY);
  });

  it('returns communityUrl when rawUrl is an empty string', () => {
    expect(resolveDiscussionUrl('', COMMUNITY)).toBe(COMMUNITY);
  });

  it('passes through an absolute URL unchanged', () => {
    const url = 'https://community.offon.dev/t/some-topic/123';
    expect(resolveDiscussionUrl(url, COMMUNITY)).toBe(url);
  });

  it('prepends communityUrl to a relative path', () => {
    expect(resolveDiscussionUrl('/t/some-topic/123', COMMUNITY)).toBe(
      'https://community.offon.dev/t/some-topic/123'
    );
  });

  it('treats a path without a leading slash as relative and prepends communityUrl', () => {
    expect(resolveDiscussionUrl('t/some-topic/123', COMMUNITY)).toBe(
      'https://community.offon.devt/some-topic/123'
    );
  });
});
