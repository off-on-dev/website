const DESKTOP_MQ = "(min-width: 768px)";

// The full set from the pre-migration focus trap. The drawer only holds links
// today, but a trap that silently ignores a form control it does not recognise
// is a trap with a hole in it.
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

// Classes that make the drawer a column when open. Applied by script because
// Tailwind's `flex` sets display:flex, which would defeat the `hidden`
// attribute if both were present at once.
const OPEN_CLASSES = ["flex", "flex-col", "gap-1"];

function initMobileMenu(): void {
  const trigger = document.querySelector<HTMLButtonElement>("[data-mobile-menu-trigger]");
  const drawer = document.querySelector<HTMLElement>("[data-mobile-menu]");
  if (!trigger || !drawer) return;

  let inertSiblings: HTMLElement[] = [];

  const isOpen = (): boolean => trigger.getAttribute("aria-expanded") === "true";

  const focusablesIn = (container: HTMLElement): HTMLElement[] =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));

  // Hide every body child except the drawer's own top-level ancestor, so the
  // page behind the drawer is unreachable by pointer, focus and screen reader.
  const setSiblingsInert = (): void => {
    let host: Element | null = drawer;
    while (host && host.parentElement !== document.body) host = host.parentElement;
    if (!host) return;
    inertSiblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== host,
    );
    inertSiblings.forEach((el) => {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    });
  };

  const clearSiblingsInert = (): void => {
    inertSiblings.forEach((el) => {
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
    });
    inertSiblings = [];
  };

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      close(true);
      return;
    }
    if (event.key !== "Tab") return;

    const items = focusablesIn(drawer);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const open = (): void => {
    trigger.setAttribute("aria-expanded", "true");
    drawer.hidden = false;
    drawer.classList.add(...OPEN_CLASSES);
    setSiblingsInert();
    document.addEventListener("keydown", onKeydown);
    focusablesIn(drawer)[0]?.focus();
  };

  // restoreFocus is false when focus is already going somewhere the user chose
  // (a drawer link, a navigation), where pulling it back would be a steal.
  const close = (restoreFocus: boolean): void => {
    trigger.setAttribute("aria-expanded", "false");
    drawer.hidden = true;
    drawer.classList.remove(...OPEN_CLASSES);
    document.removeEventListener("keydown", onKeydown);
    clearSiblingsInert();
    if (restoreFocus) trigger.focus();
  };

  const onTriggerClick = (): void => {
    if (isOpen()) close(true);
    else open();
  };

  const onDrawerClick = (event: MouseEvent): void => {
    if ((event.target as Element | null)?.closest("a")) close(false);
  };

  // Crossing to desktop hides the drawer via CSS, which would otherwise strand
  // the trap and the inert background with no way to reach the trigger.
  const desktopMq = window.matchMedia(DESKTOP_MQ);
  const onBreakpoint = (event: MediaQueryListEvent): void => {
    if (event.matches && isOpen()) close(false);
  };

  trigger.addEventListener("click", onTriggerClick);
  drawer.addEventListener("click", onDrawerClick);
  desktopMq.addEventListener("change", onBreakpoint);
}

document.addEventListener("DOMContentLoaded", initMobileMenu);
