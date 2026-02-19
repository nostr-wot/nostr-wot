"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useGraphFilters } from "@/hooks/useGraphFilters";
import { useGraph } from "@/contexts/GraphContext";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { Input } from "@/components/ui";
import { formatPubkey } from "@/lib/graph/transformers";

export default function SearchBar() {
  const t = useTranslations("playground");
  const { filters, setSearchQuery, clearSearch } = useGraphFilters();
  const { filteredData } = useGraph();
  const { select, findNode } = useNodeSelection();

  const [localValue, setLocalValue] = useState(filters.searchQuery);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  // Debounced search
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalValue(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setSearchQuery(value);
        setShowResults(value.length > 0);
      }, 300);
    },
    [setSearchQuery]
  );

  // Clear search
  const handleClear = useCallback(() => {
    setLocalValue("");
    clearSearch();
    setShowResults(false);
    inputRef.current?.focus();
  }, [clearSearch]);

  // Handle result click
  const handleResultClick = useCallback(
    (pubkey: string) => {
      const node = findNode(pubkey);
      if (node) {
        select(node);
        setShowResults(false);
      }
    },
    [findNode, select]
  );

  // Close results on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get search results (limited to top 5)
  const results = filters.searchQuery
    ? filteredData.nodes
        .filter((n) => !n.isRoot)
        .slice(0, 5)
    : [];

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onFocus={() => localValue && setShowResults(true)}
          placeholder={t("graph.searchPlaceholder")}
          className="pl-10 pr-10"
        />
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Clear button */}
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
          {results.map((node) => (
            <button
              key={node.id}
              onClick={() => handleResultClick(node.id)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition-colors text-left"
            >
              {node.picture ? (
                <img
                  src={node.picture}
                  alt={`${node.label || "User"} avatar`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-sm text-gray-300">
                    {(node.label || "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {node.label || formatPubkey(node.id)}
                </p>
                <p className="text-xs text-gray-500 font-mono truncate">
                  {formatPubkey(node.id)}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {node.distance} hop{node.distance !== 1 ? "s" : ""}
              </span>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && localValue && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 z-50">
          <p className="text-sm text-gray-400 text-center">
            {t("graph.noResults")}
          </p>
        </div>
      )}
    </div>
  );
}
