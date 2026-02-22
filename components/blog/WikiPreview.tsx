'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface WikiLinkProps {
  href: string;
  children: React.ReactNode;
  extract?: string;
}

function getTitleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const slug = pathname.split('/').pop() || '';
    return decodeURIComponent(slug).replace(/_/g, ' ');
  } catch {
    return 'Wikipedia';
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'wikipedia.org';
  }
}

export function WikiLink({ href, children, extract }: WikiLinkProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, above: true });
  const linkRef = useRef<HTMLAnchorElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const title = getTitleFromUrl(href);
  const domain = getDomain(href);

  const updatePosition = useCallback(() => {
    if (!linkRef.current) return;
    const rect = linkRef.current.getBoundingClientRect();
    const above = rect.top > 200;
    setPos({
      top: above ? rect.top + window.scrollY : rect.bottom + window.scrollY + 8,
      left: rect.left + rect.width / 2 + window.scrollX,
      above,
    });
  }, []);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <a
        ref={linkRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </a>

      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className="fixed z-50 w-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-3 text-left"
            style={{
              top: pos.above ? undefined : pos.top - window.scrollY,
              bottom: pos.above
                ? window.innerHeight - (pos.top - window.scrollY) + 8
                : undefined,
              left: pos.left - window.scrollX,
              transform: 'translateX(-50%)',
            }}
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            {/* Arrow */}
            <span
              className={`absolute left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${
                pos.above
                  ? 'top-full -mt-1 border-t-0 border-l-0'
                  : 'bottom-full -mb-1 border-b-0 border-r-0'
              }`}
            />

            <span className="flex items-start gap-2">
              {/* Wikipedia "W" icon */}
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12.09 13.119c-.14 1.064-.496 2.4-1.063 3.783-.567 1.383-1.121 2.394-1.66 3.031-.54.637-.936.764-1.189.382-.253-.382-.41-1.063-.473-2.043-.063-.98-.046-2.217.052-3.71.098-1.494.26-2.76.487-3.8.227-1.04.471-1.637.732-1.793.261-.156.557.027.888.547.331.52.667 1.3 1.01 2.34.341 1.04.608 2.2.216 1.263zm-5.856-7.03c.243-.07.492.028.747.293.255.266.504.66.747 1.184.243.524.473 1.155.69 1.893.216.738.392 1.436.527 2.094.136.658.236 1.296.3 1.914.064.618.086 1.06.064 1.326-.021.266-.085.41-.193.43-.107.02-.225-.07-.355-.273-.13-.204-.266-.46-.41-.77-.143-.31-.3-.672-.468-1.088-.17-.416-.34-.81-.514-1.182-.173-.372-.355-.733-.547-1.084-.192-.35-.38-.645-.562-.885-.182-.24-.362-.425-.54-.553-.178-.127-.34-.16-.485-.098-.146.063-.266.22-.362.473-.096.253-.17.573-.224.96-.054.388-.084.82-.09 1.297-.006.477.014.962.058 1.455.044.492.11.97.197 1.432.087.46.192.88.316 1.257.124.377.266.688.427.932.16.244.343.42.547.53.204.11.426.127.664.054.238-.074.498-.253.782-.538.283-.285.576-.648.878-1.088.302-.44.608-.95.917-1.527.31-.578.608-1.197.896-1.857.287-.66.556-1.334.805-2.023.25-.688.47-1.36.66-2.015.19-.654.343-1.243.458-1.765l.348-1.584c.113-.465.242-.753.388-.864.146-.11.318-.104.514.02.197.124.387.362.57.713.182.35.337.787.465 1.31.128.522.22 1.102.278 1.738.058.637.072 1.287.04 1.95-.03.664-.1 1.29-.208 1.878-.107.588-.246 1.097-.416 1.527-.17.43-.362.738-.577.923-.214.185-.44.224-.677.117-.238-.107-.463-.355-.677-.744-.214-.39-.423-.87-.627-1.44-.204-.57-.404-1.2-.6-1.893-.196-.692-.393-1.393-.59-2.103-.197-.71-.393-1.383-.588-2.017-.195-.634-.398-1.178-.607-1.633-.21-.454-.425-.77-.648-.948-.223-.178-.45-.16-.683.054-.233.214-.446.584-.64 1.112-.194.528-.368 1.162-.523 1.902-.155.74-.285 1.527-.39 2.362-.105.834-.175 1.66-.21 2.477-.035.818-.028 1.57.023 2.257.05.687.14 1.253.268 1.697.128.444.295.717.5.818.205.1.437.015.695-.258.258-.273.52-.672.788-1.198.268-.526.53-1.136.788-1.83.258-.694.502-1.416.73-2.167.23-.75.434-1.477.614-2.18.18-.703.328-1.327.443-1.873.116-.546.19-.963.224-1.25.034-.288.013-.41-.063-.364-.076.046-.184.233-.323.56-.14.328-.3.744-.484 1.248-.183.504-.384 1.06-.603 1.666-.22.607-.45 1.2-.693 1.78-.242.58-.494 1.104-.754 1.572-.26.468-.526.837-.796 1.107-.27.27-.54.395-.81.376-.27-.02-.522-.194-.756-.524-.234-.33-.445-.777-.633-1.342-.188-.565-.348-1.203-.48-1.914-.132-.71-.23-1.44-.296-2.19-.066-.75-.094-1.467-.085-2.15.01-.684.057-1.29.143-1.82.087-.53.205-.94.354-1.23.15-.29.328-.42.537-.388z" />
              </svg>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  {title}
                </span>
                {extract && (
                  <span className="mt-1 block text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    {extract}
                  </span>
                )}
                <span className="mt-1.5 block text-[11px] text-gray-400 dark:text-gray-500">
                  {domain}
                </span>
              </span>
            </span>
          </div>,
          document.body
        )}
    </>
  );
}
