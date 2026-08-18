"use client";

import { HTMLAttributes, useState, useMemo } from "react";

interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  showCopy?: boolean;
  showLineNumbers?: boolean;
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// Token types for syntax highlighting
type TokenType =
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "function"
  | "property"
  | "operator"
  | "punctuation"
  | "variable"
  | "text";

interface Token {
  type: TokenType;
  value: string;
}

// Simple JavaScript/TypeScript tokenizer
function tokenizeJS(code: string): Token[] {
  const tokens: Token[] = [];
  const keywords = new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "do", "switch", "case", "break", "continue", "new", "this", "class",
    "extends", "import", "export", "default", "from", "async", "await",
    "try", "catch", "finally", "throw", "typeof", "instanceof", "in", "of",
    "true", "false", "null", "undefined"
  ]);

  let i = 0;
  while (i < code.length) {
    // Single-line comment
    if (code.slice(i, i + 2) === "//") {
      let end = code.indexOf("\n", i);
      if (end === -1) end = code.length;
      tokens.push({ type: "comment", value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Multi-line comment
    if (code.slice(i, i + 2) === "/*") {
      let end = code.indexOf("*/", i + 2);
      if (end === -1) end = code.length;
      else end += 2;
      tokens.push({ type: "comment", value: code.slice(i, end) });
      i = end;
      continue;
    }

    // String (double quotes)
    if (code[i] === '"') {
      let end = i + 1;
      while (end < code.length && code[end] !== '"') {
        if (code[end] === "\\") end++;
        end++;
      }
      tokens.push({ type: "string", value: code.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

    // String (single quotes)
    if (code[i] === "'") {
      let end = i + 1;
      while (end < code.length && code[end] !== "'") {
        if (code[end] === "\\") end++;
        end++;
      }
      tokens.push({ type: "string", value: code.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

    // Template literal
    if (code[i] === "`") {
      let end = i + 1;
      while (end < code.length && code[end] !== "`") {
        if (code[end] === "\\") end++;
        end++;
      }
      tokens.push({ type: "string", value: code.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

    // Number
    if (/\d/.test(code[i])) {
      let end = i;
      while (end < code.length && /[\d.xXa-fA-F]/.test(code[end])) end++;
      tokens.push({ type: "number", value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Word (keyword, function, variable, property)
    if (/[a-zA-Z_$]/.test(code[i])) {
      let end = i;
      while (end < code.length && /[a-zA-Z0-9_$]/.test(code[end])) end++;
      const word = code.slice(i, end);

      // Check if it's a function call
      let nextNonSpace = end;
      while (nextNonSpace < code.length && /\s/.test(code[nextNonSpace])) nextNonSpace++;

      if (keywords.has(word)) {
        tokens.push({ type: "keyword", value: word });
      } else if (code[nextNonSpace] === "(") {
        tokens.push({ type: "function", value: word });
      } else if (i > 0 && code[i - 1] === ".") {
        tokens.push({ type: "property", value: word });
      } else {
        tokens.push({ type: "variable", value: word });
      }
      i = end;
      continue;
    }

    // Operators
    if (/[+\-*/%=<>!&|^~?:]/.test(code[i])) {
      let end = i;
      while (end < code.length && /[+\-*/%=<>!&|^~?:]/.test(code[end])) end++;
      tokens.push({ type: "operator", value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Punctuation
    if (/[{}[\]();,.]/.test(code[i])) {
      tokens.push({ type: "punctuation", value: code[i] });
      i++;
      continue;
    }

    // Whitespace and other
    tokens.push({ type: "text", value: code[i] });
    i++;
  }

  return tokens;
}

// Color mapping for tokens
const tokenColors: Record<TokenType, string> = {
  keyword: "text-purple-400",
  string: "text-emerald-400",
  number: "text-amber-400",
  comment: "text-gray-500 italic",
  function: "text-blue-400",
  property: "text-cyan-400",
  operator: "text-pink-400",
  punctuation: "text-gray-400",
  variable: "text-gray-100",
  text: "text-gray-100",
};

function HighlightedCode({ code, language }: { code: string; language?: string }) {
  const highlighted = useMemo(() => {
    if (!language || !["javascript", "js", "typescript", "ts", "jsx", "tsx"].includes(language.toLowerCase())) {
      return <span>{code}</span>;
    }

    const tokens = tokenizeJS(code);
    return (
      <>
        {tokens.map((token, i) => (
          <span key={i} className={tokenColors[token.type]}>
            {token.value}
          </span>
        ))}
      </>
    );
  }, [code, language]);

  return <>{highlighted}</>;
}

export function CodeBlock({
  code,
  language,
  showCopy = true,
  showLineNumbers = false,
  className = "",
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const lines = code.split("\n");

  return (
    <div
      className={`relative group bg-gray-950 rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl ${className}`}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-lg shadow-red-500/20" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-lg shadow-yellow-500/20" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-lg shadow-green-500/20" />
          </div>
          {language && (
            <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">{language}</span>
          )}
        </div>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-gray-700/50"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        {/*
          `text-gray-100` is load-bearing, not decoration. The block is dark in
          BOTH themes (bg-gray-950 has no light variant), but only JS and TS get
          per-token colours from `HighlightedCode`. Every other language falls
          through to a bare <span>, which inherits whatever the page's text
          colour is: near-black in light mode, on a near-black block. The guides
          are almost entirely ```bash fences, so in light mode they rendered
          invisible. Setting a light default here means untokenized code is
          always readable, and the token classes still override it.
        */}
        <pre className="p-5 text-sm leading-relaxed">
          <code className="font-mono text-gray-100">
            {showLineNumbers ? (
              <table className="border-collapse w-full">
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="hover:bg-gray-800/30">
                      <td className="pr-4 pl-1 text-gray-600 text-right select-none align-top w-8 border-r border-gray-800/50 mr-4">
                        {i + 1}
                      </td>
                      <td className="whitespace-pre pl-4">
                        <HighlightedCode code={line} language={language} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <HighlightedCode code={code} language={language} />
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

interface InlineCodeProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function InlineCode({
  children,
  className = "",
  ...props
}: InlineCodeProps) {
  return (
    <code
      className={`bg-gray-100 dark:bg-gray-800 text-primary dark:text-primary px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </code>
  );
}

// Terminal-style code block for shell commands
interface TerminalBlockProps extends HTMLAttributes<HTMLDivElement> {
  commands: string[];
  showCopy?: boolean;
}

export function TerminalBlock({
  commands,
  showCopy = true,
  className = "",
  ...props
}: TerminalBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const commandsOnly = commands
        .filter(cmd => !cmd.trim().startsWith("#"))
        .join("\n");
      await navigator.clipboard.writeText(commandsOnly);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={`relative group bg-gray-950 rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl ${className}`}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-lg shadow-red-500/20" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-lg shadow-yellow-500/20" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-lg shadow-green-500/20" />
          </div>
          <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">terminal</span>
        </div>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-gray-700/50"
            aria-label="Copy commands"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Commands */}
      <div className="p-5 font-mono text-sm space-y-1">
        {commands.map((cmd, i) => (
          <div key={i} className="flex">
            {cmd.trim().startsWith("#") ? (
              <span className="text-gray-500 italic">{cmd}</span>
            ) : (
              <>
                <span className="text-emerald-400 select-none mr-3">$</span>
                <span className="text-gray-100">{cmd}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CodeBlock;
