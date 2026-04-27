import { type JSX } from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ConsentProvider, useConsent } from '@/hooks/useConsent';
import { ConsentBanner } from '@/components/ConsentBanner';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'analytics_consent';
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

// jsdom 29 + vitest: bare `localStorage` global is not available; use window.localStorage
const ls = window.localStorage;

function renderWithProviders(ui: React.ReactElement): ReturnType<typeof render> {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ConsentProvider>{ui}</ConsentProvider>
    </MemoryRouter>
  );
}

// Small consumer component for testing hook state directly
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

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  ls.clear();
  window.gtag = vi.fn();
  window.dataLayer = [];
  document.getElementById('gtag-script')?.remove();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// useConsent - initial state
// ---------------------------------------------------------------------------

describe('useConsent - initial state', () => {
  it('returns null when nothing is stored', () => {
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('null');
  });

  it('returns stored "granted" on mount', () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('granted');
  });

  it('returns stored "denied" on mount', () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: 'denied', timestamp: Date.now() }));
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('denied');
  });

  it('returns null when stored consent has expired (180+ days)', () => {
    ls.setItem(
      STORAGE_KEY,
      JSON.stringify({ value: 'granted', timestamp: Date.now() - SIX_MONTHS_MS - 1 })
    );
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('null');
    expect(ls.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns null when stored JSON is malformed', () => {
    ls.setItem(STORAGE_KEY, 'not-valid-json');
    renderWithProviders(<ConsentStatus />);
    expect(screen.getByTestId('consent-value').textContent).toBe('null');
  });
});

// ---------------------------------------------------------------------------
// useConsent - grant transition
// ---------------------------------------------------------------------------

describe('useConsent - grant', () => {
  it('sets consent to "granted" and persists to localStorage', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    expect(screen.getByTestId('consent-value').textContent).toBe('granted');
    const stored = JSON.parse(ls.getItem(STORAGE_KEY)!);
    expect(stored.value).toBe('granted');
    expect(typeof stored.timestamp).toBe('number');
  });

  it('injects the gtag script into <head>', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    const script = document.getElementById('gtag-script') as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script?.src).toContain('googletagmanager.com');
  });

  it('calls gtag consent update with "granted"', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    // loadGtag() restores window.gtag to the dataLayer shim before updateGtag runs,
    // so the original vi.fn() spy is replaced. Check dataLayer for the queued command.
    expect(window.dataLayer).toContainEqual(['consent', 'update', { analytics_storage: 'granted' }]);
  });

  it('does not inject a second script tag if grant is called twice', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    fireEvent.click(screen.getByText('grant'));
    expect(document.querySelectorAll('#gtag-script').length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// useConsent - deny transition
// ---------------------------------------------------------------------------

describe('useConsent - deny', () => {
  it('sets consent to "denied" and persists to localStorage', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('deny'));
    expect(screen.getByTestId('consent-value').textContent).toBe('denied');
    const stored = JSON.parse(ls.getItem(STORAGE_KEY)!);
    expect(stored.value).toBe('denied');
  });

  it('removes injected gtag script if previously granted', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    expect(document.getElementById('gtag-script')).not.toBeNull();
    fireEvent.click(screen.getByText('deny'));
    expect(document.getElementById('gtag-script')).toBeNull();
  });

  it('calls gtag consent update with "denied" before replacing window.gtag', () => {
    // revokeGtag() calls updateGtag("denied") first, then replaces window.gtag.
    // Capture the spy reference before deny so we can assert on it afterward.
    const gtagSpy = window.gtag as ReturnType<typeof vi.fn>;
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('deny'));
    expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'denied',
    });
  });

  it('replaces window.gtag with a no-op so subsequent calls do not throw', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    fireEvent.click(screen.getByText('deny'));
    expect(() => window.gtag('event', 'page_view')).not.toThrow();
  });

  it('deny → grant cycle: gtag script is re-injected after revoking', () => {
    // Regression: revokeGtag() no-ops window.gtag; loadGtag() must restore it
    // so that the consent update and config commands reach gtag.js.
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    fireEvent.click(screen.getByText('deny'));
    // Script removed after deny
    expect(document.getElementById('gtag-script')).toBeNull();
    // Grant again - script must be re-injected
    fireEvent.click(screen.getByText('grant'));
    expect(document.getElementById('gtag-script')).not.toBeNull();
    // Consent state must be "granted"
    expect(screen.getByTestId('consent-value').textContent).toBe('granted');
  });
});

// ---------------------------------------------------------------------------
// useConsent - reset transition
// ---------------------------------------------------------------------------

describe('useConsent - reset', () => {
  it('sets consent back to null and removes the localStorage entry', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    fireEvent.click(screen.getByText('reset'));
    expect(screen.getByTestId('consent-value').textContent).toBe('null');
    expect(ls.getItem(STORAGE_KEY)).toBeNull();
  });

  it('removes the gtag script on reset', () => {
    renderWithProviders(<ConsentStatus />);
    fireEvent.click(screen.getByText('grant'));
    fireEvent.click(screen.getByText('reset'));
    expect(document.getElementById('gtag-script')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// useConsent - mount restores prior consent
// ---------------------------------------------------------------------------

describe('useConsent - mount restoration', () => {
  it('calls gtag consent update on mount when prior consent was granted', () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    renderWithProviders(<ConsentStatus />);
    // loadGtag() replaces window.gtag with the dataLayer shim during mount restoration.
    // Verify the consent update was queued in dataLayer.
    expect(window.dataLayer).toContainEqual(['consent', 'update', { analytics_storage: 'granted' }]);
  });

  it('does not call gtag on mount when prior consent was denied', () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: 'denied', timestamp: Date.now() }));
    renderWithProviders(<ConsentStatus />);
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('does not call gtag on mount when no prior consent exists', () => {
    renderWithProviders(<ConsentStatus />);
    expect(window.gtag).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// useConsent - missing provider guard
// ---------------------------------------------------------------------------

describe('useConsent - provider guard', () => {
  it('throws when used outside ConsentProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ConsentStatus />)).toThrow(
      'useConsent must be used within ConsentProvider'
    );
    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// ConsentBanner - banner state (consent === null)
// ---------------------------------------------------------------------------

describe('ConsentBanner - undecided state', () => {
  it('shows the banner with Accept and Decline buttons', () => {
    renderWithProviders(<ConsentBanner />);
    expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /accept analytics/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /decline/i })).toBeTruthy();
  });

  it('shows a link to the privacy policy', () => {
    renderWithProviders(<ConsentBanner />);
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeTruthy();
  });

  it('hides the banner and shows the floating cookie button after accepting', () => {
    renderWithProviders(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /accept analytics/i }));
    expect(screen.queryByRole('region', { name: 'Cookie consent' })).toBeNull();
    expect(screen.getByRole('button', { name: /change cookie preferences/i })).toBeTruthy();
  });

  it('hides the banner and shows the floating cookie button after declining', () => {
    renderWithProviders(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(screen.queryByRole('region', { name: 'Cookie consent' })).toBeNull();
    expect(screen.getByRole('button', { name: /change cookie preferences/i })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// ConsentBanner - floating button state (consent !== null)
// ---------------------------------------------------------------------------

describe('ConsentBanner - floating button', () => {
  it('shows floating button (not banner) when consent was previously stored', () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    renderWithProviders(<ConsentBanner />);
    expect(screen.getByRole('button', { name: /change cookie preferences/i })).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Cookie consent' })).toBeNull();
  });

  it('clicking the floating button re-shows the banner', () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));
    renderWithProviders(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /change cookie preferences/i }));
    expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// useConsent - initial state determinism
// ---------------------------------------------------------------------------

describe('useConsent - initial state determinism', () => {
  it('useState initializer returns null before useEffect fires, even when localStorage has "granted"', () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: 'granted', timestamp: Date.now() }));

    const renderValues: (string | null)[] = [];

    function CapturingConsumer(): JSX.Element {
      const { consent } = useConsent();
      renderValues.push(consent);
      return <span data-testid="capturing-consent">{consent ?? 'null'}</span>;
    }

    renderWithProviders(<CapturingConsumer />);

    // The very first synchronous render must use the deterministic null default
    expect(renderValues[0]).toBeNull();
    // After useEffect fires, the stored "granted" value is applied
    expect(screen.getByTestId('capturing-consent').textContent).toBe('granted');
  });

  it('useState initializer returns null before useEffect fires, even when localStorage has "denied"', () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: 'denied', timestamp: Date.now() }));

    const renderValues: (string | null)[] = [];

    function CapturingConsumerDenied(): JSX.Element {
      const { consent } = useConsent();
      renderValues.push(consent);
      return <span data-testid="capturing-denied">{consent ?? 'null'}</span>;
    }

    renderWithProviders(<CapturingConsumerDenied />);

    expect(renderValues[0]).toBeNull();
    expect(screen.getByTestId('capturing-denied').textContent).toBe('denied');
  });
});

// ---------------------------------------------------------------------------
// useConsent - file content regression
// ---------------------------------------------------------------------------

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('useConsent - file content regression', () => {
  it('useState initializer does not read localStorage or call readStored', () => {
    const source = readFileSync(
      resolve(__dirname, '../hooks/useConsent.tsx'),
      'utf-8'
    );
    expect(source).toContain('useState<ConsentValue | null>(null)');
    expect(source).not.toMatch(/useState<ConsentValue \| null>\(\s*\(\s*\)/);
    // The literal string "readStored" must not appear inside the useState call
    const useStateIdx = source.indexOf('useState<ConsentValue | null>(null)');
    expect(useStateIdx).toBeGreaterThan(-1);
    // Guard: no lazy initializer pattern with readStored
    expect(source).not.toMatch(/useState<ConsentValue \| null>\([^)]*readStored/);
  });
});
