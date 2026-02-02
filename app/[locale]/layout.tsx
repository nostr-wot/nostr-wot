import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Header, Footer, PageTransition } from "@/components/layout";
import { locales, type Locale } from "@/i18n/config";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nostr Web of Trust",
    template: "%s | Nostr WoT",
  },
  description:
    "Open infrastructure for trust-based filtering on Nostr. Empower your apps with reputation scoring and social distance metrics.",
  keywords: [
    "nostr",
    "web of trust",
    "reputation",
    "decentralized",
    "social graph",
  ],
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
  openGraph: {
    title: "Nostr Web of Trust",
    description:
      "Open infrastructure for trust-based filtering on Nostr. Empower your apps with reputation scoring and social distance metrics.",
    url: "https://nostr-wot.com",
    siteName: "Nostr WoT",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nostr Web of Trust",
    description:
      "Open infrastructure for trust-based filtering on Nostr.",
  },
};

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

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang={locale}>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <div className="pt-16">
            <PageTransition>{children}</PageTransition>
          </div>
          <Footer />
        </NextIntlClientProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
