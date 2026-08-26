const TOC_ROOT_MARGIN = "-10% 0% -80% 0%";

let tocObserver: IntersectionObserver | null = null;

function teardownToc(): void {
  tocObserver?.disconnect();
  tocObserver = null;
}

function initBrandToc(): void {
  teardownToc();
  const nav = document.querySelector<HTMLElement>("[data-toc]");
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>("[data-toc-link]"));
  if (links.length === 0) return;

  const idle = (nav.dataset.tocIdle ?? "").split(" ").filter(Boolean);
  const active = (nav.dataset.tocActive ?? "").split(" ").filter(Boolean);

  function setActive(id: string): void {
    links.forEach((link) => {
      const on = link.dataset.tocLink === id;
      link.classList.remove(...(on ? idle : active));
      link.classList.add(...(on ? active : idle));
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  tocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: TOC_ROOT_MARGIN, threshold: 0 },
  );

  links.forEach((link) => {
    const section = document.getElementById(link.dataset.tocLink ?? "");
    if (section) tocObserver?.observe(section);
  });
}

document.addEventListener("DOMContentLoaded", initBrandToc);
