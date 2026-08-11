"use client";

import { useTranslations } from "next-intl";
import { AccordionList, Section, SectionHeader } from "@/components/ui";

/**
 * Shared FAQ for the post-quantum pages.
 *
 * The questions are the ones people actually raise about this proposal — including the
 * uncomfortable ones about what it does not protect. Answering those here is cheaper
 * than having them raised as objections later.
 */
export default function Faq({
  namespace,
  ids,
}: {
  /** Message namespace holding `faq.title`, `faq.subtitle` and `faq.items.<id>`. */
  namespace: string;
  ids: string[];
}) {
  const t = useTranslations(namespace);

  return (
    <Section>
      <SectionHeader title={t("faq.title")} description={t("faq.subtitle")} />
      <AccordionList
        items={ids.map(id => ({
          question: t(`faq.items.${id}.q`),
          answer: t(`faq.items.${id}.a`),
        }))}
      />
    </Section>
  );
}
