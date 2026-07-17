import { useEffect, useRef, type JSX } from "react";

// SVG markup for copy button icons. Defined as module-level constants so the
// strings are created once rather than on every effect run.
const COPY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5"/></svg>`;

type MarkdownContentProps = {
  source: string;
};

export const MarkdownContent = ({ source }: MarkdownContentProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const liveEl = liveRef.current;
    const cleanup: (() => void)[] = [];

    // Convert title→data-title on any abbr elements that still carry title
    // (e.g. hardcoded HTML strings that weren't processed by the generate
    // pipeline). data-title drives the CSS ::after tooltip; aria-label carries
    // the expansion for screen readers. Removing title prevents the browser's
    // native tooltip from appearing alongside the custom one.
    el.querySelectorAll("abbr[title]").forEach((abbr) => {
      const text = abbr.getAttribute("title") ?? "";
      abbr.setAttribute("data-title", text);
      abbr.setAttribute("aria-label", text);
      abbr.removeAttribute("title");
    });

    // Replace the CSS ::after tooltip on each abbr[data-title] with a fixed-
    // position portal tooltip appended to document.body. Using position:fixed
    // escapes the overflow-x:clip on .md-content so the tooltip is never
    // visually clipped. Position and maxWidth are computed from
    // getBoundingClientRect() at show time, when fonts are loaded and layout
    // is stable. Works on mobile touch (focus event fires on tap).
    el.querySelectorAll<HTMLElement>("abbr[data-title]").forEach((abbrEl) => {
      const title = abbrEl.getAttribute("data-title") ?? "";

      // Portal element: fixed position, outside .md-content's overflow clip.
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

      const positionAndShow = (): void => {
        clearHide();
        const rect = abbrEl.getBoundingClientRect();
        const tipMaxWidth = Math.min(160, Math.max(80, window.innerWidth - rect.left - 16));
        // Clamp left so the tooltip never overflows the viewport right edge.
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - tipMaxWidth - 8));
        tip.style.maxWidth = `${tipMaxWidth}px`;
        tip.style.top = `${rect.bottom + 6}px`;
        tip.style.left = `${left}px`;
        tip.style.display = "block";
      };

      const scheduleHide = (): void => {
        hideTimer = setTimeout(() => { tip.style.display = "none"; hideTimer = null; }, 100);
      };

      const immediateHide = (): void => { clearHide(); tip.style.display = "none"; };

      // Reposition while visible (page can scroll while tooltip is open).
      // Applies the same clamping as positionAndShow so the tooltip never
      // overflows the viewport right edge after a scroll or resize.
      const reposition = (): void => {
        if (tip.style.display === "block") {
          const rect = abbrEl.getBoundingClientRect();
          const tipMaxWidth = Math.min(160, Math.max(80, window.innerWidth - rect.left - 16));
          const left = Math.max(8, Math.min(rect.left, window.innerWidth - tipMaxWidth - 8));
          tip.style.maxWidth = `${tipMaxWidth}px`;
          tip.style.top = `${rect.bottom + 6}px`;
          tip.style.left = `${left}px`;
        }
      };

      abbrEl.addEventListener("mouseenter", positionAndShow);
      abbrEl.addEventListener("mouseleave", scheduleHide);
      // Hoverable: moving the mouse from abbr onto the tooltip keeps it visible.
      // Guard: if the abbr is keyboard-focused, mouse leaving the tooltip must
      // not hide it — the focus path owns visibility until blur fires.
      const onTipMouseLeave = (): void => {
        if (document.activeElement !== abbrEl) scheduleHide();
      };
      tip.addEventListener("mouseenter", clearHide);
      tip.addEventListener("mouseleave", onTipMouseLeave);
      // Mobile touch: tap focuses the abbr, blur hides immediately.
      abbrEl.addEventListener("focus", positionAndShow);
      abbrEl.addEventListener("blur", immediateHide);
      // Escape dismisses (WCAG 1.4.13 dismissible).
      const onKeyDown = (e: Event): void => {
        if ((e as KeyboardEvent).key === "Escape") { e.preventDefault(); abbrEl.blur(); }
      };
      abbrEl.addEventListener("keydown", onKeyDown);
      window.addEventListener("scroll", reposition, { capture: true });
      window.addEventListener("resize", reposition);

      cleanup.push(() => {
        abbrEl.removeEventListener("mouseenter", positionAndShow);
        abbrEl.removeEventListener("mouseleave", scheduleHide);
        tip.removeEventListener("mouseenter", clearHide);
        tip.removeEventListener("mouseleave", onTipMouseLeave);
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

    el.querySelectorAll("pre").forEach((pre) => {
      const code = pre.querySelector("code");
      const langMatch = code?.className.match(/language-(\S+)/);
      const langLabel = langMatch ? langMatch[1] : "";

      // Header bar: language label left, copy button right
      const header = document.createElement("div");
      header.className = "code-block-header";

      const label = document.createElement("span");
      label.className = "code-lang-label";
      label.setAttribute("aria-hidden", "true");
      label.textContent = langLabel;
      header.appendChild(label);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Copy code");
      btn.className = "code-header-btn";
      btn.innerHTML = `${COPY_SVG} Copy`;
      header.appendChild(btn);

      // Code body: md-content code-block-body so .md-content pre styles apply
      const codeBody = document.createElement("div");
      codeBody.className = "md-content code-block-body";

      const wrapper = document.createElement("div");
      wrapper.className = "md-pre-group";
      codeBody.appendChild(wrapper);

      // Outer container replaces the pre in the DOM
      const container = document.createElement("div");
      container.appendChild(header);
      container.appendChild(codeBody);

      pre.parentNode?.insertBefore(container, pre);
      wrapper.appendChild(pre);

      let resetTimer: ReturnType<typeof setTimeout> | null = null;

      const onClick = (): void => {
        navigator.clipboard?.writeText(pre.textContent ?? "").then(() => {
          btn.innerHTML = `${CHECK_SVG} Copied`;
          btn.setAttribute("aria-label", "Code copied");
          if (liveEl) liveEl.textContent = "Code copied to clipboard";
          if (resetTimer !== null) clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            btn.innerHTML = `${COPY_SVG} Copy`;
            btn.setAttribute("aria-label", "Copy code");
            if (liveEl) liveEl.textContent = "";
            resetTimer = null;
          }, 1500);
        }).catch(() => {});
      };
      btn.addEventListener("click", onClick);

      cleanup.push(() => {
        btn.removeEventListener("click", onClick);
        if (resetTimer !== null) {
          clearTimeout(resetTimer);
          resetTimer = null;
        }
        if (liveEl) liveEl.textContent = "";
        if (container.parentNode) {
          container.parentNode.insertBefore(pre, container);
          container.remove();
        }
      });
    });

    return () => cleanup.forEach((fn) => fn());
  }, [source]);

  return (
    <>
      {/* Polite live region announces copy success to screen readers that
          don't re-read a focused button's aria-label when it changes. */}
      <span ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      <div
        ref={ref}
        className="font-sans md-content"
        dangerouslySetInnerHTML={{ __html: source }}
      />
    </>
  );
};
