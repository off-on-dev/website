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
    const cleanup: (() => void)[] = [];

    el.querySelectorAll("pre").forEach((pre) => {
      const wrapper = document.createElement("div");
      wrapper.className = "md-pre-group";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.className = "md-copy-btn";
      btn.innerHTML = `${COPY_SVG} Copy`;

      const onClick = (): void => {
        void navigator.clipboard.writeText(pre.textContent ?? "").then(() => {
          btn.innerHTML = `${CHECK_SVG} Copied`;
          btn.setAttribute("aria-label", "Copied to clipboard");
          // Announce via live region for screen readers that don't re-read
          // a focused button's accessible name when it changes mid-focus.
          if (liveRef.current) liveRef.current.textContent = "Copied to clipboard";
          window.setTimeout(() => {
            btn.innerHTML = `${COPY_SVG} Copy`;
            btn.setAttribute("aria-label", "Copy code to clipboard");
            if (liveRef.current) liveRef.current.textContent = "";
          }, 1500);
        });
      };
      btn.addEventListener("click", onClick);
      wrapper.appendChild(btn);

      cleanup.push(() => {
        btn.removeEventListener("click", onClick);
        if (wrapper.parentNode) {
          wrapper.parentNode.insertBefore(pre, wrapper);
          wrapper.remove();
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
