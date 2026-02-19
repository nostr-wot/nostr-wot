"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import { Input, Button } from "@/components/ui";
import { formatPubkey, npubToHex } from "@/lib/graph/transformers";
import { getTrustClass } from "@/lib/graph/colors";

export default function TrustCalculator() {
  const t = useTranslations("playground");
  const { filteredData, getProfile } = useGraph();

  const [targetInput, setTargetInput] = useState("");
  const [result, setResult] = useState<{
    found: boolean;
    node?: typeof filteredData.nodes[0];
    profile?: ReturnType<typeof getProfile>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    setError(null);
    setResult(null);

    if (!targetInput.trim()) {
      setError(t("graph.enterPubkey"));
      return;
    }

    // Convert npub to hex if necessary
    const hex = npubToHex(targetInput.trim());

    // Find node in graph
    const node = filteredData.nodes.find(
      (n) => n.id === hex || n.id.startsWith(hex)
    );

    if (node) {
      setResult({
        found: true,
        node,
        profile: getProfile(node.id),
      });
    } else {
      setResult({
        found: false,
      });
    }
  }, [targetInput, filteredData.nodes, getProfile, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCalculate();
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-sm font-medium text-white mb-3">
        {t("graph.trustCalculator")}
      </h3>

      <div className="space-y-3">
        <Input
          value={targetInput}
          onChange={(e) => setTargetInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("graph.enterPubkeyPlaceholder")}
          className="text-sm"
        />

        <Button
          variant="secondary"
          size="sm"
          onClick={handleCalculate}
          className="w-full"
        >
          {t("graph.checkTrust")}
        </Button>

        {error && (
          <p className="text-sm text-trust-red">{error}</p>
        )}

        {result && (
          <div className="mt-4 p-3 bg-gray-900 rounded-lg">
            {result.found && result.node ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {result.node.picture || result.profile?.picture ? (
                    <img
                      src={result.node.picture || result.profile?.picture}
                      alt={`${result.profile?.displayName || result.profile?.name || result.node.label || "User"} avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">
                        {(result.node.label || "?")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {result.profile?.displayName ||
                        result.profile?.name ||
                        result.node.label ||
                        "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {formatPubkey(result.node.id)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getTrustClass(
                      result.node.trustScore
                    )}`}
                  >
                    {Math.round(result.node.trustScore * 100)}% trust
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300">
                    {result.node.distance} hop{result.node.distance !== 1 ? "s" : ""}
                  </span>
                  {result.node.isMutual && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-trust-green/20 text-trust-green">
                      Mutual
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {t("graph.notInNetwork")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
