const ANNOUNCE_DELAY_MS = 50;
const ANNOUNCE_CLEAR_MS = 1600;

let announceSet: ReturnType<typeof setTimeout> | undefined;
let announceClear: ReturnType<typeof setTimeout> | undefined;

function announce(theme: "dark" | "light"): void {
  const status = document.getElementById("theme-status");
  if (!status) return;
  clearTimeout(announceSet);
  clearTimeout(announceClear);
  status.textContent = "";
  announceSet = setTimeout(() => {
    status.textContent =
      theme === "dark" ? "Theme switched to dark mode" : "Theme switched to light mode";
  }, ANNOUNCE_DELAY_MS);
  announceClear = setTimeout(() => {
    status.textContent = "";
  }, ANNOUNCE_CLEAR_MS);
}

// Delegated on document, so it survives View Transitions without rebinding and
// covers every toggle instance at once. The module runs once per page load.
document.addEventListener("click", (event) => {
  const target = event.target as Element | null;
  if (!target?.closest?.("[data-theme-toggle]")) return;

  const root = document.documentElement;
  const next = root.classList.contains("light") ? "dark" : "light";

  root.classList.toggle("light", next === "light");
  root.classList.toggle("dark", next === "dark");

  try {
    localStorage.setItem("theme", next);
  } catch {
    /* storage unavailable; the choice just will not survive a reload */
  }

  announce(next);
});
