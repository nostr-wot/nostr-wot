"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-semibold mb-4">Nostr Web of Trust</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Open infrastructure for trust-based filtering on Nostr.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("footer.product")}</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/mappingbitcoin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary"
                >
                  WoT Extension
                </a>
              </li>
              <li>
                <Link href="/oracle" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary">
                  WoT Oracle
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("footer.resources")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary">
                  {t("nav.docs")}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/mappingbitcoin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/media-kit" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary">
                  {t("footer.mediaKit")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 text-sm hover:text-primary">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>
            {t("footer.copyright")} |{" "}
            <Link href="/privacy" className="hover:text-primary">
              {t("footer.privacy")}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
