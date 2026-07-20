import { createContext, useContext, useEffect, useState, startTransition, type JSX } from "react";
import { THEME_STORAGE_KEY } from "@/data/constants";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

type Theme = "dark" | "light";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

/** Returns the current theme and a toggle function. Reads from and persists to localStorage. Must be used inside ThemeProvider. */
// eslint-disable-next-line react-refresh/only-export-components -- intentional: context hook + provider in one file
export const useTheme = (): { theme: Theme; toggle: () => void } => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [theme, setTheme] = useState<Theme>("dark");

  useIsomorphicLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light") {
        startTransition(() => setTheme("light"));
      }
    } catch {
      // localStorage unavailable; keep default dark theme
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    // Skip when the inline themeScript in root.tsx has already applied the
    // correct class. Mutating here triggers a brief no-class state that
    // cascades dark→light styles through every transition-all element,
    // producing in-flight contrast values that fail axe in light mode.
    if (root.classList.contains(theme)) return;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable; preference won't persist
    }
  }, [theme]);

  const toggle = (): void => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};
