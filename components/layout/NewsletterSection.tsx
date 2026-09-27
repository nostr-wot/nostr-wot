import {NewsletterForm} from "@/components/ui";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/routing";

export const NewsletterSection = ({ compact = false }: { compact?: boolean }) => {
    const t = useTranslations("home");
    const common = useTranslations("common");
    return (
        <div className={compact ? "rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50" : "mt-20 pt-12 border-t border-gray-200 dark:border-gray-800"}>
            <div className={compact ? "text-left" : "text-center max-w-xl mx-auto"}>
                <h3 className={`${compact ? "text-lg" : "text-2xl"} font-bold mb-3 text-gray-900 dark:text-white`}>{t("newsletter.title")}</h3>
                <p className={`${compact ? "text-sm" : ""} text-gray-600 dark:text-gray-400 mb-6`}>{t("newsletter.description")}</p>
                <NewsletterForm stacked={compact} />
                <Link href="/newsletters" className="mt-5 inline-block text-sm text-primary underline underline-offset-4">{common("nav.newsletters")}</Link>
            </div>
        </div>
    )
}
