import { type JSX } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ConsentProvider, useConsent } from "@/hooks/useConsent";
import { useClickTracking } from "@/hooks/useClickTracking";

const STORAGE_KEY = "analytics_consent";
const ls = window.localStorage;

const ClickTracker = (): null => {
  useClickTracking();
  return null;
};

function ConsentControls(): JSX.Element {
  const { grant, deny, reset } = useConsent();
  return (
    <div>
      <button onClick={grant} data-testid="grant">grant</button>
      <button onClick={deny} data-testid="deny">deny</button>
      <button onClick={reset} data-testid="reset">reset</button>
    </div>
  );
}

function Harness({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <MemoryRouter>
      <ConsentProvider>
        <ClickTracker />
        <ConsentControls />
        {children}
      </ConsentProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  ls.clear();
  document.getElementById("gtag-script")?.remove();
  // Pre-grant consent so the listener attaches synchronously on mount.
  // ConsentProvider's mount effect calls loadGtag(), which replaces window.gtag
  // with a dataLayer push shim. All click_event calls land in window.dataLayer.
  ls.setItem(STORAGE_KEY, JSON.stringify({ value: "granted", timestamp: Date.now() }));
  window.gtag = vi.fn();
  window.dataLayer = [];
});

afterEach(() => {
  vi.restoreAllMocks();
});

function findClickEvent(): unknown[] | undefined {
  const dl = (window.dataLayer ?? []) as unknown[];
  return dl.find(
    (entry): entry is unknown[] =>
      Array.isArray(entry) && entry[0] === "event" && entry[1] === "click_event",
  );
}

describe("useClickTracking - consent gating", () => {
  it("does not fire click_event when consent is null (no stored value)", () => {
    ls.clear();
    render(
      <Harness>
        <a href="https://example.com/x">Link</a>
      </Harness>,
    );
    fireEvent.click(screen.getByText("Link"));
    expect(findClickEvent()).toBeUndefined();
  });

  it("does not fire click_event when consent is denied", () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: "denied", timestamp: Date.now() }));
    render(
      <Harness>
        <a href="https://example.com/x">Link</a>
      </Harness>,
    );
    fireEvent.click(screen.getByText("Link"));
    expect(findClickEvent()).toBeUndefined();
  });

  it("removes the listener when consent flips from granted to denied", () => {
    render(
      <Harness>
        <a href="https://example.com/x">Link</a>
      </Harness>,
    );
    // Click the deny button. revokeGtag() clears dataLayer and replaces gtag
    // with a no-op, then the hook's cleanup removes the document listener.
    fireEvent.click(screen.getByTestId("deny"));
    fireEvent.click(screen.getByText("Link"));
    expect(findClickEvent()).toBeUndefined();
  });
});

describe("useClickTracking - anchor clicks", () => {
  it("fires click_event with click_text, click_url, click_element, click_page", () => {
    render(
      <Harness>
        <a href="https://example.com/path">Visit Example</a>
      </Harness>,
    );
    fireEvent.click(screen.getByText("Visit Example"));

    const call = findClickEvent();
    expect(call).toBeDefined();
    expect(call?.[0]).toBe("event");
    expect(call?.[1]).toBe("click_event");
    expect(call?.[2]).toMatchObject({
      click_text: "Visit Example",
      click_url: "https://example.com/path",
      click_element: "a",
    });
    expect(typeof (call?.[2] as { click_page: string }).click_page).toBe("string");
  });

  it("walks up the DOM to the closest anchor when an inner element is clicked", () => {
    render(
      <Harness>
        <a href="https://example.com/icon">
          <span data-testid="icon-child">icon</span>
          <span>Outer Label</span>
        </a>
      </Harness>,
    );
    fireEvent.click(screen.getByTestId("icon-child"));
    const call = findClickEvent();
    expect(call?.[2]).toMatchObject({
      click_url: "https://example.com/icon",
      click_element: "a",
    });
  });

  it("falls back to data-url then 'no-url' when an anchor has no href", () => {
    render(
      <Harness>
        <a data-url="custom://target">No Href</a>
      </Harness>,
    );
    fireEvent.click(screen.getByText("No Href"));
    expect(findClickEvent()?.[2]).toMatchObject({ click_url: "custom://target" });
  });
});

describe("useClickTracking - button clicks", () => {
  it("fires click_event for a <button> with data-url", () => {
    render(
      <Harness>
        <button data-url="action://save">Save Now</button>
      </Harness>,
    );
    fireEvent.click(screen.getByText("Save Now"));
    expect(findClickEvent()?.[2]).toMatchObject({
      click_text: "Save Now",
      click_url: "action://save",
      click_element: "button",
    });
  });

  it("uses 'no-url' when a button has no data-url", () => {
    render(
      <Harness>
        <button>Bare Button</button>
      </Harness>,
    );
    fireEvent.click(screen.getByText("Bare Button"));
    expect(findClickEvent()?.[2]).toMatchObject({
      click_url: "no-url",
      click_element: "button",
    });
  });

  it("falls back to aria-label when the tracked element has no text", () => {
    render(
      <Harness>
        <button aria-label="Close" data-url="action://close" />
      </Harness>,
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(findClickEvent()?.[2]).toMatchObject({
      click_text: "Close",
      click_url: "action://close",
    });
  });

  it("uses 'unknown' when the tracked element has neither text nor aria-label", () => {
    render(
      <Harness>
        <button data-testid="empty-btn" data-url="action://empty" />
      </Harness>,
    );
    fireEvent.click(screen.getByTestId("empty-btn"));
    expect(findClickEvent()?.[2]).toMatchObject({
      click_text: "unknown",
      click_url: "action://empty",
    });
  });
});

describe("useClickTracking - non-tracked elements", () => {
  it("does not fire click_event for clicks on a <div>", () => {
    render(
      <Harness>
        <div data-testid="plain-div">plain</div>
      </Harness>,
    );
    fireEvent.click(screen.getByTestId("plain-div"));
    expect(findClickEvent()).toBeUndefined();
  });

  it("does not fire click_event for clicks on a <span> with no anchor or button ancestor", () => {
    render(
      <Harness>
        <span data-testid="plain-span">plain</span>
      </Harness>,
    );
    fireEvent.click(screen.getByTestId("plain-span"));
    expect(findClickEvent()).toBeUndefined();
  });
});

describe("useClickTracking - click_text truncation", () => {
  it("truncates click_text to 100 chars", () => {
    const longText = "x".repeat(250);
    render(
      <Harness>
        <button data-testid="long-button">{longText}</button>
      </Harness>,
    );
    fireEvent.click(screen.getByTestId("long-button"));
    const text = (findClickEvent()?.[2] as { click_text: string }).click_text;
    expect(text.length).toBe(100);
    expect(text).toBe("x".repeat(100));
  });

  it("does not modify click_text when shorter than 100 chars", () => {
    render(
      <Harness>
        <button>Short Label</button>
      </Harness>,
    );
    fireEvent.click(screen.getByText("Short Label"));
    expect((findClickEvent()?.[2] as { click_text: string }).click_text).toBe("Short Label");
  });
});

describe("useClickTracking - skip-nav exclusion", () => {
  it("does not fire click_event for the skip-nav link (href='#main-content')", () => {
    render(
      <Harness>
        <a href="#main-content">Skip to main content</a>
      </Harness>,
    );
    fireEvent.click(screen.getByText("Skip to main content"));
    expect(findClickEvent()).toBeUndefined();
  });

  it("still fires for other in-page hash links", () => {
    render(
      <Harness>
        <a href="#section-2">Jump to section</a>
      </Harness>,
    );
    fireEvent.click(screen.getByText("Jump to section"));
    expect(findClickEvent()).toBeDefined();
  });
});
