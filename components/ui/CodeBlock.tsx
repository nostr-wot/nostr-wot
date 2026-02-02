import { HTMLAttributes } from "react";

interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
}

export function CodeBlock({
  code,
  language,
  className = "",
  ...props
}: CodeBlockProps) {
  return (
    <div
      className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      {language && (
        <div className="px-4 py-2 bg-gray-800 text-gray-400 text-xs font-mono border-b border-gray-700">
          {language}
        </div>
      )}
      <pre className="p-4 text-sm overflow-x-auto">
        <code className="text-gray-100 font-mono">{code}</code>
      </pre>
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
      className={`bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm font-mono ${className}`}
      {...props}
    >
      {children}
    </code>
  );
}

export default CodeBlock;
