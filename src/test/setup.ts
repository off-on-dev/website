import { vi } from "vitest";

// ─── localStorage stub ─────────────────────────────────────────────────────────
// In Node 26, `localStorage` is a built-in getter that returns `undefined`
// without --localstorage-file. happy-dom cannot override this non-configurable
// descriptor. Provide a fully-compliant in-memory Storage via vi.stubGlobal so
// that both the modules under test and test helpers see a real Storage object.
const _lsData: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: (k: string): string | null => _lsData[k] ?? null,
  setItem: (k: string, v: string): void => {
    _lsData[k] = String(v);
  },
  removeItem: (k: string): void => {
    delete _lsData[k];
  },
  clear: (): void => {
    Object.keys(_lsData).forEach((k) => delete _lsData[k]);
  },
  key: (i: number): string | null => Object.keys(_lsData)[i] ?? null,
  get length(): number {
    return Object.keys(_lsData).length;
  },
} satisfies Storage);

// ─── document.cookie mock ─────────────────────────────────────────────────────
// happy-dom 18 does not honour expired-date deletion (setting
// `name=; expires=past` leaves the cookie in the jar). Override document.cookie
// with a proper Map-backed implementation so clearGaCookies() and test helpers
// both work correctly.
const _cookieJar = new Map<string, string>();

function _parseCookieWrite(raw: string): { name: string; value: string; del: boolean } {
  const eqIdx = raw.indexOf("=");
  if (eqIdx < 0) return { name: "", value: "", del: false };
  const name = raw.slice(0, eqIdx).trim();
  const rest = raw.slice(eqIdx + 1);
  const [valueRaw, ...attrParts] = rest.split(";");
  const attrsLower = attrParts.join(";").toLowerCase();

  let del = false;
  const maxAgeM = attrsLower.match(/max-age=(-?\d+)/);
  if (maxAgeM && parseInt(maxAgeM[1], 10) <= 0) {
    del = true;
  } else {
    const expiresM = attrsLower.match(/expires=([^;]+)/);
    if (expiresM) {
      const d = new Date(expiresM[1].trim());
      del = !isNaN(d.getTime()) && d.getTime() < Date.now();
    }
  }
  return { name, value: valueRaw ?? "", del };
}

Object.defineProperty(document, "cookie", {
  get(): string {
    return Array.from(_cookieJar.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  },
  set(val: string): void {
    const { name, value, del } = _parseCookieWrite(val);
    if (!name) return;
    if (del) {
      _cookieJar.delete(name);
    } else {
      _cookieJar.set(name, value);
    }
  },
  configurable: true,
});

// ─── gtag / dataLayer stubs ───────────────────────────────────────────────────
// Stub gtag and dataLayer so consent store tests can assert calls
// without loading real Google Analytics.
Object.defineProperty(window, "gtag", {
  value: vi.fn((..._args: unknown[]) => {}),
  writable: true,
  configurable: true,
});
Object.defineProperty(window, "dataLayer", {
  value: [],
  writable: true,
  configurable: true,
});

// ─── Per-test reset ───────────────────────────────────────────────────────────
// Reset between tests. Each describe can override these if needed.
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // Clear cookie jar (uses our mock's expiration path).
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
});
