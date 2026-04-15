import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Include content folder in serverless functions for blog
  outputFileTracingIncludes: {
    '/*': ['./content/**/*'],
  },
  async headers() {
    const securityHeaders = [
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
    ];

    const cspHeader = {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.googletagmanager.com https://analytics.ahrefs.com https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' wss: wss://relay.damus.io wss://relay.nostr.band wss://nos.lol wss://relay.snort.social wss://purplepag.es wss://relay.primal.net https://www.google.com https://www.google.com/recaptcha/ https://www.gstatic.com https://*.google-analytics.com https://*.analytics.google.com https://region1.google-analytics.com https://wot-oracle.mappingbitcoin.com https://analytics.ahrefs.com https://cloudflareinsights.com",
        "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ].join("; "),
    };

    return [
      {
        // CSP + security headers on pages only (not static assets)
        source: "/((?!images|_next/static|favicon|icon|apple-icon|manifest).*)",
        headers: [...securityHeaders, cspHeader],
      },
      {
        // Basic security headers on static assets (no CSP)
        source: "/images/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Cache-Control", value: "public, max-age=14400" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
