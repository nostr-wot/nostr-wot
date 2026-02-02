"use client";

export function ExtensionIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className || "w-full h-auto"} fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        {`
          @keyframes pulse-center {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          @keyframes pulse-outer {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes dash-flow {
            to { stroke-dashoffset: -12; }
          }
          @keyframes float-node {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          @keyframes blink-api {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .center-node { animation: pulse-center 2s ease-in-out infinite; transform-origin: 200px 150px; }
          .outer-node-1 { animation: float-node 3s ease-in-out infinite; transform-origin: 280px 120px; }
          .outer-node-2 { animation: float-node 3s ease-in-out infinite 0.5s; transform-origin: 120px 130px; }
          .outer-node-3 { animation: float-node 3s ease-in-out infinite 1s; transform-origin: 260px 200px; }
          .outer-node-4 { animation: float-node 3s ease-in-out infinite 1.5s; transform-origin: 140px 190px; }
          .connection-line { animation: dash-flow 1s linear infinite; }
          .api-call { animation: blink-api 2s ease-in-out infinite; }
        `}
      </style>
      {/* Browser Window */}
      <rect x="40" y="30" width="320" height="220" rx="12" className="fill-white dark:fill-gray-800 stroke-gray-200 dark:stroke-gray-700" strokeWidth="2"/>
      <rect x="40" y="30" width="320" height="36" rx="12" className="fill-gray-100 dark:fill-gray-700"/>
      <rect x="40" y="54" width="320" height="12" className="fill-gray-100 dark:fill-gray-700"/>
      {/* Browser Dots */}
      <circle cx="60" cy="48" r="6" fill="#EF4444"/>
      <circle cx="80" cy="48" r="6" fill="#F59E0B"/>
      <circle cx="100" cy="48" r="6" fill="#10B981"/>
      {/* URL Bar */}
      <rect x="130" y="40" width="180" height="16" rx="4" className="fill-white dark:fill-gray-600"/>
      {/* Extension Icon */}
      <rect x="320" y="40" width="28" height="16" rx="4" fill="#8B5CF6"/>
      <path d="M330 44 L338 48 L330 52 Z" fill="white"/>
      {/* Connection Lines - Behind nodes */}
      <line x1="200" y1="150" x2="280" y2="120" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 2" className="connection-line"/>
      <line x1="200" y1="150" x2="120" y2="130" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 2" className="connection-line"/>
      <line x1="200" y1="150" x2="260" y2="200" stroke="#A78BFA" strokeWidth="2" strokeDasharray="4 2" className="connection-line"/>
      <line x1="200" y1="150" x2="140" y2="190" stroke="#A78BFA" strokeWidth="2" strokeDasharray="4 2" className="connection-line"/>
      {/* Network Graph - Center Node */}
      <g className="center-node">
        <circle cx="200" cy="150" r="24" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="2"/>
        <circle cx="200" cy="150" r="8" fill="#8B5CF6"/>
      </g>
      {/* Outer Nodes */}
      <g className="outer-node-1">
        <circle cx="280" cy="120" r="16" fill="#A78BFA" fillOpacity="0.2" stroke="#A78BFA" strokeWidth="2"/>
        <circle cx="280" cy="120" r="6" fill="#A78BFA"/>
      </g>
      <g className="outer-node-2">
        <circle cx="120" cy="130" r="16" fill="#A78BFA" fillOpacity="0.2" stroke="#A78BFA" strokeWidth="2"/>
        <circle cx="120" cy="130" r="6" fill="#A78BFA"/>
      </g>
      <g className="outer-node-3">
        <circle cx="260" cy="200" r="12" fill="#C4B5FD" fillOpacity="0.2" stroke="#C4B5FD" strokeWidth="2"/>
        <circle cx="260" cy="200" r="4" fill="#C4B5FD"/>
      </g>
      <g className="outer-node-4">
        <circle cx="140" cy="190" r="12" fill="#C4B5FD" fillOpacity="0.2" stroke="#C4B5FD" strokeWidth="2"/>
        <circle cx="140" cy="190" r="4" fill="#C4B5FD"/>
      </g>
      {/* API Call */}
      <g className="api-call">
        <rect x="70" y="220" width="120" height="20" rx="4" fill="#8B5CF6" fillOpacity="0.1"/>
        <text x="80" y="234" fill="#8B5CF6" fontSize="10" fontFamily="monospace">window.nostr.wot</text>
      </g>
    </svg>
  );
}

export function OracleIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className || "w-full h-auto"} fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        {`
          @keyframes blink-light {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes request-flow-1 {
            0% { transform: translateX(-20px); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(0); opacity: 0; }
          }
          @keyframes request-flow-2 {
            0% { transform: translateX(-20px); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(0); opacity: 0; }
          }
          @keyframes request-flow-3 {
            0% { transform: translateX(-20px); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(0); opacity: 0; }
          }
          @keyframes response-flow {
            0% { transform: translateX(-10px); opacity: 0; }
            30% { opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translateX(0); opacity: 0; }
          }
          @keyframes pulse-stats {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          @keyframes server-activity {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          .server-light-1 { animation: blink-light 1s ease-in-out infinite; }
          .server-light-2 { animation: blink-light 1s ease-in-out infinite 0.3s; }
          .server-light-3 { animation: blink-light 1s ease-in-out infinite 0.6s; }
          .request-1 { animation: request-flow-1 2s ease-in-out infinite; }
          .request-2 { animation: request-flow-2 2s ease-in-out infinite 0.4s; }
          .request-3 { animation: request-flow-3 2s ease-in-out infinite 0.8s; }
          .response { animation: response-flow 2s ease-in-out infinite 0.5s; }
          .stats-box { animation: pulse-stats 3s ease-in-out infinite; transform-origin: 200px 260px; }
          .server-bar-1 { animation: server-activity 0.5s ease-in-out infinite; }
          .server-bar-2 { animation: server-activity 0.5s ease-in-out infinite 0.15s; }
          .server-bar-3 { animation: server-activity 0.5s ease-in-out infinite 0.3s; }
        `}
      </style>
      {/* Server Rack */}
      <rect x="140" y="40" width="120" height="180" rx="8" className="fill-white dark:fill-gray-800 stroke-gray-200 dark:stroke-gray-700" strokeWidth="2"/>
      {/* Server Units */}
      <rect x="150" y="50" width="100" height="24" rx="4" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="1"/>
      <circle cx="240" cy="62" r="4" fill="#10B981" className="server-light-1"/>
      <rect x="158" y="58" width="40" height="8" rx="2" fill="#8B5CF6" className="server-bar-1"/>

      <rect x="150" y="82" width="100" height="24" rx="4" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="1"/>
      <circle cx="240" cy="94" r="4" fill="#10B981" className="server-light-2"/>
      <rect x="158" y="90" width="40" height="8" rx="2" fill="#8B5CF6" className="server-bar-2"/>

      <rect x="150" y="114" width="100" height="24" rx="4" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="1"/>
      <circle cx="240" cy="126" r="4" fill="#10B981" className="server-light-3"/>
      <rect x="158" y="122" width="40" height="8" rx="2" fill="#8B5CF6" className="server-bar-3"/>

      <rect x="150" y="146" width="100" height="24" rx="4" fill="#8B5CF6" fillOpacity="0.1" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="4 2"/>
      <rect x="150" y="178" width="100" height="24" rx="4" fill="#8B5CF6" fillOpacity="0.1" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="4 2"/>

      {/* API Requests */}
      <g className="request-1">
        <path d="M60 80 L130 80" stroke="#8B5CF6" strokeWidth="2" markerEnd="url(#arrowPurple)"/>
        <rect x="40" y="68" width="50" height="24" rx="4" fill="#EDE9FE"/>
        <text x="50" y="84" fill="#8B5CF6" fontSize="10" fontFamily="monospace">GET</text>
      </g>
      <g className="request-2">
        <path d="M60 130 L130 130" stroke="#8B5CF6" strokeWidth="2" markerEnd="url(#arrowPurple)"/>
        <rect x="40" y="118" width="50" height="24" rx="4" fill="#EDE9FE"/>
        <text x="50" y="134" fill="#8B5CF6" fontSize="10" fontFamily="monospace">GET</text>
      </g>
      <g className="request-3">
        <path d="M60 180 L130 180" stroke="#8B5CF6" strokeWidth="2" markerEnd="url(#arrowPurple)"/>
        <rect x="40" y="168" width="50" height="24" rx="4" fill="#EDE9FE"/>
        <text x="50" y="184" fill="#8B5CF6" fontSize="10" fontFamily="monospace">GET</text>
      </g>

      {/* Response */}
      <g className="response">
        <path d="M270 100 L330 100" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrowGreen)"/>
        <rect x="300" y="88" width="70" height="24" rx="4" fill="#D1FAE5"/>
        <text x="308" y="104" fill="#10B981" fontSize="9" fontFamily="monospace">&lt;1ms</text>
      </g>

      {/* Performance Stats */}
      <g className="stats-box">
        <rect x="100" y="240" width="200" height="40" rx="8" className="fill-white dark:fill-gray-800" stroke="#8B5CF6" strokeWidth="2"/>
        <text x="130" y="265" fill="#8B5CF6" fontSize="12" fontWeight="bold">10,000+ req/s</text>
      </g>

      <defs>
        <marker id="arrowPurple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#8B5CF6"/>
        </marker>
        <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#10B981"/>
        </marker>
      </defs>
    </svg>
  );
}
