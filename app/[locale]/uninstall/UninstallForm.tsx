'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input, TextArea, Button } from '@/components/ui';
import { Link } from '@/i18n/routing';

export default function UninstallForm() {
  const t = useTranslations('uninstall');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'limited'>('idle');
  const sending = useRef(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    const data = new FormData(event.currentTarget);
    setStatus('sending');
    try {
      const response = await fetch('/api/uninstall-feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      setStatus(response.ok ? 'success' : response.status === 429 ? 'limited' : 'error');
    } catch {
      setStatus('error');
    } finally {
      sending.current = false;
    }
  }
  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true">
        {status === 'success' && (
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center mb-8">
            <h2 className="text-2xl font-semibold mb-3">{t('thanks')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('success')}</p>
          </div>
        )}
      </div>
      {status !== 'success' && (
        <form onSubmit={submit} className="space-y-7" aria-busy={status === 'sending'}>
          <fieldset disabled={status === 'sending'} className="space-y-7">
            <TextArea name="reason" label={t('reason')} placeholder={t('reasonPlaceholder')} required maxLength={3000} rows={4} />
            <TextArea name="expectations" label={t('expectations')} placeholder={t('expectationsPlaceholder')} maxLength={3000} rows={3} />
            <Input name="email" type="email" autoComplete="email" label={t('email')} maxLength={254} aria-describedby="email-note" />
            <p id="email-note" className="-mt-4 text-sm text-gray-500 dark:text-gray-400">{t('emailHint')}</p>
            <div hidden aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
          </fieldset>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('privacy')} <Link href="/privacy" className="underline hover:text-primary">{t('privacyLink')}</Link></p>
          {(status === 'error' || status === 'limited') && <p role="alert" className="text-red-700 dark:text-red-400">{t(status)}</p>}
          <Button type="submit" disabled={status === 'sending'} className="w-full sm:w-auto">{t(status === 'sending' ? 'sending' : 'send')}</Button>
        </form>
      )}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
        <Link href="/contact" className="text-primary hover:underline">{t('support')}</Link>
        <Link href="/download" className="text-gray-600 dark:text-gray-400 hover:underline">{t('reinstall')}</Link>
      </div>
    </>
  );
}
