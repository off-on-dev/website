import "@testing-library/jest-dom";

// jsdom 29 introduced file-backed localStorage. When '--localstorage-file' is
// provided without a valid path (vitest default), the Storage object has no
// methods. Replace it with a reliable in-memory implementation.
const _store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string): string | null => _store[key] ?? null,
  setItem: (key: string, value: string): void => { _store[key] = value; },
  removeItem: (key: string): void => { delete _store[key]; },
  clear: (): void => { Object.keys(_store).forEach((k) => delete _store[k]); },
  key: (index: number): string | null => Object.keys(_store)[index] ?? null,
  get length(): number { return Object.keys(_store).length; },
};
Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
