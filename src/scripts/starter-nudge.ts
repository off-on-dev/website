const STORAGE_KEY = "starter_nudge_dismissed";

function initStarterNudge(): void {
  const nudge = document.querySelector<HTMLElement>("[data-starter-nudge]");
  if (!nudge) return;

  let dismissed: boolean;
  try {
    dismissed = !!localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: leave the nudge hidden rather than showing something
    // the visitor would have no way to dismiss for good.
    return;
  }
  if (dismissed) return;

  nudge.hidden = false;

  nudge
    .querySelector<HTMLButtonElement>("[data-starter-nudge-dismiss]")
    ?.addEventListener("click", () => {
      nudge.hidden = true;
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* storage unavailable; the nudge returns next visit */
      }
    });
}

document.addEventListener("astro:page-load", initStarterNudge);
