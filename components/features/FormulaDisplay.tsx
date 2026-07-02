"use client";

export default function FormulaDisplay() {
  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-12 text-white">
      <div className="text-center mb-10">
        <p className="text-gray-400 text-sm mb-4 uppercase tracking-wider">The Vault</p>
        <div className="inline-block bg-gray-800/50 rounded-2xl px-8 py-6 border border-gray-700/50">
          <p className="font-mono text-lg lg:text-xl">
            <span className="text-primary">vaultKey</span>
            <span className="text-gray-500"> = </span>
            <span className="text-cyan-400">PBKDF2</span>
            <span className="text-gray-500">(</span>
            <span className="text-amber-400">password</span>
            <span className="text-gray-500">, </span>
            <span className="text-emerald-400">210k iters</span>
            <span className="text-gray-500">)</span>
          </p>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-sm mb-4">Your private keys are sealed with AES-256-GCM using a key derived from your password.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-lg font-mono">
          <span className="text-cyan-400">nsec</span>
          <span className="text-gray-500">→</span>
          <span className="text-amber-400">AES-256-GCM</span>
          <span className="text-gray-500">→</span>
          <span className="text-emerald-400">encrypted blob</span>
          <span className="text-gray-500">→</span>
          <span className="text-primary font-bold text-2xl">🔒</span>
        </div>
        <p className="text-center text-gray-500 text-sm mt-4">Auto-locks after inactivity — nothing ever leaves your browser</p>
      </div>
    </div>
  );
}
