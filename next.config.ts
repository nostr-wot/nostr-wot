import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Include content folder in serverless functions for blog
  outputFileTracingIncludes: {
    '/*': ['./content/**/*'],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self, inline for Next.js, Google reCAPTCHA, Google Analytics, Ahrefs
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.googletagmanager.com https://analytics.ahrefs.com",
              // Styles: self, inline for styled-jsx and Tailwind
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Images: self, data URIs, HTTPS sources
              "img-src 'self' data: https: blob:",
              // Fonts: self, Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Connect: self, WebSocket relays, Google reCAPTCHA, analytics, WoT Oracle, Ahrefs
              "connect-src 'self' wss: wss://relay.damus.io wss://relay.nostr.band wss://nos.lol wss://relay.snort.social wss://purplepag.es wss://relay.primal.net https://www.google.com https://www.google.com/recaptcha/ https://www.gstatic.com https://*.google-analytics.com https://*.analytics.google.com https://region1.google-analytics.com https://wot-oracle.mappingbitcoin.com https://analytics.ahrefs.com",
              // Frames: Google reCAPTCHA
              "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/",
              // Base URI restriction
              "base-uri 'self'",
              // Form action restriction
              "form-action 'self'",
              // Upgrade insecure requests
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
