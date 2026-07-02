"use client";

const ACCOUNT_STATS = [
  { value: "4", label: "Accounts", color: "text-cyan-400" },
  { value: "12", label: "Approved Sites", color: "text-purple-400" },
  { value: "Unlocked", label: "Vault Status", color: "text-emerald-400" },
  { value: "<5ms", label: "Sign Latency", color: "text-amber-400" },
];

export default function DashboardPreview() {
  return (
    <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-10 shadow-2xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {ACCOUNT_STATS.map((stat) => (
          <div key={stat.label} className="text-center p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50">
            <div className={`text-2xl lg:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
        <span className="text-sm text-gray-400">Active account: satoshi</span>
        <button className="text-sm text-primary font-medium hover:underline">Switch account →</button>
      </div>
    </div>
  );
}
