import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { CodeBlock, ScrollReveal } from '@/components/ui';
import { WikiLink } from './WikiPreview';
import { Citation, BibEntry, Bibliography, Statistic, ExpertQuote } from './CitationComponents';

// Custom components for MDX
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl md:text-4xl font-bold mt-12 mb-6 text-gray-900 dark:text-white" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-gray-900 dark:text-white" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-3 text-gray-900 dark:text-white" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-lg md:text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-white" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Link
      href={props.href || '#'}
      className="text-primary hover:underline"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-6 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-gray-600 dark:text-gray-400" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const isInline = typeof props.children === 'string' && !props.children.includes('\n');
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-primary" {...props} />
      );
    }
    return <code {...props} />;
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const codeElement = props.children as any;
    const code = codeElement?.props?.children || '';
    const className = codeElement?.props?.className || '';
    const language = className.replace('language-', '') || 'text';

    return (
      <div className="my-6">
        <CodeBlock code={String(code).trim()} language={language} />
      </div>
    );
  },
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span className="block my-8">
      <Image
        src={typeof props.src === 'string' ? props.src : ''}
        alt={props.alt || ''}
        width={800}
        height={450}
        className="rounded-xl w-full max-h-[500px] object-contain"
      />
      {props.alt && (
        <span className="block text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          {props.alt}
        </span>
      )}
    </span>
  ),
  hr: () => (
    <hr className="my-12 border-gray-200 dark:border-gray-700" />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-left font-semibold" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-gray-900 dark:text-white" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...props} />
  ),
  // Citation & reference components
  Citation,
  BibEntry,
  Bibliography,
  Statistic,
  ExpertQuote,
  cite: (props: React.HTMLAttributes<HTMLElement>) => (
    <cite className="italic text-gray-700 dark:text-gray-300" {...props} />
  ),
  // Custom components
  WikiLink,
  Callout: ({ type = 'info', children }: { type?: 'info' | 'warning' | 'tip'; children: React.ReactNode }) => {
    const styles = {
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
      tip: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    };
    return (
      <div className={`my-6 p-4 rounded-lg border ${styles[type]}`}>
        {children}
      </div>
    );
  },
};

const mdxOptions = { mdxOptions: { remarkPlugins: [remarkGfm] } };

/**
 * Splits markdown content into sections at h2/h3 boundaries.
 * Ignores headings inside fenced code blocks.
 */
function splitContentBySections(content: string): string[] {
  const lines = content.split('\n');
  const sections: string[] = [];
  let currentSection: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    // Track fenced code blocks (``` or ~~~, 3+ chars)
    if (/^(`{3,}|~{3,})/.test(line)) {
      inCodeBlock = !inCodeBlock;
    }

    // Split on h2/h3 headings outside code blocks
    if (!inCodeBlock && /^#{2,3}\s/.test(line) && currentSection.length > 0) {
      sections.push(currentSection.join('\n'));
      currentSection = [line];
    } else {
      currentSection.push(line);
    }
  }

  if (currentSection.length > 0) {
    sections.push(currentSection.join('\n'));
  }

  return sections;
}

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const sections = splitContentBySections(content);

  return (
    <div className="prose-wrapper overflow-hidden text-lg leading-relaxed">
      {sections.map((section, index) => {
        const trimmed = section.trim();
        if (!trimmed) return null;

        // First section: render immediately (no scroll reveal)
        if (index === 0) {
          return (
            <div key={index}>
              <MDXRemote source={trimmed} components={components} options={mdxOptions} />
            </div>
          );
        }

        // Subsequent sections: split heading from body for staggered reveal
        const firstNewline = trimmed.indexOf('\n');
        const hasBody = firstNewline !== -1;
        const headingLine = hasBody ? trimmed.slice(0, firstNewline) : trimmed;
        const bodyContent = hasBody ? trimmed.slice(firstNewline + 1).trim() : '';

        return (
          <div key={index}>
            <ScrollReveal animation="fade-up">
              <MDXRemote source={headingLine} components={components} options={mdxOptions} />
            </ScrollReveal>
            {bodyContent && (
              <ScrollReveal animation="fade-up" delay={100}>
                <MDXRemote source={bodyContent} components={components} options={mdxOptions} />
              </ScrollReveal>
            )}
          </div>
        );
      })}
    </div>
  );
}
