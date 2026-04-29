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
  it("renders the logo with alt text 'offon.dev'", () => {
    renderNavbar();
    expect(screen.getByRole("img", { name: "offon.dev" })).toBeTruthy();
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
    expect(aboutLinks[0].getAttribute("href")).toBe("/about");
  });

  it("has a Handbook link pointing to /handbook", () => {
    renderNavbar();
    const links = screen.getAllByRole("link", { name: /Handbook/i });
    expect(links[0].getAttribute("href")).toBe("/handbook");
  });

  it("has a Sponsors link pointing to /sponsors", () => {
    renderNavbar();
    const links = screen.getAllByRole("link", { name: /Sponsors/i });
    expect(links[0].getAttribute("href")).toBe("/sponsors");
  });

  it("has a Community external link that opens in a new tab", () => {
    renderNavbar();
    const communityLinks = screen.getAllByRole("link", { name: /Community/i });
    expect(communityLinks[0].getAttribute("target")).toBe("_blank");
  });

  it("has a GitHub external link that opens in a new tab", () => {
    renderNavbar();
    const githubLinks = screen.getAllByRole("link", { name: /GitHub/i });
    expect(githubLinks[0].getAttribute("target")).toBe("_blank");
  });
});

// ---------------------------------------------------------------------------
// Theme toggle
// ---------------------------------------------------------------------------

describe("Navbar - theme toggle", () => {
  it("renders at least one theme toggle button", () => {
    renderNavbar();
    const buttons = screen.getAllByRole("button", { name: /Switch to/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

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
});
