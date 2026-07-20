import { useEffect, type RefObject } from "react";

// Single abbreviation-tooltip implementation shared by the <Abbr> component and
// dangerouslySetInnerHTML prose (MarkdownContent), so JSX and pre-rendered
// content behave identically. For every abbr[data-title] inside the container it:
//   - replaces the CSS ::after tooltip with a fixed-position portal appended to
//     document.body, so it escapes overflow clipping and is clamped to the
//     viewport; reveals on hover and focus, click forces focus (iOS touch), and
//     Escape hides it without moving focus (WCAG 1.4.13 dismissible).
// It also converts any leftover <abbr title> (e.g. hardcoded HTML) to data-title
// plus an adjacent sr-only expansion span, matching what the generator and the
// <Abbr> component already emit. The CSS `abbr[data-title]::after` rule is the
// no-JS fallback.
export function useAbbrTooltips<T extends HTMLElement>(
  containerRef: RefObject<T>,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cleanup: (() => void)[] = [];

    // Safety net for raw <abbr title> that never went through the generator.
    el.querySelectorAll("abbr[title]").forEach((abbr) => {
      const text = abbr.getAttribute("title") ?? "";
      abbr.setAttribute("data-title", text);
      abbr.removeAttribute("title");
      const next = abbr.nextElementSibling;
      if (!(next && next.classList.contains("sr-only"))) {
        const span = document.createElement("span");
        span.className = "sr-only";
        span.textContent = text;
        abbr.after(span);
      }
    });

    el.querySelectorAll<HTMLElement>("abbr[data-title]").forEach((abbrEl) => {
      const title = abbrEl.getAttribute("data-title") ?? "";

      const tip = document.createElement("span");
      tip.setAttribute("aria-hidden", "true");
      tip.style.cssText =
        "position:fixed;z-index:9999;display:none;" +
        "padding:0.25rem 0.5rem;font-size:0.75rem;line-height:1rem;" +
        "background:hsl(var(--foreground));color:hsl(var(--background));" +
        "border-radius:0.25rem;word-break:break-word;white-space:normal;" +
        "box-shadow:0 2px 8px rgba(0,0,0,0.3);";
      tip.textContent = title;
      document.body.appendChild(tip);

      // Suppress the CSS ::after tooltip now that the portal is live.
      abbrEl.classList.add("abbr-js-tooltip");

      let hideTimer: ReturnType<typeof setTimeout> | null = null;
      const clearHide = (): void => {
        if (hideTimer !== null) { clearTimeout(hideTimer); hideTimer = null; }
      };
      // Position below the abbr, clamped so the tooltip never overflows the
      // viewport right edge (fonts loaded and layout stable at show time).
      const place = (): void => {
        const rect = abbrEl.getBoundingClientRect();
        const tipMaxWidth = Math.min(160, Math.max(80, window.innerWidth - rect.left - 16));
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - tipMaxWidth - 8));
        tip.style.maxWidth = `${tipMaxWidth}px`;
        tip.style.top = `${rect.bottom + 6}px`;
        tip.style.left = `${left}px`;
      };
      const positionAndShow = (): void => { clearHide(); place(); tip.style.display = "block"; };
      const scheduleHide = (): void => {
        hideTimer = setTimeout(() => { tip.style.display = "none"; hideTimer = null; }, 100);
      };
      const immediateHide = (): void => { clearHide(); tip.style.display = "none"; };
      const reposition = (): void => { if (tip.style.display === "block") place(); };
      // Hoverable: keep the tooltip while the pointer is on it. Guard so a mouse
      // leaving the tooltip does not hide it while the abbr is keyboard-focused.
      const onTipMouseLeave = (): void => { if (document.activeElement !== abbrEl) scheduleHide(); };
      // iOS Safari does not reliably focus a tabindex-only element on tap;
      // attaching a click handler makes it dispatch the tap and forces focus.
      const onClick = (): void => { abbrEl.focus(); };
      const onKeyDown = (e: Event): void => {
        if ((e as KeyboardEvent).key === "Escape") { e.preventDefault(); immediateHide(); }
      };

      abbrEl.addEventListener("mouseenter", positionAndShow);
      abbrEl.addEventListener("mouseleave", scheduleHide);
      tip.addEventListener("mouseenter", clearHide);
      tip.addEventListener("mouseleave", onTipMouseLeave);
      abbrEl.addEventListener("click", onClick);
      abbrEl.addEventListener("focus", positionAndShow);
      abbrEl.addEventListener("blur", immediateHide);
      abbrEl.addEventListener("keydown", onKeyDown);
      window.addEventListener("scroll", reposition, { capture: true });
      window.addEventListener("resize", reposition);

      cleanup.push(() => {
        abbrEl.removeEventListener("mouseenter", positionAndShow);
        abbrEl.removeEventListener("mouseleave", scheduleHide);
        tip.removeEventListener("mouseenter", clearHide);
        tip.removeEventListener("mouseleave", onTipMouseLeave);
        abbrEl.removeEventListener("click", onClick);
        abbrEl.removeEventListener("focus", positionAndShow);
        abbrEl.removeEventListener("blur", immediateHide);
        abbrEl.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("scroll", reposition, { capture: true });
        window.removeEventListener("resize", reposition);
        clearHide();
        abbrEl.classList.remove("abbr-js-tooltip");
        tip.remove();
      });
    });

    return () => cleanup.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are caller-provided; the effect reads only DOM inside containerRef
  }, deps);
}
