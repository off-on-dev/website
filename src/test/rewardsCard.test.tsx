import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RewardsCard } from "@/components/RewardsCard";
import type { AdventureRewards } from "@/data/adventures/types";
import { COMMUNITY_URL } from "@/data/constants";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const REWARDS: AdventureRewards = {
  deadline: "2025-12-10T09:00:00+01:00",
  eligibility: "Open to all registered community members.",
  tiers: [
    { label: "Gold", description: "First place gets a gold badge." },
    { label: "Silver", description: "Second place gets a silver badge." },
  ],
  rankingNote: "Points are awarded per submission.",
  rankingRulesUrl: "https://example.com/rules",
};

const REWARDS_MINIMAL: AdventureRewards = {
  deadline: "2026-01-01T09:00:00+01:00",
  eligibility: "Open to everyone.",
  tiers: [{ label: "Winner", description: "Top submission wins." }],
};

// ---------------------------------------------------------------------------
// Shared: always rendered regardless of props
// ---------------------------------------------------------------------------

describe("RewardsCard - heading and tiers", () => {
  it("renders the Rewards heading", () => {
    render(<RewardsCard rewards={REWARDS} />);
    expect(screen.getByRole("heading", { name: "Rewards" })).toBeTruthy();
  });

  it("renders all reward tier labels", () => {
    render(<RewardsCard rewards={REWARDS} />);
    expect(screen.getByText("Gold")).toBeTruthy();
    expect(screen.getByText("Silver")).toBeTruthy();
  });

  it("renders tier descriptions", () => {
    render(<RewardsCard rewards={REWARDS} />);
    expect(screen.getByText("First place gets a gold badge.")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Active (deadlinePast=false, default)
// ---------------------------------------------------------------------------

describe("RewardsCard - active deadline (deadlinePast=false)", () => {
  it("shows eligibility text in non-compact mode", () => {
    render(<RewardsCard rewards={REWARDS} />);
    expect(screen.getByText(REWARDS.eligibility)).toBeTruthy();
  });

  it("does not show the deadline-past message in non-compact mode", () => {
    render(<RewardsCard rewards={REWARDS} />);
    expect(screen.queryByText(/deadline has passed/i)).toBeNull();
  });

  it("shows the formatted deadline date at the bottom of non-compact mode", () => {
    render(<RewardsCard rewards={REWARDS} />);
    expect(screen.getByText("10 December 2025 at 09:00 CET")).toBeTruthy();
  });

  it("shows rankingNote in non-compact mode", () => {
    render(<RewardsCard rewards={REWARDS} />);
    expect(screen.getByText(/Points are awarded per submission/i)).toBeTruthy();
  });

  it("does not show compact deadline-past message when deadlinePast=false", () => {
    render(<RewardsCard rewards={REWARDS} compact deadlinePast={false} />);
    expect(screen.queryByText(/deadline passed/i)).toBeNull();
  });

  it("shows formatted levelDeadline in compact mode", () => {
    render(<RewardsCard rewards={REWARDS} compact levelDeadline="2026-01-15T09:00:00+01:00" />);
    expect(screen.getByText("15 January 2026 at 09:00 CET")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Past deadline (deadlinePast=true), non-compact
// ---------------------------------------------------------------------------

describe("RewardsCard - past deadline, non-compact", () => {
  it("shows the deadline-passed message", () => {
    render(<RewardsCard rewards={REWARDS} deadlinePast />);
    expect(screen.getByText(/deadline has passed/i)).toBeTruthy();
  });

  it("does not show the eligibility text", () => {
    render(<RewardsCard rewards={REWARDS} deadlinePast />);
    expect(screen.queryByText(REWARDS.eligibility)).toBeNull();
  });

  it("renders the Community Voices link", () => {
    render(<RewardsCard rewards={REWARDS} deadlinePast />);
    const link = screen.getByRole("link", { name: /community voices/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/c/community-voices/38`);
  });

  it("Community Voices link opens in a new tab", () => {
    render(<RewardsCard rewards={REWARDS} deadlinePast />);
    const link = screen.getByRole("link", { name: /community voices/i });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("Community Voices link has sr-only new-tab notice", () => {
    render(<RewardsCard rewards={REWARDS} deadlinePast />);
    const link = screen.getByRole("link", { name: /community voices/i });
    expect(link.textContent).toContain("opens in new tab");
  });
});

// ---------------------------------------------------------------------------
// Past deadline (deadlinePast=true), compact
// ---------------------------------------------------------------------------

describe("RewardsCard - past deadline, compact", () => {
  it("shows the compact deadline-passed message", () => {
    render(<RewardsCard rewards={REWARDS} compact deadlinePast />);
    expect(screen.getByText(/deadline passed/i)).toBeTruthy();
  });

  it("does not show the non-compact deadline-past prose", () => {
    render(<RewardsCard rewards={REWARDS_MINIMAL} compact deadlinePast />);
    expect(screen.queryByText(/deadline has passed, but the adventure/i)).toBeNull();
  });

  it("does not show the Community Voices link in compact mode", () => {
    render(<RewardsCard rewards={REWARDS} compact deadlinePast />);
    expect(screen.queryByRole("link", { name: /community voices/i })).toBeNull();
  });

  it("shows formatted levelDeadline at the bottom for reference when deadline is past", () => {
    render(<RewardsCard rewards={REWARDS} compact deadlinePast levelDeadline="2025-12-10T09:00:00+01:00" />);
    expect(screen.getByText("10 December 2025 at 09:00 CET")).toBeTruthy();
  });
});
