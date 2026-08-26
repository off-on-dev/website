const COPY_RESET_DELAY_MS = 1500;

const CHECK_SVG =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const COPY_SVG =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

// Shared polite live region: a focused button's aria-label change is not
// reliably re-announced, so route the "copied" confirmation through here.
function ensureLiveRegion(): void {
  if (document.getElementById("code-copy-status")) return;
  const live = document.createElement("span");
  live.id = "code-copy-status";
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  document.body.appendChild(live);
}
function announceCopied(): void {
  const live = document.getElementById("code-copy-status");
  if (!live) return;
  live.textContent = "Code copied to clipboard";
  window.setTimeout(() => {
    live.textContent = "";
  }, COPY_RESET_DELAY_MS);
}

function wireCopyButtons(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-copy-code]");
  if (buttons.length > 0) ensureLiveRegion();
  buttons.forEach((btn) => {
    if (btn.dataset.copyWired) return;
    btn.dataset.copyWired = "1";
    const code = btn.closest("[data-code-block]")?.querySelector("pre code");
    btn.addEventListener("click", () => {
      navigator.clipboard
        ?.writeText(code?.textContent ?? "")
        .then(() => {
          btn.innerHTML = CHECK_SVG + "<span>Copied</span>";
          btn.setAttribute("aria-label", "Code copied");
          announceCopied();
          window.setTimeout(() => {
            btn.innerHTML = COPY_SVG + "<span>Copy</span>";
            btn.setAttribute("aria-label", "Copy code");
          }, COPY_RESET_DELAY_MS);
        })
        .catch(() => {
          /* writeText can reject when the document is not focused */
        });
    });
  });
}

document.addEventListener("DOMContentLoaded", wireCopyButtons);
