import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AvatarLink } from "@/components/AvatarLink";

describe("AvatarLink", () => {
  it("renders the avatar image when avatarUrl is provided", () => {
    render(<AvatarLink username="alice" avatarUrl="https://community.offon.dev/a/40.png" className="x" />);
    expect(document.querySelector("img")?.getAttribute("src")).toContain("community.offon.dev");
    expect(screen.getByText("alice")).toBeTruthy();
  });

  it("renders the initials chip when no avatarUrl is provided", () => {
    render(<AvatarLink username="alice" className="x" />);
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText("AL")).toBeTruthy();
  });

  it("falls back to the initials chip when the avatar image fails to load", () => {
    // Avatars are external (Discourse); a transient 5xx must not leave a broken image.
    render(<AvatarLink username="bob" avatarUrl="https://community.offon.dev/broken.png" className="x" />);
    const img = document.querySelector("img")!;
    fireEvent.error(img);
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText("BO")).toBeTruthy();
  });
});
