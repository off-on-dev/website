/// <reference types="vite/client" />
/// <reference types="@react-router/dev/vite/client" />

interface Window {
  gtag: (...args: unknown[]) => void;
  dataLayer: unknown[];
}
