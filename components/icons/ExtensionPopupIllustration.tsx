"use client";

export function ExtensionPopupIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className || "w-full h-auto"} fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        {`
          @keyframes popup-fade {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes toggle-breathe {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes badge-glow {
            0%, 100% { filter: drop-shadow(0 0 2px #10B981); }
            50% { filter: drop-shadow(0 0 6px #10B981); }
          }
          @keyframes avatar-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .popup-container { animation: popup-fade 0.6s ease-out both; transform-origin: 200px 150px; }
          .toggle-green { animation: toggle-breathe 2s ease-in-out infinite; }
          .badge-dot { animation: badge-glow 2s ease-in-out infinite; }
          .avatar-circle { animation: avatar-pulse 3s ease-in-out infinite; transform-origin: 120px 82px; }
        `}
      </style>

      <g className="popup-container">
        {/* Popup window */}
        <rect x="80" y="30" width="240" height="240" rx="16" className="fill-white dark:fill-gray-800 stroke-gray-200 dark:stroke-gray-700" strokeWidth="2" />

        {/* Title bar */}
        <rect x="80" y="30" width="240" height="36" rx="16" className="fill-gray-100 dark:fill-gray-700" />
        <rect x="80" y="50" width="240" height="16" className="fill-gray-100 dark:fill-gray-700" />
        {/* Window dots */}
        <circle cx="100" cy="48" r="5" fill="#EF4444" />
        <circle cx="116" cy="48" r="5" fill="#F59E0B" />
        <circle cx="132" cy="48" r="5" fill="#10B981" />
        {/* Title text */}
        <text x="200" y="52" textAnchor="middle" fill="#8B5CF6" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">Nostr WoT</text>

        {/* Account row */}
        <g className="avatar-circle">
          <circle cx="120" cy="82" r="14" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1.5" />
          <circle cx="120" cy="78" r="5" fill="#8B5CF6" />
          <path d="M112 88 a8 6 0 0 1 16 0" fill="#8B5CF6" />
        </g>
        <text x="142" y="79" fill="#8B5CF6" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif">alice</text>
        <text x="142" y="92" className="fill-gray-400 dark:fill-gray-500" fontSize="9" fontFamily="monospace">npub1a3f...x8kq</text>

        {/* Divider */}
        <line x1="96" y1="106" x2="304" y2="106" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />

        {/* Row 1: Identity access */}
        <g>
          {/* Key icon */}
          <rect x="96" y="116" width="28" height="28" rx="6" fill="#8B5CF6" fillOpacity="0.1" />
          <path d="M114 126 a4 4 0 1 0 -4 4 l0 6 l2 0 l0-2 l2 0 l0-2 l-2 0 l0-2 a4 4 0 0 0 2-4z" fill="#8B5CF6" strokeWidth="0" />
          <text x="132" y="134" className="fill-gray-700 dark:fill-gray-300" fontSize="11" fontFamily="system-ui, sans-serif">Identity access</text>
          {/* Toggle ON */}
          <g className="toggle-green">
            <rect x="274" y="124" width="30" height="16" rx="8" fill="#10B981" />
            <circle cx="296" cy="132" r="6" fill="white" />
          </g>
        </g>

        {/* Row 2: Trust badges */}
        <g>
          {/* Shield icon */}
          <rect x="96" y="152" width="28" height="28" rx="6" fill="#8B5CF6" fillOpacity="0.1" />
          <path d="M110 158 l-6 3 l0 6 c0 5 3 8 6 10 c3-2 6-5 6-10 l0-6 z" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M107 167 l2 2 l4-4" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="132" y="170" className="fill-gray-700 dark:fill-gray-300" fontSize="11" fontFamily="system-ui, sans-serif">Trust badges</text>
          {/* Toggle ON */}
          <g className="toggle-green">
            <rect x="274" y="160" width="30" height="16" rx="8" fill="#10B981" />
            <circle cx="296" cy="168" r="6" fill="white" />
          </g>
        </g>

        {/* Row 3: Permissions */}
        <g>
          {/* Lock icon */}
          <rect x="96" y="188" width="28" height="28" rx="6" fill="#8B5CF6" fillOpacity="0.1" />
          <rect x="105" y="198" width="10" height="8" rx="2" fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
          <path d="M107 198 l0-3 a3 3 0 0 1 6 0 l0 3" fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
          <text x="132" y="206" className="fill-gray-700 dark:fill-gray-300" fontSize="11" fontFamily="system-ui, sans-serif">Permissions</text>
          {/* Chevron */}
          <path d="M298 200 l4 4 l-4 4" fill="none" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Divider */}
        <line x1="96" y1="224" x2="304" y2="224" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />

        {/* Status bar */}
        <g>
          <g className="badge-dot">
            <circle cx="110" cy="248" r="5" fill="#10B981" />
          </g>
          <text x="122" y="252" className="fill-gray-600 dark:fill-gray-400" fontSize="11" fontFamily="system-ui, sans-serif">2 hops — Trusted</text>
        </g>
      </g>
    </svg>
  );
}
