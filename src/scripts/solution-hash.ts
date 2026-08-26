// Open the <details> element matching the URL hash (StepNav links scroll to a
// step but would leave it collapsed otherwise). No-ops on pages without steps.
const openMatchingStep = (hash: string): void => {
  if (!hash) return;
  const el = document.getElementById(hash.replace(/^#/, ""));
  if (el instanceof HTMLDetailsElement) el.open = true;
};

let onHash: (() => void) | null = null;

document.addEventListener("astro:page-load", () => {
  openMatchingStep(window.location.hash);
  onHash = () => openMatchingStep(window.location.hash);
  window.addEventListener("hashchange", onHash);
});

document.addEventListener("astro:before-swap", () => {
  if (onHash) {
    window.removeEventListener("hashchange", onHash);
    onHash = null;
  }
});
