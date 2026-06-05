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
    const logoLink = screen.getByRole("link", { name: "offon.dev" });
    const imgs = logoLink.querySelectorAll("img");
    expect(imgs).toHaveLength(2);
    expect(imgs[0].getAttribute("aria-hidden")).toBe("true");
    expect(imgs[1].getAttribute("aria-hidden")).toBe("true");
  });

  it("logo link navigates to home (/)", () => {
    renderNavbar();
    const logoLink = screen.getByRole("link", { name: "offon.dev" });
    expect(logoLink.getAttribute("href")).toBe("/");
  });
});

// ---------------------------------------------------------------------------
// Desktop navigation links
// ---------------------------------------------------------------------------

describe("Navbar - desktop navigation", () => {
  it("contains a nav landmark labelled 'Main'", () => {
    renderNavbar();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
  });

  it("has a Home link", () => {
    renderNavbar();
    const nav = screen.getByRole("navigation", { name: "Main" });
    // There may be duplicates in mobile menu; at least one must be present
    expect(within(nav).getAllByRole("link", { name: /Home/i }).length).toBeGreaterThan(0);
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

  it("mobile menu drawer is not rendered initially", () => {
    renderNavbar();
    expect(document.getElementById("mobile-menu")).toBeNull();
  });

  it("clicking the hamburger opens the mobile menu", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    expect(document.getElementById("mobile-menu")).toBeTruthy();
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
    expect(document.getElementById("mobile-menu")).toBeNull();
  });

  it("mobile menu contains navigation links when open", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    const mobileMenu = document.getElementById("mobile-menu");
    expect(mobileMenu).toBeTruthy();
    const mobileNav = within(mobileMenu!);
    expect(mobileNav.getByRole("link", { name: /Home/i })).toBeTruthy();
    expect(mobileNav.getByRole("link", { name: /About/i })).toBeTruthy();
  });

  it("mobile menu has aria-controls pointing to 'mobile-menu'", () => {
    renderNavbar();
    const hamburger = screen.getByRole("button", { name: /Open menu/i });
    expect(hamburger.getAttribute("aria-controls")).toBe("mobile-menu");
  });

  it("pressing Escape closes the mobile menu", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    expect(document.getElementById("mobile-menu")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.getElementById("mobile-menu")).toBeNull();
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

  it("sets aria-hidden on main content when menu is open", () => {
    const main = document.createElement("main");
    main.id = "main-content";
    document.body.appendChild(main);

    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
    expect(main.getAttribute("aria-hidden")).toBe("true");
    expect(main.hasAttribute("inert")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Close menu/i }));
    expect(main.getAttribute("aria-hidden")).toBeNull();
    expect(main.hasAttribute("inert")).toBe(false);

    document.body.removeChild(main);
  });
});
