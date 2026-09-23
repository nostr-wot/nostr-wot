"use client";

import { GraphProvider } from "@/contexts/GraphContext";
import { GraphDataProvider } from "@/contexts/GraphDataContext";
import { GraphLayout } from "./layout";

export default function GraphPlayground({ rootPubkey, sourceKind, extension }: { rootPubkey: string; sourceKind: "local" | "extension"; extension?: import("@/lib/graph/extension").GraphExtension }) {
  return (
    <GraphProvider key={rootPubkey}>
      <GraphDataProvider rootPubkey={rootPubkey} sourceKind={sourceKind} extension={extension}>
        <div className="h-[calc(100vh-200px)] min-h-[500px] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <GraphLayout />
        </div>
      </GraphDataProvider>
    </GraphProvider>
  );
}
