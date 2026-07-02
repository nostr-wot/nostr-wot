"use client";

import { WotExtensionMiniIcon } from "@/components/icons";

interface HowItWorksAnimationProps {
  posts: Array<{
    hop: string;
    color: string;
    label: string;
    delay: string;
    opacity?: string;
    width?: string;
  }>;
  codeComment: string;
}

export default function HowItWorksAnimation({ posts, codeComment }: HowItWorksAnimationProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
        {/* Browser mockup */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 bg-gray-800 rounded-lg px-4 py-1.5 text-sm text-gray-400 font-mono">
            nostr-client.app
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse">
            <WotExtensionMiniIcon className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Content area */}
        <div className="bg-gray-800 rounded-xl p-6 space-y-4">
          {posts.map((post) => (
            <div key={post.hop} className={`flex items-start gap-3 ${post.opacity || ""}`}>
              <div
                className={`w-10 h-10 rounded-full bg-${post.color}/20 flex items-center justify-center flex-shrink-0`}
              >
                <span className={`text-${post.color} text-xs font-bold`}>{post.hop}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-4 w-24 bg-gray-700 rounded" />
                  <span
                    className={`text-xs text-${post.color} font-medium px-2 py-0.5 bg-${post.color}/10 rounded-full animate-fade-in`}
                    style={{ animationDelay: post.delay }}
                  >
                    {post.label}
                  </span>
                </div>
                <div
                  className="h-3 w-full bg-gray-700 rounded"
                  style={{ width: post.width || "100%" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Code snippet */}
        <div className="mt-4 bg-gray-800 rounded-lg p-3 font-mono text-sm">
          <span className="text-gray-500">{codeComment}</span>
          <br />
          <span className="text-purple-400">const</span>{" "}
          <span className="text-blue-300">signed</span>{" "}
          <span className="text-white">=</span>{" "}
          <span className="text-purple-400">await</span>{" "}
          <span className="text-yellow-300">window.nostr</span>
          <span className="text-white">.</span>
          <span className="text-green-300">signEvent</span>
          <span className="text-white">(</span>
          <span className="text-orange-300">event</span>
          <span className="text-white">)</span>
        </div>
      </div>
    </div>
  );
}
