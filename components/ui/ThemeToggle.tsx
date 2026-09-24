"use client";

import { useTranslations } from "next-intl";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { SunIcon, MoonIcon } from "@/components/icons";

export function ThemeToggle() {
  const u = useTranslations("ui");
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Cycle through: system -> light -> dark -> system
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  // Prevent hydration mismatch by rendering a placeholder during SSR
  if (!mounted) {
    return (
      <button
        className="cursor-pointer p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={u("toggleTheme")}
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={u("currentTheme", { theme: u(theme) })}
      title={u("theme", { theme: u(theme) })}
    >
      {resolvedTheme === "dark" ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </button>
  );
}
