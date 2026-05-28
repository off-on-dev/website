import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return { ...actual, useLoaderData: vi.fn().mockReturnValue({ rewardsBelowFold: false }) };
});
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

const adventure = ADVENTURES.find((a) => a.id === "echoes-lost-in-orbit")!;
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
  });
});

describe('ChallengeDetail - heading structure', () => {
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


// ---------------------------------------------------------------------------
// AdventureLevelLink: topics pills, intro description, and link hrefs
// ---------------------------------------------------------------------------

describe('AdventureLevelLink', () => {
  it('renders topic pills for each level that has topics', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    // echoes-lost-in-orbit beginner has topics ["ArgoCD ApplicationSets", "GitOps fundamentals"]
    const firstTopic = adventure.levels[0].topics?.[0];
    if (firstTopic) {
      expect(screen.getAllByText(firstTopic).length).toBeGreaterThan(0);
    }
  });

  it('renders intro description for a level that has intro text', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    // echoes-lost-in-orbit beginner has intro[0]
    const introText = adventure.levels[0].intro?.[0];
    if (introText) {
      expect(screen.getByText(introText)).toBeInTheDocument();
    }
  });

  it('does not render "+N more" learnings overflow text', () => {
    render(
      <ConsentProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </ConsentProvider>
    );
    // Old learnings overflow pattern removed — must never appear
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
