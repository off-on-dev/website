import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ADVENTURES } from '@/data/adventures';
import AdventureDetail from '@/pages/AdventureDetail';
import ChallengeDetail from '@/pages/ChallengeDetail';

vi.mock('@/components/DiscussionSection', () => ({
  DiscussionSection: () => <div data-testid="discussion" />,
}));

const adventure = ADVENTURES[0];
const level = adventure.levels[0];

describe('AdventureDetail', () => {
  it('renders adventure title and challenge links', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(screen.getByText(adventure.title)).toBeTruthy();
    expect(screen.getAllByText('Start challenge →').length).toBe(adventure.levels.length);
  });

  it('shows not found for unknown adventure id', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/adventures/does-not-exist']}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(screen.getByText('Adventure not found.')).toBeTruthy();
  });
});

describe('ChallengeDetail', () => {
  it('renders challenge title and back link', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}/levels/${level.id}`]}>
          <Routes>
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(screen.getByRole('heading', { level: 1, name: level.name })).toBeTruthy();
    expect(screen.getByText(`← ${adventure.title}`)).toBeTruthy();
  });

  it('shows not found for unknown level id', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}/levels/nope`]}>
          <Routes>
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(screen.getByText('Challenge not found.')).toBeTruthy();
  });
});
