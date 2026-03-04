"use client";

import { ChevronDownIcon } from "@/components/icons";
import ScrollReveal from "./ScrollReveal";

export interface AccordionItem {
  question: string;
  answer: string;
}

export function AccordionList({ items }: { items: AccordionItem[] }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-4">
        {items.map((item, i) => (
          <ScrollReveal key={i} animation="fade-up" delay={50 + i * 50}>
            <details className="group bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="font-semibold text-gray-900 dark:text-white pr-4">{item.question}</h3>
                <ChevronDownIcon className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className="px-6 pb-6 pt-0">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
