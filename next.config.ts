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
  async redirects() {
    // Old news URLs carried a YYYY-MM-DD- date prefix on the slug; the prefix
    // was dropped in favor of plain descriptive slugs. One entry per locale per
    // article (localePrefix: 'as-needed' means the default locale 'en' has no
    // prefix, e.g. /news/<slug>, while the rest are prefixed, e.g. /es/news/<slug>).
    const newsSlugRedirects: { locale: string; oldSlug: string; newSlug: string }[] = [
      { locale: "en", oldSlug: "2026-03-07-nip-66-gains-defensive-measures", newSlug: "nip-66-gains-defensive-measures" },
      { locale: "en", oldSlug: "2026-03-12-nip-19-gains-a-limit", newSlug: "nip-19-gains-a-limit" },
      { locale: "en", oldSlug: "2026-03-17-nip-54-switches-to-djot", newSlug: "nip-54-switches-to-djot" },
      { locale: "en", oldSlug: "2026-04-01-nip-58-renumbers-profile-badges", newSlug: "nip-58-renumbers-profile-badges" },
      { locale: "en", oldSlug: "2026-04-10-nip-34-adds-nostr-clone-urls", newSlug: "nip-34-adds-nostr-clone-urls" },
      { locale: "en", oldSlug: "2026-05-13-nip-70-rejects-reposts-of-protected-events", newSlug: "nip-70-rejects-reposts-of-protected-events" },
      { locale: "en", oldSlug: "2026-05-28-week-in-review", newSlug: "nine-pull-requests-merged-into-nips" },
      { locale: "en", oldSlug: "2026-06-06-nip-67-eose-completeness-hint", newSlug: "nip-67-eose-completeness-hint" },
      { locale: "en", oldSlug: "2026-06-28-nip-44-drops-the-65535-byte-limit", newSlug: "nip-44-drops-the-65535-byte-limit" },
      { locale: "en", oldSlug: "2026-07-16-week-in-review", newSlug: "nip-29-groups-gain-pinning-subgroups-invites-and-banner" },
      { locale: "en", oldSlug: "2026-08-01-nip-47-simplifies-core-adds-extensions", newSlug: "nip-47-simplifies-core-adds-extensions" },
      { locale: "de", oldSlug: "2026-03-07-nip-66-erhaelt-abwehrmassnahmen", newSlug: "nip-66-erhaelt-abwehrmassnahmen" },
      { locale: "de", oldSlug: "2026-03-12-nip-19-erhaelt-eine-grenze", newSlug: "nip-19-erhaelt-eine-grenze" },
      { locale: "de", oldSlug: "2026-03-17-nip-54-wechselt-zu-djot", newSlug: "nip-54-wechselt-zu-djot" },
      { locale: "de", oldSlug: "2026-04-01-nip-58-nummeriert-profile-badges-neu", newSlug: "nip-58-nummeriert-profile-badges-neu" },
      { locale: "de", oldSlug: "2026-04-10-nip-34-ergaenzt-spezifikation-fuer-nostr-clone-urls", newSlug: "nip-34-ergaenzt-spezifikation-fuer-nostr-clone-urls" },
      { locale: "de", oldSlug: "2026-05-13-nip-70-reposts-mit-geschuetzten-events-muessen-abgelehnt-werden", newSlug: "nip-70-reposts-mit-geschuetzten-events-muessen-abgelehnt-werden" },
      { locale: "de", oldSlug: "2026-05-28-wochenrueckblick", newSlug: "neun-pull-requests-in-nips-gemergt" },
      { locale: "de", oldSlug: "2026-06-06-nip-67-vollstaendigkeitshinweis-fuer-eose", newSlug: "nip-67-vollstaendigkeitshinweis-fuer-eose" },
      { locale: "de", oldSlug: "2026-06-28-nip-44-hebt-das-65535-byte-limit-auf", newSlug: "nip-44-hebt-das-65535-byte-limit-auf" },
      { locale: "de", oldSlug: "2026-07-16-wochenrueckblick", newSlug: "nip-29-gruppen-erhalten-pinnen-untergruppen-einladungen-und-banner" },
      { locale: "de", oldSlug: "2026-08-01-nip-47-vereinfacht-den-kern-und-fuegt-erweiterungen-hinzu", newSlug: "nip-47-vereinfacht-den-kern-und-fuegt-erweiterungen-hinzu" },
      { locale: "es", oldSlug: "2026-03-07-el-nip-66-gana-medidas-defensivas", newSlug: "el-nip-66-gana-medidas-defensivas" },
      { locale: "es", oldSlug: "2026-03-12-el-nip-19-gana-un-limite", newSlug: "el-nip-19-gana-un-limite" },
      { locale: "es", oldSlug: "2026-03-17-nip-54-pasa-a-djot", newSlug: "nip-54-pasa-a-djot" },
      { locale: "es", oldSlug: "2026-04-01-nip-58-renumera-profile-badges", newSlug: "nip-58-renumera-profile-badges" },
      { locale: "es", oldSlug: "2026-04-10-nip-34-anade-especificacion-de-urls-nostr", newSlug: "nip-34-anade-especificacion-de-urls-nostr" },
      { locale: "es", oldSlug: "2026-05-13-nip-70-reposts-con-eventos-protegidos-deben-rechazarse", newSlug: "nip-70-reposts-con-eventos-protegidos-deben-rechazarse" },
      { locale: "es", oldSlug: "2026-05-28-resumen-de-la-semana", newSlug: "nueve-pull-requests-fusionados-en-nips" },
      { locale: "es", oldSlug: "2026-06-06-nip-67-indicio-de-integridad-de-eose", newSlug: "nip-67-indicio-de-integridad-de-eose" },
      { locale: "es", oldSlug: "2026-06-28-nip-44-elimina-el-limite-de-65535-bytes", newSlug: "nip-44-elimina-el-limite-de-65535-bytes" },
      { locale: "es", oldSlug: "2026-07-16-resumen-semanal", newSlug: "nip-29-grupos-suman-fijado-subgrupos-invitaciones-y-banner" },
      { locale: "es", oldSlug: "2026-08-01-nip-47-simplifica-el-nucleo-y-anade-extensiones", newSlug: "nip-47-simplifica-el-nucleo-y-anade-extensiones" },
      { locale: "fr", oldSlug: "2026-03-07-le-nip-66-gagne-des-mesures-defensives", newSlug: "le-nip-66-gagne-des-mesures-defensives" },
      { locale: "fr", oldSlug: "2026-03-12-le-nip-19-gagne-une-limite", newSlug: "le-nip-19-gagne-une-limite" },
      { locale: "fr", oldSlug: "2026-03-17-nip-54-passe-a-djot", newSlug: "nip-54-passe-a-djot" },
      { locale: "fr", oldSlug: "2026-04-01-nip-58-renumerote-profile-badges", newSlug: "nip-58-renumerote-profile-badges" },
      { locale: "fr", oldSlug: "2026-04-10-nip-34-ajoute-une-specification-de-url-nostr", newSlug: "nip-34-ajoute-une-specification-de-url-nostr" },
      { locale: "fr", oldSlug: "2026-05-13-les-reposts-avec-evenements-proteges-doivent-etre-rejetes", newSlug: "les-reposts-avec-evenements-proteges-doivent-etre-rejetes" },
      { locale: "fr", oldSlug: "2026-05-28-bilan-de-la-semaine", newSlug: "neuf-pull-requests-fusionnees-dans-nips" },
      { locale: "fr", oldSlug: "2026-06-06-nip-67-indice-de-completude-pour-eose", newSlug: "nip-67-indice-de-completude-pour-eose" },
      { locale: "fr", oldSlug: "2026-06-28-nip-44-supprime-la-limite-de-65535-octets", newSlug: "nip-44-supprime-la-limite-de-65535-octets" },
      { locale: "fr", oldSlug: "2026-07-16-bilan-de-la-semaine", newSlug: "nip-29-groupes-gagnent-epinglage-sous-groupes-invitations-et-banniere" },
      { locale: "fr", oldSlug: "2026-08-01-nip-47-simplifie-le-noyau-et-ajoute-des-extensions", newSlug: "nip-47-simplifie-le-noyau-et-ajoute-des-extensions" },
      { locale: "it", oldSlug: "2026-03-07-il-nip-66-guadagna-misure-difensive", newSlug: "il-nip-66-guadagna-misure-difensive" },
      { locale: "it", oldSlug: "2026-03-12-il-nip-19-guadagna-un-limite", newSlug: "il-nip-19-guadagna-un-limite" },
      { locale: "it", oldSlug: "2026-03-17-nip-54-passa-a-djot", newSlug: "nip-54-passa-a-djot" },
      { locale: "it", oldSlug: "2026-04-01-nip-58-rinumera-profile-badges", newSlug: "nip-58-rinumera-profile-badges" },
      { locale: "it", oldSlug: "2026-04-10-nip-34-aggiunge-specifica-url-di-clonazione-nostr", newSlug: "nip-34-aggiunge-specifica-url-di-clonazione-nostr" },
      { locale: "it", oldSlug: "2026-05-13-i-repost-con-eventi-protetti-devono-essere-rifiutati", newSlug: "i-repost-con-eventi-protetti-devono-essere-rifiutati" },
      { locale: "it", oldSlug: "2026-05-28-riepilogo-della-settimana", newSlug: "nove-pull-request-uniti-in-nips" },
      { locale: "it", oldSlug: "2026-06-06-nip-67-indizio-di-completezza-per-eose", newSlug: "nip-67-indizio-di-completezza-per-eose" },
      { locale: "it", oldSlug: "2026-06-28-nip-44-rimuove-il-limite-di-65535-byte", newSlug: "nip-44-rimuove-il-limite-di-65535-byte" },
      { locale: "it", oldSlug: "2026-07-16-riepilogo-della-settimana", newSlug: "nip-29-gruppi-ottengono-fissaggio-sottogruppi-inviti-e-banner" },
      { locale: "it", oldSlug: "2026-08-01-nip-47-semplifica-il-nucleo-e-aggiunge-estensioni", newSlug: "nip-47-semplifica-il-nucleo-e-aggiunge-estensioni" },
      { locale: "pt", oldSlug: "2026-03-07-nip-66-ganha-medidas-defensivas", newSlug: "nip-66-ganha-medidas-defensivas" },
      { locale: "pt", oldSlug: "2026-03-12-nip-19-ganha-um-limite", newSlug: "nip-19-ganha-um-limite" },
      { locale: "pt", oldSlug: "2026-03-17-nip-54-muda-para-djot", newSlug: "nip-54-muda-para-djot" },
      { locale: "pt", oldSlug: "2026-04-01-nip-58-renumera-profile-badges", newSlug: "nip-58-renumera-profile-badges" },
      { locale: "pt", oldSlug: "2026-04-10-nip-34-adiciona-especificacao-de-url-nostr", newSlug: "nip-34-adiciona-especificacao-de-url-nostr" },
      { locale: "pt", oldSlug: "2026-05-13-nip-70-reposts-com-eventos-protegidos-devem-ser-rejeitados", newSlug: "nip-70-reposts-com-eventos-protegidos-devem-ser-rejeitados" },
      { locale: "pt", oldSlug: "2026-05-28-resumo-da-semana", newSlug: "nove-pull-requests-mesclados-no-nips" },
      { locale: "pt", oldSlug: "2026-06-06-nip-67-dica-de-integridade-do-eose", newSlug: "nip-67-dica-de-integridade-do-eose" },
      { locale: "pt", oldSlug: "2026-06-28-nip-44-elimina-o-limite-de-65535-bytes", newSlug: "nip-44-elimina-o-limite-de-65535-bytes" },
      { locale: "pt", oldSlug: "2026-07-16-resumo-da-semana", newSlug: "nip-29-grupos-ganham-fixacao-subgrupos-convites-e-banner" },
      { locale: "pt", oldSlug: "2026-08-01-nip-47-simplifica-o-nucleo-e-adiciona-extensoes", newSlug: "nip-47-simplifica-o-nucleo-e-adiciona-extensoes" },
      { locale: "ru", oldSlug: "2026-03-07-nip-66-poluchaet-mery-zaschity", newSlug: "nip-66-poluchaet-mery-zaschity" },
      { locale: "ru", oldSlug: "2026-03-12-nip-19-poluchaet-ogranichenie", newSlug: "nip-19-poluchaet-ogranichenie" },
      { locale: "ru", oldSlug: "2026-03-17-nip-54-perehodit-na-djot", newSlug: "nip-54-perehodit-na-djot" },
      { locale: "ru", oldSlug: "2026-04-01-nip-58-perenumerovyvaet-profile-badges", newSlug: "nip-58-perenumerovyvaet-profile-badges" },
      { locale: "ru", oldSlug: "2026-04-10-nip-34-dobavlyaet-specifikaciyu-url-nostr", newSlug: "nip-34-dobavlyaet-specifikaciyu-url-nostr" },
      { locale: "ru", oldSlug: "2026-05-13-reposty-s-zashchishchennymi-sobytiyami-nuzhno-otklonyat", newSlug: "reposty-s-zashchishchennymi-sobytiyami-nuzhno-otklonyat" },
      { locale: "ru", oldSlug: "2026-05-28-obzor-nedeli", newSlug: "devyat-pull-requestov-slity-v-nips" },
      { locale: "ru", oldSlug: "2026-06-06-nip-67-podskazka-o-polnote-eose", newSlug: "nip-67-podskazka-o-polnote-eose" },
      { locale: "ru", oldSlug: "2026-06-28-nip-44-snimaet-ogranichenie-v-65535-bait", newSlug: "nip-44-snimaet-ogranichenie-v-65535-bait" },
      { locale: "ru", oldSlug: "2026-07-16-itogi-nedeli", newSlug: "nip-29-gruppy-poluchili-zakreplenie-podgruppy-priglasheniya-i-banner" },
      { locale: "ru", oldSlug: "2026-08-01-nip-47-uproshchaet-yadro-i-dobavlyaet-rasshireniya", newSlug: "nip-47-uproshchaet-yadro-i-dobavlyaet-rasshireniya" },
    ];

    return newsSlugRedirects.map(({ locale, oldSlug, newSlug }) => {
      const prefix = locale === "en" ? "" : `/${locale}`;
      return {
        source: `${prefix}/news/${oldSlug}`,
        destination: `${prefix}/news/${newSlug}`,
        permanent: true,
      };
    });
  },
};

export default withNextIntl(nextConfig);
