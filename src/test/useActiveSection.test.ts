import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActiveSection } from '@/hooks/useActiveSection';

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
    vi.fn((cb: IOCallback) => {
      capturedCallback = cb;
      return { observe: observeMock, disconnect: disconnectMock };
    }),
  );
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEntry(id: string, isIntersecting: boolean): IntersectionObserverEntry {
  const el = document.createElement('div');
  el.id = id;
  return { target: el, isIntersecting } as IntersectionObserverEntry;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useActiveSection - initial state', () => {
  it('returns null initially', () => {
    const { result } = renderHook(() => useActiveSection(['challenges']));
    expect(result.current).toBeNull();
  });
});

describe('useActiveSection - IntersectionObserver setup', () => {
  it('creates an observer and observes matching DOM elements', () => {
    const el = document.createElement('section');
    el.id = 'challenges';
    document.body.appendChild(el);

    renderHook(() => useActiveSection(['challenges']));

    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(observeMock).toHaveBeenCalledWith(el);

    document.body.removeChild(el);
  });

  it('does not observe elements that are not in the DOM', () => {
    renderHook(() => useActiveSection(['missing-section']));
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderHook(() => useActiveSection(['challenges']));
    unmount();
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});

describe('useActiveSection - intersection tracking', () => {
  it('sets activeId when a section starts intersecting', () => {
    const el = document.createElement('section');
    el.id = 'challenges';
    document.body.appendChild(el);

    const { result } = renderHook(() => useActiveSection(['challenges']));

    act(() => {
      capturedCallback([makeEntry('challenges', true)], {} as IntersectionObserver);
    });

    expect(result.current).toBe('challenges');
    document.body.removeChild(el);
  });

  it('clears activeId when no section is intersecting', () => {
    const el = document.createElement('section');
    el.id = 'challenges';
    document.body.appendChild(el);

    const { result } = renderHook(() => useActiveSection(['challenges']));

    act(() => {
      capturedCallback([makeEntry('challenges', true)], {} as IntersectionObserver);
    });
    expect(result.current).toBe('challenges');

    act(() => {
      capturedCallback([makeEntry('challenges', false)], {} as IntersectionObserver);
    });
    expect(result.current).toBeNull();

    document.body.removeChild(el);
  });

  it('returns the first intersecting section when multiple entries fire', () => {
    const el1 = document.createElement('section');
    el1.id = 'intro';
    const el2 = document.createElement('section');
    el2.id = 'challenges';
    document.body.appendChild(el1);
    document.body.appendChild(el2);

    const { result } = renderHook(() => useActiveSection(['intro', 'challenges']));

    act(() => {
      capturedCallback(
        [makeEntry('intro', false), makeEntry('challenges', true)],
        {} as IntersectionObserver,
      );
    });

    expect(result.current).toBe('challenges');

    document.body.removeChild(el1);
    document.body.removeChild(el2);
  });
});
