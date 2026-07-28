// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// ChallengesFilter.vue unit tests
//
// The component renders two filter UIs:
//   - Desktop: a role="radiogroup" for difficulty (pill buttons with role="radio")
//     and a role="group" for technology tags (aria-pressed buttons)
//   - Mobile/tablet: two dropdown triggers with aria-controls pointing to
//     role="group" panels with aria-pressed items
//
// Both sections are always in the DOM regardless of viewport - media-query CSS
// classes are irrelevant in happy-dom. Tests target elements by their ARIA
// roles and attributes, not by CSS visibility, so they break when ARIA is removed.
//
// URL sync is via window.history.replaceState; tests spy on that call.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import ChallengesFilter from "@/components/ChallengesFilter.vue";
import type { ChallengeEntry } from "@/lib/challenges";
import { DIFFICULTIES } from "@/lib/challenges";

// ── fixtures ──────────────────────────────────────────────────────────────────

const makeEntry = (
  overrides: Partial<ChallengeEntry> & { levelId: string; difficulty: string },
): ChallengeEntry => ({
  name: `Level ${overrides.levelId}`,
  learnings: ["<p>Learn something</p>"],
  adventureId: "test-adventure",
  adventureTitle: "Test Adventure",
  adventureTags: ["Git"],
  isLive: false,
  url: `/adventures/test-adventure/levels/${overrides.levelId}/`,
  ...overrides,
});

const mockEntries: ChallengeEntry[] = [
  makeEntry({ levelId: "beginner-01", difficulty: "Beginner", adventureTags: ["Git", "GitHub"] }),
  makeEntry({ levelId: "intermediate-01", difficulty: "Intermediate", adventureTags: ["Git"] }),
  makeEntry({ levelId: "expert-01", difficulty: "Expert", adventureTags: ["GitHub"] }),
];

const mockTags = ["Git", "GitHub", "Docker"]; // Docker has no entries (useful for empty-state test)

const defaultProps = {
  entries: mockEntries,
  tags: mockTags,
  base: "/",
  initialTag: null,
  adventureCount: 2,
};

function mountFilter(
  props: Partial<typeof defaultProps> = {},
): ReturnType<typeof mount> {
  return mount(ChallengesFilter, {
    props: { ...defaultProps, ...props },
    attachTo: document.body,
  });
}

describe("ChallengesFilter", () => {
  let replaceStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    replaceStateSpy = vi.spyOn(window.history, "replaceState");
    // Ensure clean URL params
    window.history.replaceState(null, "", window.location.pathname);
  });

  afterEach(() => {
    replaceStateSpy.mockRestore();
  });

  // ── desktop radiogroup - structure ───────────────────────────────────────────

  describe("desktop radiogroup - structure", () => {
    it("renders a radiogroup with role='radiogroup'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true);
      wrapper.unmount();
    });

    it("radiogroup has aria-label='Filter by difficulty'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const rg = wrapper.find('[role="radiogroup"]');
      expect(rg.attributes("aria-label")).toBe("Filter by difficulty");
      wrapper.unmount();
    });

    it("renders one radio per difficulty plus the 'All Levels' radio", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      // DIFFICULTIES.length + 1 for All Levels
      expect(radios).toHaveLength(DIFFICULTIES.length + 1);
      wrapper.unmount();
    });

    it("first radio is labelled 'All Levels'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const first = wrapper.find('[role="radiogroup"]').find('[role="radio"]');
      expect(first.text()).toContain("All Levels");
      wrapper.unmount();
    });

    it("renders a radio for each difficulty in DIFFICULTIES", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radioTexts = wrapper
        .find('[role="radiogroup"]')
        .findAll('[role="radio"]')
        .map((r) => r.text());
      for (const d of DIFFICULTIES) {
        expect(radioTexts.some((t) => t.includes(d))).toBe(true);
      }
      wrapper.unmount();
    });
  });

  // ── desktop radiogroup - initial aria-checked state ─────────────────────────

  describe("desktop radiogroup - initial aria-checked state", () => {
    it("'All Levels' radio has aria-checked='true' when no difficulty is selected", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      expect(radios[0].attributes("aria-checked")).toBe("true");
      wrapper.unmount();
    });

    it("difficulty radios have aria-checked='false' when no difficulty is selected", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      for (let i = 1; i < radios.length; i++) {
        expect(radios[i].attributes("aria-checked")).toBe("false");
      }
      wrapper.unmount();
    });

    it("aria-checked is the string 'true' / 'false', not just truthy", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      expect(radios[0].attributes("aria-checked")).toBe("true");
      expect(radios[1].attributes("aria-checked")).toBe("false");
      wrapper.unmount();
    });
  });

  // ── desktop radiogroup - click selection ────────────────────────────────────

  describe("desktop radiogroup - click selection", () => {
    it("clicking a difficulty radio sets its aria-checked to 'true'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      // radios[1] = Beginner
      await radios[1].trigger("click");
      await nextTick();
      expect(radios[1].attributes("aria-checked")).toBe("true");
      wrapper.unmount();
    });

    it("clicking a difficulty radio sets All Levels aria-checked to 'false'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // select Beginner
      await nextTick();
      expect(radios[0].attributes("aria-checked")).toBe("false");
      wrapper.unmount();
    });

    it("clicking a second difficulty deselects the first", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // Beginner
      await nextTick();
      await radios[2].trigger("click"); // Intermediate
      await nextTick();
      expect(radios[1].attributes("aria-checked")).toBe("false");
      expect(radios[2].attributes("aria-checked")).toBe("true");
      wrapper.unmount();
    });

    it("clicking the active difficulty radio again toggles it off (setDifficulty toggle)", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // select Beginner
      await nextTick();
      expect(radios[1].attributes("aria-checked")).toBe("true");

      await radios[1].trigger("click"); // deselect Beginner
      await nextTick();
      // setDifficulty toggles back to null
      expect(radios[0].attributes("aria-checked")).toBe("true");
      expect(radios[1].attributes("aria-checked")).toBe("false");
      wrapper.unmount();
    });

    it("clicking All Levels radio sets it to aria-checked='true' and clears selection", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // select Beginner
      await nextTick();
      await radios[0].trigger("click"); // click All Levels (setDifficultyExact(null))
      await nextTick();
      expect(radios[0].attributes("aria-checked")).toBe("true");
      expect(radios[1].attributes("aria-checked")).toBe("false");
      wrapper.unmount();
    });
  });

  // ── desktop radiogroup - arrow key navigation ────────────────────────────────

  describe("desktop radiogroup - arrow key navigation", () => {
    it("ArrowRight focuses and selects the next radio from All Levels", async () => {
      const wrapper = mountFilter();
      await flushPromises();

      const radiogroup = wrapper.find('[role="radiogroup"]');
      const radios = radiogroup.findAll('[role="radio"]');

      // Focus the first radio (All Levels)
      (radios[0].element as HTMLElement).focus();
      expect(document.activeElement).toBe(radios[0].element);

      await radiogroup.trigger("keydown", { key: "ArrowRight" });
      await nextTick();

      // Handler focuses and clicks the next radio (radios[1] = Beginner)
      expect(document.activeElement).toBe(radios[1].element);
      expect(radios[1].attributes("aria-checked")).toBe("true");
      wrapper.unmount();
    });

    it("ArrowLeft from a difficulty radio moves back to All Levels", async () => {
      const wrapper = mountFilter();
      await flushPromises();

      const radiogroup = wrapper.find('[role="radiogroup"]');
      const radios = radiogroup.findAll('[role="radio"]');

      // Focus the second radio (Beginner)
      (radios[1].element as HTMLElement).focus();

      await radiogroup.trigger("keydown", { key: "ArrowLeft" });
      await nextTick();

      expect(document.activeElement).toBe(radios[0].element);
      expect(radios[0].attributes("aria-checked")).toBe("true");
      wrapper.unmount();
    });

    it("ArrowDown behaves like ArrowRight", async () => {
      const wrapper = mountFilter();
      await flushPromises();

      const radiogroup = wrapper.find('[role="radiogroup"]');
      const radios = radiogroup.findAll('[role="radio"]');

      (radios[0].element as HTMLElement).focus();
      await radiogroup.trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      expect(document.activeElement).toBe(radios[1].element);
      wrapper.unmount();
    });

    it("ArrowUp behaves like ArrowLeft", async () => {
      const wrapper = mountFilter();
      await flushPromises();

      const radiogroup = wrapper.find('[role="radiogroup"]');
      const radios = radiogroup.findAll('[role="radio"]');

      (radios[1].element as HTMLElement).focus();
      await radiogroup.trigger("keydown", { key: "ArrowUp" });
      await nextTick();

      expect(document.activeElement).toBe(radios[0].element);
      wrapper.unmount();
    });

    it("ArrowRight wraps from the last radio back to All Levels", async () => {
      const wrapper = mountFilter();
      await flushPromises();

      const radiogroup = wrapper.find('[role="radiogroup"]');
      const radios = radiogroup.findAll('[role="radio"]');
      const lastIdx = radios.length - 1;

      (radios[lastIdx].element as HTMLElement).focus();
      await radiogroup.trigger("keydown", { key: "ArrowRight" });
      await nextTick();

      expect(document.activeElement).toBe(radios[0].element);
      wrapper.unmount();
    });

    it("non-arrow keys do not trigger navigation", async () => {
      const wrapper = mountFilter();
      await flushPromises();

      const radiogroup = wrapper.find('[role="radiogroup"]');
      const radios = radiogroup.findAll('[role="radio"]');

      (radios[0].element as HTMLElement).focus();
      await radiogroup.trigger("keydown", { key: "Enter" });
      await nextTick();

      // No change - All Levels stays checked and focused
      expect(document.activeElement).toBe(radios[0].element);
      expect(radios[0].attributes("aria-checked")).toBe("true");
      wrapper.unmount();
    });

    it("arrow key does nothing when no radio is focused (current === -1 guard)", async () => {
      const wrapper = mountFilter();
      await flushPromises();

      const radiogroup = wrapper.find('[role="radiogroup"]');
      // Do not focus any radio - document.activeElement is body

      // Should not throw and should not change any checked state
      await radiogroup.trigger("keydown", { key: "ArrowRight" });
      await nextTick();

      const radios = radiogroup.findAll('[role="radio"]');
      expect(radios[0].attributes("aria-checked")).toBe("true");
      wrapper.unmount();
    });
  });

  // ── URL synchronisation ──────────────────────────────────────────────────────

  describe("URL synchronisation", () => {
    it("calls replaceState with ?difficulty=Beginner when Beginner is selected", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      replaceStateSpy.mockClear();

      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // Beginner
      await nextTick();

      expect(replaceStateSpy).toHaveBeenCalled();
      const url = replaceStateSpy.mock.calls[0][2] as string;
      expect(url).toContain("difficulty=Beginner");
      wrapper.unmount();
    });

    it("removes ?difficulty param when All Levels is selected after a difficulty", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // select Beginner
      await nextTick();
      replaceStateSpy.mockClear();

      await radios[1].trigger("click"); // toggle off (setDifficulty)
      await nextTick();

      const url = replaceStateSpy.mock.calls[0][2] as string;
      expect(url).not.toContain("difficulty");
      wrapper.unmount();
    });

    it("calls replaceState with ?topics= when a tag is selected", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      replaceStateSpy.mockClear();

      // Desktop tag group: find the "Git" button (has aria-pressed)
      const tagGroup = wrapper.find('[role="group"][aria-label="Filter by technology"]');
      const gitBtn = tagGroup.findAll("button").find((b) => b.text().includes("Git"));
      expect(gitBtn?.exists()).toBe(true);
      await gitBtn!.trigger("click");
      await nextTick();

      expect(replaceStateSpy).toHaveBeenCalled();
      const url = replaceStateSpy.mock.calls[0][2] as string;
      expect(url).toContain("topics=git");
      wrapper.unmount();
    });

    it("seeds activeTags from initialTag prop on mount", async () => {
      const wrapper = mountFilter({ initialTag: "Git" });
      await flushPromises();

      // With initialTag='Git', the Git tag should be active
      const tagGroup = wrapper.find('[role="group"][aria-label="Filter by technology"]');
      const gitBtn = tagGroup.findAll("button").find((b) => b.text().includes("Git"));
      expect(gitBtn?.attributes("aria-pressed")).toBe("true");
      wrapper.unmount();
    });
  });

  // ── desktop technology tag group ─────────────────────────────────────────────

  describe("desktop technology tag group", () => {
    it("renders a group with role='group' and aria-label='Filter by technology'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const tagGroup = wrapper.find('[role="group"][aria-label="Filter by technology"]');
      expect(tagGroup.exists()).toBe(true);
      wrapper.unmount();
    });

    it("renders an All Tools button with aria-pressed='true' initially", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const tagGroup = wrapper.find('[role="group"][aria-label="Filter by technology"]');
      const allTools = tagGroup.findAll("button").find((b) => b.text().includes("All Tools"));
      expect(allTools?.attributes("aria-pressed")).toBe("true");
      wrapper.unmount();
    });

    it("renders a button for each tag with aria-pressed='false' initially", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const tagGroup = wrapper.find('[role="group"][aria-label="Filter by technology"]');
      for (const tag of mockTags) {
        const tagBtn = tagGroup.findAll("button").find((b) => b.text().includes(tag));
        expect(tagBtn?.attributes("aria-pressed")).toBe("false");
      }
      wrapper.unmount();
    });

    it("clicking a tag button sets its aria-pressed to 'true'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const tagGroup = wrapper.find('[role="group"][aria-label="Filter by technology"]');
      const gitBtn = tagGroup.findAll("button").find((b) => b.text().trim() === "Git");
      await gitBtn!.trigger("click");
      await nextTick();
      expect(gitBtn!.attributes("aria-pressed")).toBe("true");
      wrapper.unmount();
    });

    it("clicking an active tag toggles it back to aria-pressed='false'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const tagGroup = wrapper.find('[role="group"][aria-label="Filter by technology"]');
      const gitBtn = tagGroup.findAll("button").find((b) => b.text().trim() === "Git");
      await gitBtn!.trigger("click"); // activate
      await nextTick();
      await gitBtn!.trigger("click"); // deactivate
      await nextTick();
      expect(gitBtn!.attributes("aria-pressed")).toBe("false");
      wrapper.unmount();
    });

    it("clicking All Tools clears active tag selections", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const tagGroup = wrapper.find('[role="group"][aria-label="Filter by technology"]');
      const gitBtn = tagGroup.findAll("button").find((b) => b.text().trim() === "Git");
      await gitBtn!.trigger("click");
      await nextTick();
      expect(gitBtn!.attributes("aria-pressed")).toBe("true");

      const allToolsBtn = tagGroup.findAll("button").find((b) => b.text().includes("All Tools"));
      await allToolsBtn!.trigger("click");
      await nextTick();
      expect(gitBtn!.attributes("aria-pressed")).toBe("false");
      expect(allToolsBtn!.attributes("aria-pressed")).toBe("true");
      wrapper.unmount();
    });
  });

  // ── filtered results ─────────────────────────────────────────────────────────

  describe("filtered results display", () => {
    it("shows the adventures slot (data-results='adventures') when no filters are active", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const adventuresGrid = wrapper.find('[data-results="adventures"]');
      // v-show="!hasFilters" → no 'display:none' when unfiltered
      expect((adventuresGrid.element as HTMLElement).style.display).not.toBe("none");
      wrapper.unmount();
    });

    it("hides the adventures slot when a filter is active", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // select Beginner
      await nextTick();

      const adventuresGrid = wrapper.find('[data-results="adventures"]');
      expect((adventuresGrid.element as HTMLElement).style.display).toBe("none");
      wrapper.unmount();
    });

    it("shows the filtered level list (data-results='levels') when a filter is active", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // select Beginner
      await nextTick();

      const levelsList = wrapper.find('[data-results="levels"]');
      expect((levelsList.element as HTMLElement).style.display).not.toBe("none");
      wrapper.unmount();
    });

    it("renders only entries matching the selected difficulty", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // Beginner
      await nextTick();

      const levelsList = wrapper.find('[data-results="levels"]');
      // Each filtered entry is a <li class="contents"> wrapping the card <a>.
      // Use li.contents to exclude nested <li> elements inside the card (learnings list).
      const items = levelsList.findAll("li.contents");
      // Only the Beginner entry should show
      expect(items).toHaveLength(1);
      wrapper.unmount();
    });

    it("shows 'No challenges match these filters.' when filtered result is empty", async () => {
      // Select 'Docker' tag - no entries have this tag
      const wrapper = mountFilter();
      await flushPromises();

      const tagGroup = wrapper.find('[role="group"][aria-label="Filter by technology"]');
      const dockerBtn = tagGroup.findAll("button").find((b) => b.text().trim() === "Docker");
      expect(dockerBtn?.exists()).toBe(true);
      await dockerBtn!.trigger("click");
      await nextTick();

      expect(wrapper.text()).toContain("No challenges match these filters.");
      wrapper.unmount();
    });

    it("shows filter summary text when a filter is active", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // Beginner
      await nextTick();

      // The filteredCountText contains difficulty name
      expect(wrapper.text()).toContain("Beginner");
      wrapper.unmount();
    });

    it("includes the filtered count in the summary text", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // Beginner - 1 matching entry
      await nextTick();

      expect(wrapper.text()).toMatch(/1 challenge/);
      wrapper.unmount();
    });
  });

  // ── aria-live announcements ───────────────────────────────────────────────────

  describe("aria-live status region", () => {
    it("renders an aria-live='polite' span", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true);
      wrapper.unmount();
    });

    it("aria-live region has aria-atomic='true'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      expect(wrapper.find('[aria-live="polite"]').attributes("aria-atomic")).toBe("true");
      wrapper.unmount();
    });

    it("live region announces when a filter is active", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // Beginner
      await nextTick();

      const liveRegion = wrapper.find('[aria-live="polite"]');
      expect(liveRegion.text()).toContain("Showing");
      wrapper.unmount();
    });
  });

  // ── mobile dropdown difficulty filter ────────────────────────────────────────

  describe("mobile dropdown - difficulty filter", () => {
    it("renders a trigger button with aria-controls='difficulty-group'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const trigger = wrapper.find('[aria-controls="difficulty-group"]');
      expect(trigger.exists()).toBe(true);
      wrapper.unmount();
    });

    it("difficulty dropdown trigger has aria-expanded='false' initially", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const trigger = wrapper.find('[aria-controls="difficulty-group"]');
      expect(trigger.attributes("aria-expanded")).toBe("false");
      wrapper.unmount();
    });

    it("difficulty-group panel has hidden attribute when closed", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const panel = wrapper.find("#difficulty-group");
      expect(panel.attributes("hidden")).toBeDefined();
      wrapper.unmount();
    });

    it("clicking the trigger opens the dropdown (removes hidden, sets aria-expanded='true')", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const trigger = wrapper.find('[aria-controls="difficulty-group"]');
      await trigger.trigger("click");
      await nextTick();

      expect(trigger.attributes("aria-expanded")).toBe("true");
      expect(wrapper.find("#difficulty-group").attributes("hidden")).toBeUndefined();
      wrapper.unmount();
    });

    it("difficulty-group panel has role='group' and aria-label='Filter by difficulty'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const panel = wrapper.find("#difficulty-group");
      expect(panel.attributes("role")).toBe("group");
      expect(panel.attributes("aria-label")).toBe("Filter by difficulty");
      wrapper.unmount();
    });

    it("dropdown panel contains All Levels option with aria-pressed", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      await wrapper.find('[aria-controls="difficulty-group"]').trigger("click");
      await nextTick();

      const panel = wrapper.find("#difficulty-group");
      const allLevelsBtn = panel.findAll("button").find((b) => b.text().includes("All Levels"));
      expect(allLevelsBtn?.exists()).toBe(true);
      expect(allLevelsBtn?.attributes("aria-pressed")).toBeDefined();
      wrapper.unmount();
    });

    it("selecting a difficulty from mobile dropdown updates the filter state", async () => {
      const wrapper = mountFilter();
      await flushPromises();

      // Open mobile difficulty dropdown
      await wrapper.find('[aria-controls="difficulty-group"]').trigger("click");
      await nextTick();

      const panel = wrapper.find("#difficulty-group");
      const beginnerBtn = panel.findAll("button").find((b) => b.text().includes("Beginner"));
      expect(beginnerBtn?.exists()).toBe(true);
      await beginnerBtn!.trigger("click");
      await nextTick();

      // Dropdown should close after selection
      expect(wrapper.find("#difficulty-group").attributes("hidden")).toBeDefined();

      // Desktop radiogroup should reflect the selection
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      const beginnerRadio = radios.find((r) => r.text().includes("Beginner"));
      expect(beginnerRadio?.attributes("aria-checked")).toBe("true");
      wrapper.unmount();
    });

    it("mobile and desktop difficulty filters share the same activeDifficulty state", async () => {
      const wrapper = mountFilter();
      await flushPromises();

      // Select via desktop radiogroup
      const radios = wrapper.find('[role="radiogroup"]').findAll('[role="radio"]');
      await radios[1].trigger("click"); // Beginner
      await nextTick();

      // Mobile trigger label should reflect active difficulty
      const trigger = wrapper.find('[aria-controls="difficulty-group"]');
      expect(trigger.text()).toContain("Beginner");
      wrapper.unmount();
    });
  });

  // ── mobile dropdown - technology tag filter ───────────────────────────────────

  describe("mobile dropdown - technology tag filter", () => {
    it("renders a trigger button with aria-controls='tags-group'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      expect(wrapper.find('[aria-controls="tags-group"]').exists()).toBe(true);
      wrapper.unmount();
    });

    it("tags-group panel has role='group' and aria-label='Filter by technology'", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const panel = wrapper.find("#tags-group");
      expect(panel.attributes("role")).toBe("group");
      expect(panel.attributes("aria-label")).toBe("Filter by technology");
      wrapper.unmount();
    });

    it("clicking the tags trigger opens its dropdown", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const trigger = wrapper.find('[aria-controls="tags-group"]');
      await trigger.trigger("click");
      await nextTick();

      expect(trigger.attributes("aria-expanded")).toBe("true");
      expect(wrapper.find("#tags-group").attributes("hidden")).toBeUndefined();
      wrapper.unmount();
    });

    it("opening tags dropdown closes difficulty dropdown if open", async () => {
      const wrapper = mountFilter();
      await flushPromises();

      // Open difficulty dropdown first
      await wrapper.find('[aria-controls="difficulty-group"]').trigger("click");
      await nextTick();
      expect(wrapper.find("#difficulty-group").attributes("hidden")).toBeUndefined();

      // Open tags dropdown - difficulty should close
      await wrapper.find('[aria-controls="tags-group"]').trigger("click");
      await nextTick();
      expect(wrapper.find("#difficulty-group").attributes("hidden")).toBeDefined();
      wrapper.unmount();
    });
  });

  // ── embedded prop ─────────────────────────────────────────────────────────────

  describe("embedded prop", () => {
    it("suppresses the sr-only h2 heading when embedded=true", async () => {
      const wrapper = mountFilter({ embedded: true });
      await flushPromises();
      // Without filters active, the "All Challenges" h2 should not render
      expect(wrapper.find("h2").exists()).toBe(false);
      wrapper.unmount();
    });

    it("renders the sr-only h2 heading when embedded is not set (default)", async () => {
      const wrapper = mountFilter({ embedded: false });
      await flushPromises();
      expect(wrapper.find("h2").exists()).toBe(true);
      wrapper.unmount();
    });
  });

  // ── seeAllHref prop ───────────────────────────────────────────────────────────

  describe("seeAllHref prop", () => {
    it("renders a 'See all adventures' link when seeAllHref is provided and no filters active", async () => {
      const wrapper = mountFilter({ seeAllHref: "/adventures/" });
      await flushPromises();
      const seeAll = wrapper.findAll("a").find((a) => a.text().includes("See all adventures"));
      expect(seeAll?.exists()).toBe(true);
      expect(seeAll?.attributes("href")).toBe("/adventures/");
      wrapper.unmount();
    });

    it("does not render 'See all adventures' link when seeAllHref is not provided", async () => {
      const wrapper = mountFilter();
      await flushPromises();
      const seeAll = wrapper.findAll("a").find((a) => a.text().includes("See all adventures"));
      expect(seeAll).toBeUndefined();
      wrapper.unmount();
    });
  });
});
