import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/hooks/useTheme";
import { Navbar } from "@/components/Navbar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ls = window.localStorage;

function renderNavbar(initialPath = "/"): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  ls.clear();
  document.documentElement.className = "";
});

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------

describe("Navbar - logo", () => {
  it("renders both logo images (dark and light) in the DOM", () => {
    renderNavbar();
    const logoLink = screen.getByRole("link", { name: "offon.dev home" });
    const imgs = logoLink.querySelectorAll("img");
    expect(imgs).toHaveLength(2);
    // Both images are decorative. The link's aria-label provides the accessible name.
    // alt="" on both suppresses any path-based announcement from AT.
    expect(imgs[0].getAttribute("alt")).toBe("");
    expect(imgs[0].getAttribute("aria-hidden")).toBeNull();
    // Light logo: alt="" is sufficient; redundant aria-hidden is omitted.
    expect(imgs[1].getAttribute("alt")).toBe("");
    expect(imgs[1].getAttribute("aria-hidden")).toBeNull();
  });

  it("logo link navigates to home (/)", () => {
    renderNavbar();
    const logoLink = screen.getByRole("link", { name: "offon.dev home" });
    expect(logoLink.getAttribute("href")).toBe("/");
  });
});

// ---------------------------------------------------------------------------
// Desktop navigation links
// ---------------------------------------------------------------------------

describe("Navbar - aria-current", () => {
  it("sets aria-current='page' on the active desktop link", () => {
    renderNavbar("/about/");
    const aboutLinks = screen.getAllByRole("link", { name: /About/i });
    expect(aboutLinks[0].getAttribute("aria-current")).toBe("page");
  });

  it("does not set aria-current on inactive desktop links", () => {
    renderNavbar("/about/");
    const challengesLinks = screen.getAllByRole("link", { name: /Challenges/i });
    expect(challengesLinks[0].getAttribute("aria-current")).toBeNull();
  });
});

describe("Navbar - desktop navigation", () => {
  it("contains a nav landmark labelled 'Main'", () => {
    renderNavbar();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
  });

  it("has an About link pointing to /about", () => {
    renderNavbar();
    const aboutLinks = screen.getAllByRole("link", { name: /About/i });
    expect(aboutLinks[0].getAttribute("href")).toBe("/about/");
  });

  it("has a Handbook link pointing to /handbook", () => {
    renderNavbar();
    const links = screen.getAllByRole("link", { name: /Handbook/i });
    expect(links[0].getAttribute("href")).toBe("/handbook/");
  });

  it("has a Sponsors link pointing to /sponsors", () => {
    renderNavbar();
    const links = screen.getAllByRole("link", { name: /Sponsors/i });
    expect(links[0].getAttribute("href")).toBe("/sponsors/");
  });

  it("has a Community external link that opens in a new tab", () => {
    renderNavbar();
    const communityLinks = screen.getAllByRole("link", { name: /Community/i });
    expect(communityLinks[0].getAttribute("target")).toBe("_blank");
  });

});

// ---------------------------------------------------------------------------
// Theme toggle
// ---------------------------------------------------------------------------

describe("Navbar - theme toggle", () => {
  it("toggle button label says 'Switch to light mode' when theme is dark", () => {
    ls.clear(); // dark is the default
    renderNavbar();
    const toggles = screen.getAllByRole("button", { name: /Switch to light mode/i });
    expect(toggles.length).toBeGreaterThan(0);
  });

  it("toggle button label changes to 'Switch to dark mode' after clicking", () => {
    renderNavbar();
    const toggle = screen.getAllByRole("button", { name: /Switch to light mode/i })[0];
    fireEvent.click(toggle);
    const darkToggles = screen.getAllByRole("button", { name: /Switch to dark mode/i });
    expect(darkToggles.length).toBeGreaterThan(0);
  });

  it("clicking the toggle adds 'light' class to <html>", () => {
    renderNavbar();
    fireEvent.click(screen.getAllByRole("button", { name: /Switch to light mode/i })[0]);
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Mobile menu
// ---------------------------------------------------------------------------

describe("Navbar - mobile menu", () => {
  it("hamburger button has aria-expanded='false' when closed", () => {
    renderNavbar();
    const hamburger = screen.getByRole("button", { name: /Open menu/i });
    expect(hamburger.getAttribute("aria-expanded")).toBe("false");
  });

  it("mobile menu drawer is hidden initially", () => {
    renderNavbar();
    expect(document.getElementById("mobile-menu")?.hasAttribute("hidden")).toBe(true);
  });

  it("clicking the hamburger reveals the mobile menu", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    expect(document.getElementById("mobile-menu")?.hasAttribute("hidden")).toBe(false);
  });

  it("hamburger button has aria-expanded='true' when menu is open", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    const hamburger = screen.getByRole("button", { name: /Close menu/i });
    expect(hamburger.getAttribute("aria-expanded")).toBe("true");
  });

  it("clicking the hamburger again closes the mobile menu", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /Close menu/i }));
    expect(document.getElementById("mobile-menu")?.hasAttribute("hidden")).toBe(true);
  });

  it("mobile menu contains navigation links when open", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    const mobileMenu = document.getElementById("mobile-menu");
    expect(mobileMenu).toBeTruthy();
    const mobileNav = within(mobileMenu!);
    expect(mobileNav.getByRole("link", { name: /About/i })).toBeTruthy();
  });

  it("mobile menu has aria-controls pointing to 'mobile-menu'", () => {
    renderNavbar();
    const hamburger = screen.getByRole("button", { name: /Open menu/i });
    expect(hamburger.getAttribute("aria-controls")).toBe("mobile-menu");
  });

  it("mobile menu drawer is a plain element, not a nav landmark, to avoid nested nav regions", () => {
    renderNavbar();
    const mobileMenu = document.getElementById("mobile-menu");
    expect(mobileMenu?.tagName.toLowerCase()).not.toBe("nav");
  });

  it("pressing Escape closes the mobile menu", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    expect(document.getElementById("mobile-menu")?.hasAttribute("hidden")).toBe(false);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.getElementById("mobile-menu")?.hasAttribute("hidden")).toBe(true);
  });

  it("pressing Escape returns focus to the hamburger button", () => {
    renderNavbar();
    const hamburger = screen.getByRole("button", { name: /Open menu/i });
    fireEvent.click(hamburger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /Open menu/i }));
  });

  it("Tab on the last menu item wraps focus back to the first menu item", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    const menu = document.getElementById("mobile-menu")!;
    const focusable = Array.from(
      menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    );
    expect(focusable.length).toBeGreaterThan(0);
    const last = focusable[focusable.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(focusable[0]);
  });

  it("Shift+Tab on the first menu item wraps focus to the last menu item", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    const menu = document.getElementById("mobile-menu")!;
    const focusable = Array.from(
      menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    );
    expect(focusable.length).toBeGreaterThan(0);
    focusable[0].focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(focusable[focusable.length - 1]);
  });

  it("inerts and hides all body siblings of the navbar when the menu is open", () => {
    // Verifies that coverage is not limited to named landmarks: any body-level
    // sibling (main, footer, aside, consent banner, etc.) gets inerted.
    const main = document.createElement("main");
    main.id = "main-content";
    const footer = document.createElement("footer");
    const aside = document.createElement("aside");
    document.body.appendChild(main);
    document.body.appendChild(footer);
    document.body.appendChild(aside);

    try {
      renderNavbar();
      fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
      expect(main.hasAttribute("inert")).toBe(true);
      expect(main.getAttribute("aria-hidden")).toBe("true");
      expect(footer.hasAttribute("inert")).toBe(true);
      expect(footer.getAttribute("aria-hidden")).toBe("true");
      expect(aside.hasAttribute("inert")).toBe(true);
      expect(aside.getAttribute("aria-hidden")).toBe("true");

      fireEvent.click(screen.getByRole("button", { name: /Close menu/i }));
      expect(main.hasAttribute("inert")).toBe(false);
      expect(main.getAttribute("aria-hidden")).toBeNull();
      expect(footer.hasAttribute("inert")).toBe(false);
      expect(footer.getAttribute("aria-hidden")).toBeNull();
      expect(aside.hasAttribute("inert")).toBe(false);
      expect(aside.getAttribute("aria-hidden")).toBeNull();
    } finally {
      document.body.removeChild(main);
      document.body.removeChild(footer);
      document.body.removeChild(aside);
    }
  });

  it("inerts body siblings even when some named landmarks are absent", () => {
    // No #main-content — only a footer. The body-children loop must still
    // cover whatever siblings exist rather than bailing out on a missing ID.
    const footer = document.createElement("footer");
    document.body.appendChild(footer);

    try {
      renderNavbar();
      fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
      expect(footer.hasAttribute("inert")).toBe(true);
      expect(footer.getAttribute("aria-hidden")).toBe("true");

      fireEvent.click(screen.getByRole("button", { name: /Close menu/i }));
      expect(footer.hasAttribute("inert")).toBe(false);
      expect(footer.getAttribute("aria-hidden")).toBeNull();
    } finally {
      document.body.removeChild(footer);
    }
  });

  it("clicking a nav link closes the menu without moving focus to the hamburger", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    const links = screen.getAllByRole("link", { name: /About/i });
    const mobileLink = links.find((l) => l.closest("#mobile-menu"));
    expect(mobileLink).toBeTruthy();
    fireEvent.click(mobileLink!);
    expect(document.getElementById("mobile-menu")?.hasAttribute("hidden")).toBe(true);
    expect(document.activeElement).not.toBe(screen.queryByRole("button", { name: /Open menu/i }));
  });
});
