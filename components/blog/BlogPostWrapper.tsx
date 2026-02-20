"use client";

import { ReactNode } from "react";
import { BlogTranslationsProvider } from "@/contexts/BlogTranslationsContext";
import { type Locale } from "@/i18n/config";

interface BlogPostWrapperProps {
  children: ReactNode;
  translations: Partial<Record<Locale, string>>;
}

export function BlogPostWrapper({ children, translations }: BlogPostWrapperProps) {
  return (
    <BlogTranslationsProvider translations={translations}>
      {children}
    </BlogTranslationsProvider>
  );
}
