import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ConsentProvider } from '@/hooks/useConsent';
import { ADVENTURES } from '@/data/adventures';
import AdventureDetail from '@/pages/AdventureDetail';
import ChallengeDetail from '@/pages/ChallengeDetail';

vi.mock('@/components/DiscussionSection', () => ({
  DiscussionSection: () => <div data-testid="discussion" />,
}));

vi.mock('@/components/CommunitySidebar', () => ({
  CommunitySidebar: () => <div data-testid="community-sidebar" />,
}));

vi.mock('@/hooks/useLevelData', () => ({
  useLevelData: () => ({
    intro: ["Test intro paragraph"],
    backstory: ["Test backstory"],
    architecture: ["Test architecture"],
    objective: ["Objective 1"],
    toolbox: [{ name: "kubectl", description: "CLI tool" }],
    howToPlay: [{ title: "Step 1", body: "Do something" }],
    verification: { command: "./verify.sh", description: "Run verification" },
  }),
}));

const adventure = ADVENTURES[0];
const level = adventure.levels[0];

describe('AdventureDetail', () => {
  it('renders adventure title and challenge links', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    expect(screen.getByText(adventure.title)).toBeTruthy();
    expect(screen.getAllByText(/^Start Challenge/).length).toBe(adventure.levels.length);
  });

  it('shows not found for unknown adventure id', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={['/adventures/does-not-exist']}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Adventure not found' })).toBeTruthy();
  });
});

describe('ChallengeDetail', () => {
  it('renders challenge title and back link', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}/levels/${level.id}`]}>
          <Routes>
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    expect(screen.getByRole('heading', { level: 1, name: level.name })).toBeTruthy();
    expect(screen.getByRole('link', { name: adventure.title })).toBeTruthy();
  });

  it('shows not found for unknown level id', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}/levels/nope`]}>
          <Routes>
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Challenge not found' })).toBeTruthy();
  });
});

describe('AdventureDetail - heading structure', () => {
  it('renders "Challenges" as a visible h2 heading, not an overline label', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Challenges' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Find Challenges by Technology' })).toBeTruthy();
  });
});

describe('ChallengeDetail - heading structure', () => {
  it('renders "Find challenges by technology" as a visible h2 heading, not an overline label', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}/levels/${level.id}`]}>
          <Routes>
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Find Challenges by Technology' })).toBeTruthy();
  });

  it('renders "Key Learnings" as an h2 heading in structured layout', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}/levels/${level.id}`]}>
          <Routes>
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Key Learnings' })).toBeTruthy();
  });
});

describe('AdventureDetail - technology filter', () => {
  const wrapper = (
    <ConsentProvider>
      <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]}>
        <Routes>
          <Route path="/adventures/:id" element={<AdventureDetail />} />
          <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
        </Routes>
      </MemoryRouter>
    </ConsentProvider>
  );

  it('clicking a technology chip shows related challenge cards', () => {
    render(wrapper);
    const tag = adventure.tags[0];
    const chip = screen.getByRole('button', { name: tag });
    const initialOccurrences = screen.getAllByText(adventure.levels[0].name).length;
    fireEvent.click(chip);
    expect(screen.getByRole('button', { name: tag }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByText(adventure.levels[0].name).length).toBeGreaterThan(initialOccurrences);
  });

  it('clicking the same technology chip again hides the challenge cards', () => {
    render(wrapper);
    const tag = adventure.tags[0];
    const chip = screen.getByRole('button', { name: tag });
    fireEvent.click(chip);
    fireEvent.click(chip);
    expect(chip.getAttribute('aria-pressed')).toBe('false');
  });
});

describe('ChallengeDetail - technology filter', () => {
  const wrapper = (
    <ConsentProvider>
      <MemoryRouter initialEntries={[`/adventures/${adventure.id}/levels/${level.id}`]}>
        <Routes>
          <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
        </Routes>
      </MemoryRouter>
    </ConsentProvider>
  );

  it('clicking a technology chip shows related challenge cards', () => {
    render(wrapper);
    const tag = adventure.tags[0];
    const chip = screen.getByRole('button', { name: tag });
    const initialOccurrences = screen.getAllByText(adventure.levels[0].name).length;
    fireEvent.click(chip);
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByText(adventure.levels[0].name).length).toBeGreaterThan(initialOccurrences);
  });

  it('clicking the same technology chip again hides the challenge cards', () => {
    render(wrapper);
    const tag = adventure.tags[0];
    const chip = screen.getByRole('button', { name: tag });
    fireEvent.click(chip);
    fireEvent.click(chip);
    expect(chip.getAttribute('aria-pressed')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// AdventureLevelLink: learnings overflow and link hrefs
// ---------------------------------------------------------------------------

describe('AdventureLevelLink', () => {
  // adventure[0] levels all have 4 learnings — shows first 3 + "+1 more"
  it('shows only the first 3 learnings as bullet points when a level has more than 3', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    // Each level card renders level.learnings.slice(0, 3). adventure[0].levels[0] has 4 learnings.
    // The first 3 learnings of levels[0] are present; the 4th should not appear as a bullet.
    const fourthLearning = adventure.levels[0].learnings[3];
    expect(screen.queryByText(fourthLearning)).toBeNull();
  });

  it("renders '+1 more' overflow text when a level has 4 learnings", () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    const overflowItems = screen.getAllByText('+1 more');
    // All 3 levels of adventure[0] have 4 learnings, so 3 overflow items
    expect(overflowItems.length).toBe(adventure.levels.length);
  });

  it("does not render '+N more' text when all levels have 3 or fewer learnings", () => {
    const threeLearnAdventure = ADVENTURES[1]; // building-cloudhaven: all levels have 3 learnings
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${threeLearnAdventure.id}`]}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    expect(screen.queryByText(/\+\d+ more/)).toBeNull();
  });

  it('each level card links to the correct adventure level URL', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    const startLinks = screen.getAllByText(/^Start Challenge/);
    adventure.levels.forEach((lvl, i) => {
      const card = startLinks[i].closest('a');
      expect(card?.getAttribute('href')).toBe(`/adventures/${adventure.id}/levels/${lvl.id}`);
    });
  });
});
