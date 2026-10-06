'use client';
import { useId, useRef, useState } from 'react';
type Option = { value: string; label: string };

export default function SearchableSelect({ label, value, options, onSelect, emptyText }: {
  label: string; value?: string; options: Option[]; onSelect: (value: string) => void; emptyText: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const filtered = options.filter(option => `${option.label} ${option.value}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const selected = options.find(option => option.value === value);
  const close = () => { setOpen(false); setQuery(''); setActive(-1); };
  const choose = (option: Option) => { close(); onSelect(option.value); };
  return <div className="relative min-w-0" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) close();
  }}>
    <label htmlFor={id} className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
    <div className="relative">
      <input ref={input} id={id} role="combobox" aria-expanded={open} aria-controls={`${id}-options`} aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 && filtered[active] ? `${id}-${active}` : undefined}
        autoComplete="off" value={open ? query : selected?.label || ''} placeholder={selected?.label || label}
        onFocus={() => { setOpen(true); setActive(-1); }} onClick={() => setOpen(true)}
        onChange={event => { setQuery(event.target.value); setActive(-1); setOpen(true); }}
        onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); close(); }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setOpen(true);
            const next = event.key === 'ArrowDown' ? Math.min(active + 1, filtered.length - 1) : Math.max(active - 1, 0);
            setActive(next);
            requestAnimationFrame(() => document.getElementById(`${id}-${next}`)?.scrollIntoView({ block: 'nearest' }));
          }
          if (event.key === 'Enter' && open) {
            event.preventDefault();
            const option = filtered[active] || (filtered.length === 1 ? filtered[0] : undefined);
            if (option) choose(option);
          }
        }}
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
      <button type="button" tabIndex={-1} aria-label={label} aria-expanded={open} onMouseDown={event => event.preventDefault()} onClick={() => {
        if (open) close(); else { input.current?.focus(); setOpen(true); }
      }} className="absolute inset-y-0 right-0 px-3 text-gray-500">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2 4 4 4 4-4" stroke="currentColor" strokeWidth="1.5" /></svg>
      </button>
    </div>
    {open && <ul id={`${id}-options`} role="listbox" aria-label={label} className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      {filtered.map((option, index) => <li id={`${id}-${index}`} key={option.value} role="option" aria-selected={option.value === value}
        onMouseDown={event => event.preventDefault()} onMouseMove={() => setActive(index)} onClick={() => choose(option)}
        className={`cursor-pointer rounded px-3 py-2 text-sm ${active === index || option.value === value ? 'bg-primary/10 text-primary' : 'text-gray-900 dark:text-white'}`}
      >{option.label}</li>)}
      {!filtered.length && <li role="presentation" className="px-3 py-2 text-sm text-gray-500">{emptyText}</li>}
    </ul>}
  </div>;
}
