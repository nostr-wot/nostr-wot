"use client";

import { ReactNode } from "react";
import { useSetBlogTranslations } from "@/contexts/BlogTranslationsContext";
import { type Locale } from "@/i18n/config";

interface BlogPostWrapperProps {
  children: ReactNode;
  translations: Partial<Record<Locale, string>>;
}

export function BlogPostWrapper({ children, translations }: BlogPostWrapperProps) {
  // Set translations in the global context so Header's LanguageSwitcher can use them
  useSetBlogTranslations(translations);

  return <>{children}</>;
}
