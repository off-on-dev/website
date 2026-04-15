import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConsentProvider } from '@/hooks/useConsent';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ls = window.localStorage;

function renderWithProviders(ui: React.ReactElement): ReturnType<typeof render> {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ConsentProvider>
        <HelmetProvider>
          <ThemeProvider>{ui}</ThemeProvider>
        </HelmetProvider>
      </ConsentProvider>
    </MemoryRouter>
  );
}

// Consumer that exposes theme state and toggle for assertions
function ThemeConsumer(): JSX.Element {
  const { theme, toggle } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  ls.clear();
  document.documentElement.className = '';
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useTheme - default state', () => {
  it('default theme is dark when localStorage is empty', () => {
    renderWithProviders(<ThemeConsumer />);
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
  });

  it('<html> gets the "dark" class on mount', () => {
    renderWithProviders(<ThemeConsumer />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

describe('useTheme - toggle', () => {
  it('toggle() switches from dark to light', () => {
    renderWithProviders(<ThemeConsumer />);
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('theme-value').textContent).toBe('light');
  });

  it('toggle() switches back from light to dark', () => {
    renderWithProviders(<ThemeConsumer />);
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
  });

  it('<html> class updates to "light" after toggle', () => {
    renderWithProviders(<ThemeConsumer />);
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('<html> class updates back to "dark" after two toggles', () => {
    renderWithProviders(<ThemeConsumer />);
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });
});

describe('useTheme - localStorage persistence', () => {
  it('persists "dark" in localStorage on mount', () => {
    renderWithProviders(<ThemeConsumer />);
    expect(ls.getItem('theme')).toBe('dark');
  });

  it('persists "light" in localStorage after toggle', () => {
    renderWithProviders(<ThemeConsumer />);
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(ls.getItem('theme')).toBe('light');
  });

  it('restores saved "light" theme from localStorage on mount', () => {
    ls.setItem('theme', 'light');
    renderWithProviders(<ThemeConsumer />);
    expect(screen.getByTestId('theme-value').textContent).toBe('light');
  });

  it('<html> gets "light" class when "light" is restored from localStorage', () => {
    ls.setItem('theme', 'light');
    renderWithProviders(<ThemeConsumer />);
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
