import { type JSX } from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import {
  ConsentProvider,
  useConsent,
  __resetGtagInjectionForTests,
} from '@/hooks/useConsent';
import { ConsentBanner } from '@/components/ConsentBanner';
import { CONSENT_STORAGE_KEY, CONSENT_EXPIRY_MS, GA_MEASUREMENT_ID } from '@/data/constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ls = window.localStorage;

function renderWithProviders(ui: React.ReactElement): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <ConsentProvider>{ui}</ConsentProvider>
    </MemoryRouter>
  );
}

function ConsentStatus(): JSX.Element {
  const { consent, grant, deny, reset } = useConsent();
  return (
    <div>
      <span data-testid="consent-value">{consent ?? 'null'}</span>
      <button onClick={grant}>grant</button>
      <button onClick={deny}>deny</button>
      <button onClick={reset}>reset</button>
    </div>
  );
}

function dataLayerEntries(): unknown[][] {
  return (window.dataLayer ?? []) as unknown[][];
}

function entryStartsWith(...prefix: unknown[]): (entry: unknown[]) => boolean {
  return (entry) => prefix.every((value, index) => entry[index] === value);
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  ls.clear();
  document.getElementById('gtag-script')?.remove();
  __resetGtagInjectionForTests();
  // Mirror the inline bootstrap in root.tsx so unit tests start in the same
  // state as a fresh page load: dataLayer with the consent default and
  // window.gtag as the dataLayer push shim.
  window.dataLayer = [];
  window.gtag = ((...args: unknown[]) => {
    (window.dataLayer as unknown[]).push(args);
  }) as typeof window.gtag;
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  // Clear any cookies left over from a prior test.
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0]?.trim();
    if (!name) return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Pre-Accept guarantee: zero gtag activity beyond the bootstrap
// ---------------------------------------------------------------------------

describe('useConsent - before Accept', () => {
  it('does not append a gtag script tag while consent is undecided', () => {
    renderWithProviders(<ConsentStatus />);
    expect(document.getElementById('gtag-script')).toBeNull();
    expect(document.querySelectorAll('script[src*="googletagmanager"]').length).toBe(0);
  });

  it('does not push anything beyond the bootstrap consent default to dataLayer', () => {
    renderWithProviders(<ConsentStatus />);
    const entries = dataLayerEntries();
    // Exactly one entry: the consent default. Anything else means the hook or
    // a sibling effect is pushing before consent.
    expect(entries.length).toBe(1);
    expect(entries[0][0]).toBe('consent');
    expect(entries[0][1]).toBe('default');
  });
});

// ---------------------------------------------------------------------------
// Initial state from localStorage
// ---------------------------------------------------------------------------

describe('useConsent - initial state', () => {
  it('returns null when nothing is stored', () => {
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('null');
  });

  it('returns stored "granted" on mount', () => {
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('granted');
  });

  it('returns stored "denied" on mount', () => {
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: 'denied', timestamp: Date.now() }));
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('denied');
  });

  it('returns null when stored consent has expired', () => {
    ls.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ value: 'granted', timestamp: Date.now() - CONSENT_EXPIRY_MS - 1 })
    );
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('null');
    expect(ls.getItem(CONSENT_STORAGE_KEY)).toBeNull();
  });

  it('returns null when stored JSON is malformed', () => {
    ls.setItem(CONSENT_STORAGE_KEY, 'not-valid-json');
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('null');
  });
});

// ---------------------------------------------------------------------------
// Grant transition
// ---------------------------------------------------------------------------

describe('useConsent - grant', () => {
  it('appends the gtag script tag exactly once on Accept', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    const tags = document.querySelectorAll('script#gtag-script');
    expect(tags.length).toBe(1);
    const tag = tags[0] as HTMLScriptElement;
    expect(tag.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
    expect(tag.async).toBe(true);
  });

  it('queues consent update, js, and config in dataLayer in that order before appending the script', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    const entries = dataLayerEntries();
    const updateIdx = entries.findIndex(entryStartsWith('consent', 'update'));
    const jsIdx = entries.findIndex(entryStartsWith('js'));
    const configIdx = entries.findIndex(entryStartsWith('config'));
    expect(updateIdx).toBeGreaterThan(-1);
    expect(jsIdx).toBeGreaterThan(updateIdx);
    expect(configIdx).toBeGreaterThan(jsIdx);
    expect(entries[updateIdx][2]).toEqual({ analytics_storage: 'granted' });
  });

  it('passes cookie_flags, cookie_expires (180 days), and send_page_view:false in the config call', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    const config = dataLayerEntries().find(entryStartsWith('config'));
    expect(config).toBeDefined();
    expect(config?.[1]).toBe(GA_MEASUREMENT_ID);
    expect(config?.[2]).toMatchObject({
      cookie_flags: 'SameSite=Lax;Secure',
      cookie_expires: 15552000,
      send_page_view: false,
    });
  });

  it('does not set cookie_domain or linker (cross-domain is GA-admin-configured)', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    const config = dataLayerEntries().find(entryStartsWith('config'));
    const settings = config?.[2] as Record<string, unknown>;
    expect(settings).not.toHaveProperty('cookie_domain');
    expect(settings).not.toHaveProperty('linker');
  });

  it('persists "granted" to localStorage with a fresh timestamp', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    const stored = JSON.parse(ls.getItem(CONSENT_STORAGE_KEY)!);
    expect(stored.value).toBe('granted');
    expect(typeof stored.timestamp).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// Deny transition
// ---------------------------------------------------------------------------

describe('useConsent - deny', () => {
  it('pushes a denied consent update and persists "denied" to localStorage', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('deny'));
    const update = dataLayerEntries().findLast(entryStartsWith('consent', 'update'));
    expect(update?.[2]).toEqual({ analytics_storage: 'denied' });
    expect(JSON.parse(ls.getItem(CONSENT_STORAGE_KEY)!).value).toBe('denied');
  });

  it('does not remove the gtag script tag on deny after a prior grant', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    expect(document.getElementById('gtag-script')).not.toBeNull();
    fireEvent.click(screen.getByText('deny'));
    expect(document.getElementById('gtag-script')).not.toBeNull();
  });

  it('does not wipe dataLayer or replace window.gtag on deny', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    const beforeLength = dataLayerEntries().length;
    const gtagBefore = window.gtag;
    fireEvent.click(screen.getByText('deny'));
    expect(dataLayerEntries().length).toBeGreaterThanOrEqual(beforeLength);
    expect(window.gtag).toBe(gtagBefore);
  });

  it('clears _ga and _ga_<id> cookies on deny', () => {
    document.cookie = '_ga=GA1.2.123.456; path=/';
    document.cookie = `_ga_${GA_MEASUREMENT_ID.replace(/^G-/, '')}=GS1.1.session; path=/`;
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('deny'));
    expect(document.cookie).not.toMatch(/(?:^|;\s*)_ga=/);
    expect(document.cookie).not.toMatch(/(?:^|;\s*)_ga_/);
  });

  it('does not touch non-GA cookies on deny', () => {
    document.cookie = '_ga=GA1.2.123.456; path=/';
    document.cookie = 'theme=dark; path=/';
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('deny'));
    expect(document.cookie).toMatch(/(?:^|;\s*)theme=dark/);
  });
});

// ---------------------------------------------------------------------------
// Reset transition
// ---------------------------------------------------------------------------

describe('useConsent - reset', () => {
  it('clears localStorage, sets state to null, pushes a denied consent update, and clears _ga* cookies', () => {
    document.cookie = '_ga=GA1.2.123.456; path=/';
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    fireEvent.click(screen.getByText('reset'));
    expect(screen.getByTestId('consent-value').textContent).toBe('null');
    expect(ls.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    const update = dataLayerEntries().findLast(entryStartsWith('consent', 'update'));
    expect(update?.[2]).toEqual({ analytics_storage: 'denied' });
    expect(document.cookie).not.toMatch(/(?:^|;\s*)_ga=/);
  });

  it('does not remove the gtag script tag on reset', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    fireEvent.click(screen.getByText('reset'));
    expect(document.getElementById('gtag-script')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Deny -> Grant -> Deny -> Grant cycles append the script exactly once total
// ---------------------------------------------------------------------------

describe('useConsent - cycles', () => {
  it('only ever appends one gtag script tag across multiple deny/grant cycles', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('deny'));
    fireEvent.click(screen.getByText('grant'));
    fireEvent.click(screen.getByText('deny'));
    fireEvent.click(screen.getByText('grant'));
    expect(document.querySelectorAll('script#gtag-script').length).toBe(1);
  });

  it('a re-grant within the same session pushes only the consent update, not js or config', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    const lengthAfterFirstGrant = dataLayerEntries().length;
    fireEvent.click(screen.getByText('deny'));
    fireEvent.click(screen.getByText('grant'));
    const entriesAfterSecondGrant = dataLayerEntries();
    // After deny + grant, only two entries are expected: a denied update,
    // then a granted update. js and config are not re-pushed.
    const tail = entriesAfterSecondGrant.slice(lengthAfterFirstGrant);
    expect(tail.length).toBe(2);
    expect(tail[0][0]).toBe('consent');
    expect(tail[0][1]).toBe('update');
    expect(tail[0][2]).toEqual({ analytics_storage: 'denied' });
    expect(tail[1][0]).toBe('consent');
    expect(tail[1][1]).toBe('update');
    expect(tail[1][2]).toEqual({ analytics_storage: 'granted' });
  });
});

// ---------------------------------------------------------------------------
// Mount restoration: stored "granted" auto-injects the script
// ---------------------------------------------------------------------------

describe('useConsent - mount restoration', () => {
  it('with stored granted, appends the gtag script on mount without user interaction', () => {
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    renderWithProviders(<ConsentStatus />);
    expect(document.getElementById('gtag-script')).not.toBeNull();
    const update = dataLayerEntries().findLast(entryStartsWith('consent', 'update'));
    expect(update?.[2]).toEqual({ analytics_storage: 'granted' });
  });

  it('with stored denied, does not append the script on mount', () => {
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: 'denied', timestamp: Date.now() }));
    renderWithProviders(<ConsentStatus />);
    expect(document.getElementById('gtag-script')).toBeNull();
  });

  it('with expired stored value, does not append the script on mount', () => {
    ls.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ value: 'granted', timestamp: Date.now() - CONSENT_EXPIRY_MS - 1 })
    );
    renderWithProviders(<ConsentStatus />);
    expect(document.getElementById('gtag-script')).toBeNull();
  });

  it('with no stored value, does not append the script on mount', () => {
    renderWithProviders(<ConsentStatus />);
    expect(document.getElementById('gtag-script')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// GPC (Global Privacy Control)
// ---------------------------------------------------------------------------

describe('useConsent - GPC', () => {
  function setGpc(value: boolean): void {
    Object.defineProperty(window.navigator, 'globalPrivacyControl', {
      configurable: true,
      get: () => value,
    });
  }

  afterEach(() => {
    // Remove the mocked property so subsequent tests see the real navigator.
    try {
      Object.defineProperty(window.navigator, 'globalPrivacyControl', {
        configurable: true,
        get: () => undefined,
      });
    } catch { /* ignore if already gone */ }
  });

  it('with GPC active and no stored consent, auto-denies without user interaction', () => {
    setGpc(true);
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('denied');
    expect(document.getElementById('gtag-script')).toBeNull();
  });

  it('with GPC active and no stored consent, writes denied to localStorage', () => {
    setGpc(true);
    renderWithProviders(<ConsentStatus />);
    const stored = JSON.parse(ls.getItem(CONSENT_STORAGE_KEY) ?? 'null');
    expect(stored?.value).toBe('denied');
  });

  it('with GPC active and stored granted, respects the explicit prior Accept', () => {
    setGpc(true);
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('granted');
    expect(document.getElementById('gtag-script')).not.toBeNull();
  });

  it('with GPC active and stored denied, stays denied and does not inject gtag', () => {
    setGpc(true);
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: 'denied', timestamp: Date.now() }));
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('denied');
    expect(document.getElementById('gtag-script')).toBeNull();
  });

  it('with GPC inactive, behaves normally (shows undecided state)', () => {
    setGpc(false);
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('null');
    expect(document.getElementById('gtag-script')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Provider guard
// ---------------------------------------------------------------------------

describe('useConsent - provider guard', () => {
  it('throws when used outside ConsentProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const suppressWindowError = (e: ErrorEvent) => e.preventDefault();
    window.addEventListener('error', suppressWindowError);
    expect(() => render(<ConsentStatus />)).toThrow(
      'useConsent must be used within ConsentProvider'
    );
    window.removeEventListener('error', suppressWindowError);
    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// ConsentBanner - mount guard (SSR / prerender safety)
// ---------------------------------------------------------------------------

import { renderToString } from 'react-dom/server';

describe('ConsentBanner - mount guard', () => {
  it('renders nothing when server-rendered', () => {
    const html = renderToString(
      <MemoryRouter>
        <ConsentProvider>
          <ConsentBanner />
        </ConsentProvider>
      </MemoryRouter>
    );
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain('Cookie consent');
    expect(html).not.toContain('Accept analytics');
    expect(html).not.toContain('Decline');
  });

  it('component file uses a mounted state guard before rendering any consent UI', () => {
    const source = readFileSync(resolve(__dirname, '../components/ConsentBanner.tsx'), 'utf-8');
    expect(source).toContain('useState(false)');
    expect(source).toContain('setMounted(true)');
    // Persistent outer live region; mount guard renders null inside it so banner is
    // absent from prerendered HTML. Reversion to a banner-on-first-render would break SSR.
    expect(source).toContain('!mounted ? null');
    expect(source).toContain('aria-live="polite"');
  });
});

// ---------------------------------------------------------------------------
// ConsentBanner - undecided state
// ---------------------------------------------------------------------------

describe('ConsentBanner - undecided state', () => {
  it('shows the banner with Accept and Decline buttons', () => {
    renderWithProviders(<ConsentBanner />);
    expect(screen.getByRole('region', { name: 'This site uses analytics cookies' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /accept analytics/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /decline/i })).toBeTruthy();
  });

  it('shows a link to the privacy policy', () => {
    renderWithProviders(<ConsentBanner />);
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeTruthy();
  });

  it('states that no data is sent to Google before consent', () => {
    renderWithProviders(<ConsentBanner />);
    const region = screen.getByRole('region', { name: 'This site uses analytics cookies' });
    expect(region.textContent?.toLowerCase()).toContain('no data is sent to google until you accept');
  });

  it('hides the banner and shows the floating cookie button after accepting', () => {
    renderWithProviders(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /accept analytics/i }));
    expect(screen.queryByRole('region', { name: 'This site uses analytics cookies' })).toBeNull();
    expect(screen.getByRole('button', { name: /cookie preferences/i })).toBeTruthy();
  });

  it('hides the banner and shows the floating cookie button after declining', () => {
    renderWithProviders(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(screen.queryByRole('region', { name: 'This site uses analytics cookies' })).toBeNull();
    expect(screen.getByRole('button', { name: /cookie preferences/i })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// ConsentBanner - floating button state
// ---------------------------------------------------------------------------

describe('ConsentBanner - floating button', () => {
  it('shows floating button (not banner) when consent was previously stored', () => {
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    renderWithProviders(<ConsentBanner />);
    expect(screen.getByRole('button', { name: /cookie preferences/i })).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'This site uses analytics cookies' })).toBeNull();
  });

  it('clicking the floating button re-shows the banner', () => {
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    renderWithProviders(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /cookie preferences/i }));
    expect(screen.getByRole('region', { name: 'This site uses analytics cookies' })).toBeTruthy();
  });

  it('moves focus to Decline when the banner reappears after reset', () => {
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    renderWithProviders(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /cookie preferences/i }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /decline/i }));
  });
});

// ---------------------------------------------------------------------------
// ConsentBanner - focus management
// ---------------------------------------------------------------------------

describe('ConsentBanner - focus management', () => {
  it('does not steal focus from the skip nav on initial page load', () => {
    renderWithProviders(<ConsentBanner />);
    const declineButton = screen.getByRole('button', { name: /decline/i });
    expect(document.activeElement).not.toBe(declineButton);
  });
});

// ---------------------------------------------------------------------------
// useConsent - initial state determinism (hydration safety)
// ---------------------------------------------------------------------------

describe('useConsent - initial state determinism', () => {
  it('useState initializer returns null before useEffect fires, even when localStorage has "granted"', () => {
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    const renderValues: (string | null)[] = [];

    function CapturingConsumer(): JSX.Element {
      const { consent } = useConsent();
      renderValues.push(consent);
      return <span data-testid="capturing-consent">{consent ?? 'null'}</span>;
    }

    renderWithProviders(<CapturingConsumer />);

    expect(renderValues[0]).toBeNull();
    expect(screen.getByTestId('capturing-consent').textContent).toBe('granted');
  });
});

// ---------------------------------------------------------------------------
// useConsent - file content regression
// ---------------------------------------------------------------------------

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('useConsent - file content regression', () => {
  const source = readFileSync(resolve(__dirname, '../hooks/useConsent.tsx'), 'utf-8');

  it('useState initializer does not read localStorage or call readStored', () => {
    expect(source).toContain('useState<ConsentValue | null>(null)');
    expect(source).not.toMatch(/useState<ConsentValue \| null>\(\s*\(\s*\)/);
  });

  it('uses a module-scoped boolean (not a DOM query) to track injection', () => {
    expect(source).toContain('let gtagScriptInjected');
    // The injector and reset function are the only legitimate places that
    // change the boolean; both should set or read it directly.
    expect(source).toMatch(/gtagScriptInjected\s*=\s*true/);
  });

  it('does not set cookie_domain, linker, or wait_for_update', () => {
    expect(source).not.toContain('cookie_domain');
    expect(source).not.toContain('linker');
    expect(source).not.toContain('wait_for_update');
    expect(source).not.toContain('ANALYTICS_LINKER_DOMAINS');
    expect(source).not.toContain('GA_COOKIE_DOMAIN');
  });

  it('does not put consent update inside script.onload', () => {
    expect(source).not.toMatch(/onload\s*=\s*[^;]*consent/);
  });
});
