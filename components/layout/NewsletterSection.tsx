import {NewsletterForm} from "@/components/ui";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/routing";

export const NewsletterSection = () => {
    const t = useTranslations("home");
    const common = useTranslations("common");
    return (
        <div className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center max-w-xl mx-auto">
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t("newsletter.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t("newsletter.description")}</p>
                <NewsletterForm />
                <Link href="/newsletters" className="mt-5 inline-block text-sm text-primary underline underline-offset-4">{common("nav.newsletters")}</Link>
            </div>
        </div>
    )
}
