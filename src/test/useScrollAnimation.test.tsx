import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

// ---------------------------------------------------------------------------
// IntersectionObserver mock
// ---------------------------------------------------------------------------

type IOCallback = IntersectionObserverCallback;

let capturedCallback: IOCallback;
const observeMock = vi.fn();
const disconnectMock = vi.fn();

beforeEach(() => {
  capturedCallback = undefined as unknown as IOCallback;
  observeMock.mockReset();
  disconnectMock.mockReset();
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn((cb: IOCallback, _options: IntersectionObserverInit) => {
      capturedCallback = cb;
      return { observe: observeMock, disconnect: disconnectMock };
    }),
  );
});

// ---------------------------------------------------------------------------
// Consumer component for DOM class tests
// ---------------------------------------------------------------------------

function ScrollTarget(): JSX.Element {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      data-testid="target"
      className={isVisible ? 'animate-in' : ''}
    />
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useScrollAnimation - ref', () => {
  it('returns a ref object', () => {
    const { result } = renderHook(() => useScrollAnimation());
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref).toHaveProperty('current');
  });
});

describe('useScrollAnimation - IntersectionObserver options', () => {
  it('creates IntersectionObserver with threshold: 0.1', () => {
    renderHook(() => useScrollAnimation());
    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.1 },
    );
  });
});

describe('useScrollAnimation - animate-in class', () => {
  it('observed element receives animate-in class when intersection fires', () => {
    render(<ScrollTarget />);
    const target = screen.getByTestId('target');

    expect(target.classList.contains('animate-in')).toBe(false);

    act(() => {
      capturedCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(target.classList.contains('animate-in')).toBe(true);
  });
});
