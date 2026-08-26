const TOOLTIP_MAX_WIDTH = 260;
const TOOLTIP_MIN_WIDTH = 80;
const TOOLTIP_EDGE_GAP = 16;

let abbrTips: HTMLElement[] = [];
let repositionActive: (() => void) | null = null;

function clearAbbrTooltips(): void {
  abbrTips.forEach((t) => t.remove());
  abbrTips = [];
  repositionActive = null;
}

function enhanceAbbrTooltips(): void {
  clearAbbrTooltips();
  const container = document.getElementById("main-content");
  if (!container) return;

  // Safety net: raw <abbr title> that never went through the pipeline.
  container.querySelectorAll("abbr[title]").forEach((abbr) => {
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

  container.querySelectorAll<HTMLElement>("abbr[data-title]").forEach((abbrEl) => {
    const title = abbrEl.getAttribute("data-title") ?? "";
    const tip = document.createElement("span");
    tip.setAttribute("aria-hidden", "true");
    tip.style.cssText =
      "position:fixed;z-index:9999;display:none;padding:0.25rem 0.5rem;" +
      "font-size:0.75rem;line-height:1rem;background:hsl(var(--foreground));" +
      "color:hsl(var(--background));border-radius:0.25rem;word-break:break-word;" +
      "white-space:normal;box-shadow:0 2px 8px rgba(0,0,0,0.3);";
    tip.textContent = title;
    document.body.appendChild(tip);
    abbrTips.push(tip);
    // Suppress the CSS ::after fallback now the portal is live.
    abbrEl.classList.add("abbr-js-tooltip");

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const clearHide = (): void => {
      if (hideTimer !== null) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    };
    // Clamp below the abbr so the tooltip never overflows the viewport edges.
    const place = (): void => {
      const rect = abbrEl.getBoundingClientRect();
      const tipMaxWidth = Math.min(TOOLTIP_MAX_WIDTH, Math.max(TOOLTIP_MIN_WIDTH, window.innerWidth - TOOLTIP_EDGE_GAP));
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - tipMaxWidth - 8));
      tip.style.maxWidth = `${tipMaxWidth}px`;
      tip.style.top = `${rect.bottom + 6}px`;
      tip.style.left = `${left}px`;
    };
    const show = (): void => {
      clearHide();
      place();
      tip.style.display = "block";
      repositionActive = place;
    };
    const scheduleHide = (): void => {
      hideTimer = setTimeout(() => {
        tip.style.display = "none";
        if (repositionActive === place) repositionActive = null;
        hideTimer = null;
      }, 100);
    };
    const immediateHide = (): void => {
      clearHide();
      tip.style.display = "none";
      if (repositionActive === place) repositionActive = null;
    };
    const onTipMouseLeave = (): void => {
      if (document.activeElement !== abbrEl) scheduleHide();
    };

    abbrEl.addEventListener("mouseenter", show);
    abbrEl.addEventListener("mouseleave", scheduleHide);
    tip.addEventListener("mouseenter", clearHide);
    tip.addEventListener("mouseleave", onTipMouseLeave);
    abbrEl.addEventListener("click", () => abbrEl.focus());
    abbrEl.addEventListener("focus", show);
    abbrEl.addEventListener("blur", immediateHide);
    abbrEl.addEventListener("keydown", (e) => {
      if ((e as KeyboardEvent).key === "Escape") {
        e.preventDefault();
        immediateHide();
      }
    });
  });
}

// One shared scroll/resize handler repositions whichever tooltip is visible.
window.addEventListener("scroll", () => repositionActive?.(), { capture: true });
window.addEventListener("resize", () => repositionActive?.());
document.addEventListener("astro:page-load", enhanceAbbrTooltips);
