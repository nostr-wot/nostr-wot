import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { BrandLockup } from '@/components/icons/BrandLockup';
import { KeyIcon, LightningIcon, CodeBracketsIcon } from '@/components/icons';
import { focusRing } from '@/components/ui';

const copy = 'text-gray-600 dark:text-gray-400 leading-relaxed';

export async function BrandContents() {
  const t = await getTranslations('mediaKit');
  const sections = [['foundation', 'standards.foundation'], ['logo', 'logo.title'], ['colors', 'colors.title'], ['typography', 'typography.title'], ['imagery', 'standards.imagery'], ['components', 'patterns.title'], ['usage', 'usageGuidelines.title']] as const;
  return <nav aria-label={t('standards.contents')} className="border-y border-gray-200 dark:border-gray-800">
    <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap gap-x-6 gap-y-3">
      {sections.map(([id, label]) => <a key={id} href={`#${id}`} className={`rounded text-sm font-medium text-gray-900 dark:text-white underline-offset-4 hover:underline ${focusRing}`}>{t(label)}</a>)}
    </div>
  </nav>;
}

export async function BrandEssentials() {
  const t = await getTranslations('mediaKit.standards');
  return <section id="foundation" className="scroll-mt-20 py-16">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold mb-6">{t('foundation')}</h2>
      <p className="text-2xl md:text-3xl leading-snug max-w-4xl font-medium">{t('position')}</p>
      <div className="grid md:grid-cols-3 gap-8 mt-10">
        {['audience', 'character', 'voice'].map(key => <div key={key} className="border-t-2 border-primary dark:border-indigo-300 pt-5"><h3 className="text-lg font-semibold mb-3">{t(key)}</h3><p className={copy}>{t(`${key}Copy`)}</p></div>)}
      </div>
      <div className="mt-8 border-l-4 border-primary dark:border-indigo-300 pl-6"><p className="font-semibold mb-2">{t('voiceExample')}</p><p className={copy}>{t('voiceRule')}</p></div>
    </div>
  </section>;
}

export async function BrandLogoRules() {
  const t = await getTranslations('mediaKit.standards');
  const l = await getTranslations('mediaKit.logo');
  return <div className="grid lg:grid-cols-2 gap-8 mt-10">
    <figure className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-center py-6"><div className="border border-dashed border-primary dark:border-indigo-300 p-[13px]"><BrandLockup /></div></div>
      <figcaption><h3 className="font-semibold mb-2">{t('clearSpace')}</h3><p className={`text-sm ${copy}`}>{t('clearSpaceCopy')}</p><p className="font-mono text-xs mt-3">H = 26px · X = ½H = 13px</p><p className={`text-xs mt-2 ${copy}`}>{l('logoWordmark')} ≥ 26px · {l('logoOnly')} ≥ 24px</p></figcaption>
    </figure>
    <div>
      <h3 className="text-xl font-semibold mb-3">{t('logoPairing')}</h3>
      <dl className="space-y-4">
        <div><dt className="font-medium">{l('lightBackground')}</dt><dd className={`text-sm mt-1 ${copy}`}>{t('lightRule')}</dd></div>
        <div><dt className="font-medium">{l('darkBackground')}</dt><dd className={`text-sm mt-1 ${copy}`}>{t('darkRule')}</dd></div>
      </dl>
      <p className={`text-sm mt-5 ${copy}`}>{t('logoLimits')}</p>
      <div className="flex flex-wrap gap-4 mt-5">{(['light', 'dark'] as const).map(tone => <a key={tone} download href={`/brand/nostr-wot/symbol-${tone}.svg`} className={`rounded underline underline-offset-4 text-sm text-primary-dark dark:text-indigo-300 ${focusRing}`}>{l('logoOnly')} · {l(tone === 'light' ? 'lightBackground' : 'darkBackground')} · SVG</a>)}</div>
    </div>
  </div>;
}

export async function BrandColorRules() {
  const t = await getTranslations('mediaKit.standards');
  return <div className="grid md:grid-cols-3 gap-8 mb-10">{['brandColor', 'actionColor', 'statusColor'].map(key => <div key={key}><h3 className="font-semibold mb-2">{t(key)}</h3><p className={`text-sm ${copy}`}>{t(`${key}Copy`)}</p></div>)}</div>;
}

export async function BrandTypeScale() {
  const t = await getTranslations('mediaKit');
  const rows = [
    ['hero', '36 / 40 → 48 / 48', '700', 'text-4xl md:text-5xl font-bold'],
    ['section', '30 / 36', '700', 'text-3xl font-bold'],
    ['card', '20 / 28', '700', 'text-xl font-bold'],
    ['body', '16 / 26', '400', 'text-base leading-relaxed'],
    ['label', '14 / 20', '500', 'text-sm font-medium'],
  ] as const;
  return <div className="mb-10">
    <p className={`${copy} mb-5`}>{t('standards.typeRule')}</p>
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left text-sm"><caption className="sr-only">{t('standards.typeScale')}</caption><thead className="bg-gray-50 dark:bg-gray-900"><tr>{['typeRole','typeSize','typeWeight'].map(key => <th key={key} scope="col" className="p-4 font-semibold">{t(`standards.${key}`)}</th>)}</tr></thead>
        <tbody>{rows.map(([key, size, weight, style]) => <tr key={key} className="border-t border-gray-200 dark:border-gray-700"><th scope="row" className="p-4"><span className={style}>{t(`standards.type${key}`)}</span></th><td className="p-4 whitespace-nowrap font-mono">{size}</td><td className="p-4 font-mono">{weight}</td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}

export async function BrandEditorial() {
  const t = await getTranslations('mediaKit.standards');
  return <section id="imagery" className="scroll-mt-20 py-16">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold mb-4">{t('imagery')}</h2><p className={`${copy} max-w-3xl mb-8`}>{t('imageryCopy')}</p>
      <div className="grid md:grid-cols-2 gap-6">
        {(['home', 'developers'] as const).map(id => <figure key={id}><Image src={`/images/illustrations/${id}.webp`} width={1600} height={900} alt={t(`${id}Alt`)} className="w-full h-auto rounded-2xl" /><figcaption className={`mt-3 text-sm ${copy}`}>{t(`${id}Caption`)}</figcaption></figure>)}
      </div>
      <div className="grid md:grid-cols-2 gap-8 mt-10">
        <div><h3 className="text-xl font-bold mb-3">{t('icons')}</h3><div aria-hidden="true" className="flex gap-5 text-primary dark:text-indigo-300 mb-4"><KeyIcon className="size-6" /><LightningIcon className="size-6" /><CodeBracketsIcon className="size-6" /></div><p className={copy}>{t('iconsCopy')}</p></div>
        <div><h3 className="text-xl font-bold mb-3">{t('composition')}</h3><p className={copy}>{t('compositionCopy')}</p></div>
      </div>
    </div>
  </section>;
}
