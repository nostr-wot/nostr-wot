"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<Theme | null>(null);
  const pathname = usePathname();
  const theme: Theme = preference ?? (/(^|\/)labs(\/|$)/.test(pathname) ? "dark" : "system");
  const setTheme = (value: Theme) => {
    setPreference(value);
    try { localStorage.setItem("theme", value); localStorage.setItem("theme-manual", "true"); } catch {}
  };
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme && ["system", "light", "dark"].includes(savedTheme) &&
        (savedTheme !== "system" || localStorage.getItem("theme-manual") === "true")) setPreference(savedTheme);
    } catch {}
    setMounted(true);
  }, []);

  // Update resolved theme and apply class to document
  useEffect(() => {
    if (!mounted) return;

    const updateResolvedTheme = () => {
      const resolved = theme === "system" ? getSystemTheme() : theme;
      setResolvedTheme(resolved);

      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    };

    updateResolvedTheme();

    // Listen for system theme changes when in system mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateResolvedTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
