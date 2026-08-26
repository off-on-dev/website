// Open the <details> element matching the URL hash (StepNav links scroll to a
// step but would leave it collapsed otherwise). No-ops on pages without steps.
const openMatchingStep = (hash: string): void => {
  if (!hash) return;
  const el = document.getElementById(hash.replace(/^#/, ""));
  if (el instanceof HTMLDetailsElement) el.open = true;
};

document.addEventListener("DOMContentLoaded", () => {
  openMatchingStep(window.location.hash);
  window.addEventListener("hashchange", () => openMatchingStep(window.location.hash));
});
