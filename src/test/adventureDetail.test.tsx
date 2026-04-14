import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConsentProvider } from '@/hooks/useConsent';
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
      <ConsentProvider>
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
      </ConsentProvider>
    );
    expect(screen.getByText(adventure.title)).toBeTruthy();
    expect(screen.getAllByText('Start challenge →').length).toBe(adventure.levels.length);
  });

  it('shows not found for unknown adventure id', () => {
    render(
      <ConsentProvider>
      <HelmetProvider>
        <MemoryRouter initialEntries={['/adventures/does-not-exist']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
      </ConsentProvider>
    );
    expect(screen.getByText('Adventure not found.')).toBeTruthy();
  });
});

describe('ChallengeDetail', () => {
  it('renders challenge title and back link', () => {
    render(
      <ConsentProvider>
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}/levels/${level.id}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
      </ConsentProvider>
    );
    expect(screen.getByRole('heading', { level: 1, name: level.name })).toBeTruthy();
    expect(screen.getByText(`← ${adventure.title}`)).toBeTruthy();
  });

  it('shows not found for unknown level id', () => {
    render(
      <ConsentProvider>
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}/levels/nope`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
      </ConsentProvider>
    );
    expect(screen.getByText('Challenge not found.')).toBeTruthy();
  });
});

describe('AdventureDetail - technology filter', () => {
  const wrapper = (
    <ConsentProvider>
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/adventures/:id" element={<AdventureDetail />} />
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    </ConsentProvider>
  );

  it('clicking a technology chip shows related challenge cards', () => {
    render(wrapper);
    const tag = adventure.tags[0];
    const chip = screen.getByRole('button', { name: tag });
    fireEvent.click(chip);
    expect(screen.getByRole('button', { name: tag }).getAttribute('aria-pressed')).toBe('true');
    // The level names from this adventure should now appear in the related section
    expect(screen.getAllByText(adventure.levels[0].name).length).toBeGreaterThan(0);
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
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/adventures/${adventure.id}/levels/${level.id}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    </ConsentProvider>
  );

  it('clicking a technology chip shows related challenge cards', () => {
    render(wrapper);
    const tag = adventure.tags[0];
    const chip = screen.getByRole('button', { name: tag });
    fireEvent.click(chip);
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByText(adventure.levels[0].name).length).toBeGreaterThan(0);
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
