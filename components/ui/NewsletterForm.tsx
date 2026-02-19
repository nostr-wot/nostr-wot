"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function NewsletterForm() {
  const t = useTranslations("home.newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          required
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === "loading" ? t("subscribing") : t("subscribe")}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-sm text-trust-red">{errorMessage}</p>
      )}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{t("privacy")}</p>
    </form>
  );
}
