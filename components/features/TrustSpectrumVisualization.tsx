"use client";

import { AnimatedStatusDot } from "@/components/icons";

const SCOPE_NODES = [
  { hop: "Acct", label: "Account", color: "emerald" },
  { hop: "Site", label: "Domain", color: "amber" },
  { hop: "Call", label: "Method", color: "red" },
];

const ACCESS_LEVELS = [
  { color: "green" as const, label: "Allowed", range: "Sign without prompts", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/50", text: "text-emerald-700 dark:text-emerald-300", subtext: "text-emerald-600 dark:text-emerald-400" },
  { color: "yellow" as const, label: "Ask", range: "Prompt for approval", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800/50", text: "text-amber-700 dark:text-amber-300", subtext: "text-amber-600 dark:text-amber-400" },
  { color: "red" as const, label: "Blocked", range: "Reject all requests", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800/50", text: "text-red-700 dark:text-red-300", subtext: "text-red-600 dark:text-red-400" },
];

export default function TrustSpectrumVisualization() {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-200 dark:border-gray-700/50 mb-12">
      <h3 className="text-xl font-bold mb-8 text-center">How Permission Scopes Work</h3>

      {/* Visual diagram */}
      <div className="flex items-center justify-center gap-4 lg:gap-8 mb-12 overflow-x-auto pb-4">
        <div className="flex flex-col items-center shrink-0">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">You</div>
          <span className="text-xs text-gray-500 mt-2">Your grant</span>
        </div>
        {SCOPE_NODES.map((node, i) => (
          <div key={node.hop} className="contents">
            <div className="flex items-center gap-1 shrink-0">
              <div className={`w-8 lg:w-16 h-0.5 bg-gradient-to-r ${i === 0 ? "from-primary to-emerald-500" : i === 1 ? "from-emerald-500 to-amber-500" : "from-amber-500 to-red-500"}`} />
              <div className={`text-${node.color}-500`}>→</div>
            </div>
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-14 h-14 rounded-full bg-${node.color}-500/20 border-2 border-${node.color}-500 flex items-center justify-center text-${node.color}-600 dark:text-${node.color}-400 font-bold text-xs`}>
                {node.hop}
              </div>
              <span className={`text-xs text-${node.color}-600 dark:text-${node.color}-400 mt-2 font-medium`}>{node.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Access levels */}
      <div className="grid md:grid-cols-3 gap-4">
        {ACCESS_LEVELS.map((level) => (
          <div key={level.label} className={`flex items-center gap-4 p-4 rounded-xl ${level.bg} border ${level.border}`}>
            <AnimatedStatusDot color={level.color} className="w-6 h-6" />
            <div>
              <p className={`font-semibold ${level.text}`}>{level.label}</p>
              <p className={`text-sm ${level.subtext}`}>{level.range}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
