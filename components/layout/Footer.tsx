"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LogoIcon, GitHubIcon, LinkedInIcon, MediumIcon, YouTubeIcon } from "@/components/icons";

import { socialLinks } from "@/lib/social-links";

const socialIcons = { GitHub: GitHubIcon, LinkedIn: LinkedInIcon, Medium: MediumIcon, YouTube: YouTubeIcon };

export default function Footer() {
  const u = useTranslations("ui");
  const t = useTranslations("common");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-semibold text-xl text-gray-900 dark:text-white hover:no-underline mb-4">
              <LogoIcon />
              <span>Nostr WoT</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              {t("footer.tagline")}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map(({ name, href }) => {
                const Icon = socialIcons[name];
                return (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label={name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t("footer.product")}</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/download" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {u("extension")}
                </Link>
              </li>
              <li>
                <Link href="/oracle" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  WoT Oracle
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("nav.features")}
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("nav.projects")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t("footer.resources")}</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/newsletters" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("nav.newsletters")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("nav.help")}
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("nav.docs")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {u("blog")}
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("nav.guides")}
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("nav.news")}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/nostr-wot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/media-kit" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("footer.mediaKit")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t("footer.company")}</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {t("footer.copyright")}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              © {currentYear} Nostr WoT. {t("footer.allRightsReserved")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
