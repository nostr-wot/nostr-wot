"use client";

import { useEffect, useRef } from "react";

import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const restoringHistory = useRef(false);

  useEffect(() => {
    const onPopState = () => { restoringHistory.current = window.location.pathname !== previousPath.current; };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (restoringHistory.current) {
      restoringHistory.current = false;
      return;
    }
    // New pages start at the top; deep links keep their requested section.
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    // Animate the existing wrapper, preserving nested layouts and their state.
    // The resting HTML is visible even before hydration or without JavaScript.
    const animation = container.current?.animate(
      [{ opacity: 0.6 }, { opacity: 1 }],
      { duration: 220, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
    const onPreferenceChange = () => { if (preference.matches) animation?.cancel(); };
    preference.addEventListener("change", onPreferenceChange);
    return () => {
      animation?.cancel();
      preference.removeEventListener("change", onPreferenceChange);
    };
  }, [pathname]);

  return <div ref={container} className="page-transition">{children}</div>;
}
