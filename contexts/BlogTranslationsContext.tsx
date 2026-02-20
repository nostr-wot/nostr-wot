"use client";

import { createContext, useContext, ReactNode } from "react";
import { type Locale } from "@/i18n/config";

interface BlogTranslationsContextType {
  translations: Partial<Record<Locale, string>> | null;
}

const BlogTranslationsContext = createContext<BlogTranslationsContextType>({
  translations: null,
});

export function BlogTranslationsProvider({
  children,
  translations,
}: {
  children: ReactNode;
  translations: Partial<Record<Locale, string>>;
}) {
  return (
    <BlogTranslationsContext.Provider value={{ translations }}>
      {children}
    </BlogTranslationsContext.Provider>
  );
}

export function useBlogTranslations() {
  return useContext(BlogTranslationsContext);
}
