"use client";

import { useContext } from "react";
import { GraphDataContext } from "@/contexts/GraphDataContext";

/** All consumers share the provider's requests, cancellation and pagination state. */
export function useGraphData() {
  const context = useContext(GraphDataContext);
  if (!context) throw new Error("useGraphData must be used within GraphDataProvider");
  return context;
}
