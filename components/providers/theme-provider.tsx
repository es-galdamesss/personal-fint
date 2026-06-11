"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Theme = "light" | "dark";
type FontSize = "normal" | "large";
type Contrast = "normal" | "high";

interface ThemeContextValue {
  theme: Theme;
  fontSize: FontSize;
  contrast: Contrast;
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: FontSize) => void;
  setContrast: (contrast: Contrast) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_PREFIX = "fint:v1:";

function readStorage<T extends string>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored === "light" || stored === "dark") return stored as T;
    if (stored === "normal" || stored === "high") return stored as T;
    if (stored === "large") return stored as T;
  } catch {
    // localStorage throws in incognito or when disabled
  }
  return fallback;
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, value);
  } catch {
    // Silently fail — private browsing, quota, disabled
  }
}

function applyThemeClasses(theme: Theme, fontSize: FontSize, contrast: Contrast) {
  const root = document.documentElement;
  root.classList.remove("dark", "light", "high-contrast", "large-font");
  root.classList.add(theme);
  if (contrast === "high") root.classList.add("high-contrast");
  if (fontSize === "large") root.classList.add("large-font");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStorage("theme", "light"));
  const [fontSize, setFontSizeState] = useState<FontSize>(() => readStorage("fontSize", "normal"));
  const [contrast, setContrastState] = useState<Contrast>(() => readStorage("contrast", "normal"));

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeStorage("theme", next);
    applyThemeClasses(next, fontSize, contrast);
  }, [fontSize, contrast]);

  const setFontSize = useCallback((next: FontSize) => {
    setFontSizeState(next);
    writeStorage("fontSize", next);
    applyThemeClasses(theme, next, contrast);
  }, [theme, contrast]);

  const setContrast = useCallback((next: Contrast) => {
    setContrastState(next);
    writeStorage("contrast", next);
    applyThemeClasses(theme, fontSize, next);
  }, [theme, fontSize]);

  return (
    <ThemeContext.Provider value={{ theme, fontSize, contrast, setTheme, setFontSize, setContrast }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
