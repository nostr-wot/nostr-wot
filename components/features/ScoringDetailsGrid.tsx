"use client";

import { ScrollReveal } from "@/components/ui";

const PERMISSION_SCOPES = [
  { hops: "Account", weight: "100%", color: "bg-emerald-500" },
  { hops: "Domain", weight: "75%", color: "bg-amber-500" },
  { hops: "Method", weight: "50%", color: "bg-orange-500" },
  { hops: "Kind", weight: "25%", color: "bg-red-500" },
];

const APPROVAL_MODES = [
  { signal: "Ask every time", bonus: "Prompt", desc: "A popup for every request" },
  { signal: "Remember for session", bonus: "Auto", desc: "Approve until the browser closes" },
  { signal: "Always allow", bonus: "Silent", desc: "Trusted site, no prompts" },
  { signal: "Revoke anytime", bonus: "Instant", desc: "Pull any grant from settings" },
];

export default function ScoringDetailsGrid() {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <ScrollReveal animation="fade-up" delay={200}>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700/50 h-full">
          <h3 className="text-lg font-bold mb-2">Permission Scopes</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Grant access as narrowly as you like</p>
          <div className="space-y-4">
            {PERMISSION_SCOPES.map((item) => (
              <div key={item.hops} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">{item.hops}</div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.weight }} />
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-bold text-gray-900 dark:text-white">{item.weight}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 italic">Scope every grant per account, per site, per method, or per event kind</p>
        </div>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={300}>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700/50 h-full">
          <h3 className="text-lg font-bold mb-2">Approval Modes</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Decide how often you get asked</p>
          <div className="space-y-4">
            {APPROVAL_MODES.map((item) => (
              <div key={item.signal} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.signal}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.bonus}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
