"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type Locale } from "@/i18n/config";

interface BlogTranslationsContextType {
  translations: Partial<Record<Locale, string>> | null;
  setTranslations: (translations: Partial<Record<Locale, string>> | null) => void;
}

const BlogTranslationsContext = createContext<BlogTranslationsContextType>({
  translations: null,
  setTranslations: () => {},
});

export function BlogTranslationsProvider({ children }: { children: ReactNode }) {
  const [translations, setTranslations] = useState<Partial<Record<Locale, string>> | null>(null);

  return (
    <BlogTranslationsContext.Provider value={{ translations, setTranslations }}>
      {children}
    </BlogTranslationsContext.Provider>
  );
}

export function useBlogTranslations() {
  return useContext(BlogTranslationsContext);
}

// Hook for blog posts to set their translations
export function useSetBlogTranslations(translations: Partial<Record<Locale, string>>) {
  const { setTranslations } = useBlogTranslations();
  // Stringify to create stable dependency (translations object reference changes each render)
  const translationsKey = JSON.stringify(translations);

  useEffect(() => {
    setTranslations(translations);
    return () => setTranslations(null); // Clear on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationsKey, setTranslations]);
}
