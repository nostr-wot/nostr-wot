"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n/config";

const languageHint: Record<Locale, string> = {
  en: "You will receive the newsletter in English.",
  es: "Recibirás el boletín en español.",
  pt: "Você receberá a newsletter em português.",
  ru: "Вы будете получать рассылку на русском языке.",
  it: "Riceverai la newsletter in italiano.",
  fr: "Vous recevrez la newsletter en français.",
  de: "Du erhältst den Newsletter auf Deutsch.",
};

const storageNotice: Record<Locale, string> = {
  en: "We store your email address and preferred language to send you the newsletter.",
  es: "Guardamos tu dirección de correo electrónico y tu idioma preferido para enviarte el boletín.",
  pt: "Armazenamos seu endereço de e-mail e seu idioma preferido para enviar a newsletter.",
  ru: "Мы сохраняем ваш адрес электронной почты и предпочитаемый язык для отправки рассылки.",
  it: "Conserviamo il tuo indirizzo email e la lingua preferita per inviarti la newsletter.",
  fr: "Nous conservons votre adresse e-mail et votre langue préférée pour vous envoyer la newsletter.",
  de: "Wir speichern deine E-Mail-Adresse und bevorzugte Sprache, um dir den Newsletter zu senden.",
};

export function NewsletterForm() {
  const t = useTranslations("home.newsletter");
  const pageLocale = useLocale();
  const locale = locales.includes(pageLocale as Locale) ? pageLocale as Locale : null;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locale) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-trust-green/10 border border-trust-green/20 rounded-xl p-4 text-center">
        <p className="text-trust-green font-medium">{t("success")}</p>
        {locale && <p className="mt-2 text-sm">{languageHint[locale]}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("placeholder")}
        </label>
        <input
          id="newsletter-email"
          type="email"
          maxLength={254}
          aria-describedby="newsletter-language newsletter-storage"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          required
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          disabled={status === "loading" || !locale}
        />
        <button
          type="submit"
          disabled={status === "loading" || !locale}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === "loading" ? t("subscribing") : t("subscribe")}
        </button>
      </div>
      {locale && <p id="newsletter-language" className="mt-2 text-sm text-gray-600 dark:text-gray-300">{languageHint[locale]}</p>}
      {status === "error" && (
        <p className="mt-2 text-sm text-trust-red">{errorMessage}</p>
      )}
      {locale && <p id="newsletter-storage" className="mt-3 text-xs text-gray-500 dark:text-gray-400">{storageNotice[locale]}</p>}
    </form>
  );
}
