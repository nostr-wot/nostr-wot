import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Header, Footer, PageTransition } from "@/components/layout";
import { ThemeProvider } from "@/components/providers";
import { WotProvider } from "@/components/providers/WotProvider";
import { BlogTranslationsProvider } from "@/contexts/BlogTranslationsContext";
import { locales, type Locale } from "@/i18n/config";
import { getFullUrl, generateOpenGraph, generateTwitter } from "@/lib/metadata";
import "../globals.css";
import "@nostr-wot/ui/styles.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nostr-wot.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });
  const title = t("title");
  const description = t("description");
  return {
  metadataBase: new URL(BASE_URL),
  title: {
    default: title,
    template: "%s | Nostr WoT",
  },
  description,
  keywords: ["nostr wot", "nostr web of trust", "web of trust"],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: generateOpenGraph({ title, description, path: "/", locale: locale as Locale }),
  twitter: generateTwitter({ title, description }),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();
  const news = await getTranslations("news.meta");

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'system';
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
                document.documentElement.classList.add(resolved);
              })();
            `,
          }}
        />
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="vfOr4k8Sfsy9wYfOO0Nehw"
          async
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={news("title")}
          href={getFullUrl('/news/feed.xml', locale as Locale)}
        />
        <link
          rel="alternate"
          type="application/feed+json"
          title={news("title")}
          href={getFullUrl('/news/feed.json', locale as Locale)}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <BlogTranslationsProvider>
              <WotProvider>
                <Header />
                <div className="pt-16">
                  <PageTransition>{children}</PageTransition>
                </div>
                <Footer />
              </WotProvider>
            </BlogTranslationsProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
