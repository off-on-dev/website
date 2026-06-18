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
