import { getTranslations } from 'next-intl/server';
import { Card, FeatureCard, LinkButton, Button, Badge, Input, AccordionList } from '@/components/ui';
import { KeyIcon } from '@/components/icons';

/** Live examples deliberately compose the production components. */
export async function BrandPatterns() {
  const t = await getTranslations('mediaKit.patterns');
  const heading = 'text-2xl font-bold mb-3';
  const copy = 'text-gray-600 dark:text-gray-400 leading-relaxed';
  return <section id="components" className="py-16">
    <div className="max-w-6xl mx-auto px-6 space-y-12">
      <div className="max-w-3xl"><h2 className="text-3xl font-bold mb-4">{t('title')}</h2><p className={copy}>{t('intro')}</p></div>
      <div>
        <h3 className={heading}>{t('cardsTitle')}</h3><p className={`${copy} mb-6`}>{t('cardsRule')}</p>
        <div className="grid md:grid-cols-2 gap-6">
          <Card><Badge variant="neutral">Card · default</Badge><h4 className="text-xl font-bold mt-4 mb-3">{t('defaultTitle')}</h4><p className={copy}>{t('defaultCopy')}</p></Card>
          <Card variant="interactive"><Badge variant="neutral">Card · interactive</Badge><h4 className="text-xl font-bold mt-4 mb-3">{t('interactiveTitle')}</h4><p className={`${copy} mb-6`}>{t('interactiveCopy')}</p><LinkButton href="/docs" variant="outline">{t('docs')}</LinkButton></Card>
          <FeatureCard icon={<span aria-hidden="true"><KeyIcon className="size-7 text-primary dark:text-indigo-300" /></span>} title={t('featureTitle')} description={t('featureCopy')} />
          <Card variant="gradient" gradient="purple" padding="lg"><Badge variant="neutral">Card · gradient</Badge><h4 className="text-xl font-bold mt-4 mb-3">{t('gradientTitle')}</h4><p className={copy}>{t('gradientCopy')}</p></Card>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div><h3 className={heading}>{t('actionsTitle')}</h3><p className={`${copy} mb-6`}>{t('actionsCopy')}</p><div className="flex flex-wrap gap-3"><LinkButton href="/download">{t('start')}</LinkButton><LinkButton href="/docs" variant="outline">{t('docs')}</LinkButton><Button type="button" disabled aria-busy="true">{t('pending')}</Button></div></div>
        <div><h3 className={heading}>{t('statusTitle')}</h3><p className={`${copy} mb-6`}>{t('statusCopy')}</p><div className="flex flex-wrap gap-3"><Badge variant="neutral">{t('statusConnected')}</Badge><Badge variant="neutral">{t('statusEmpty')}</Badge></div></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div><h3 className={heading}>{t('formsTitle')}</h3><p className={`${copy} mb-6`}>{t('formsCopy')}</p><Card><Input id="brand-example-name" label={t('fieldLabel')} value="Nostr WoT" readOnly aria-describedby="brand-example-hint" /><p id="brand-example-hint" className={`mt-2 text-sm ${copy}`}>{t('fieldHint')}</p><div className="mt-6"><Input id="brand-example-error" label={t('fieldLabel')} value="" readOnly aria-invalid="true" aria-describedby="brand-error-text" /><p id="brand-error-text" className="mt-2 text-sm text-red-700 dark:text-red-400">{t('fieldError')}</p></div></Card></div>
        <div><h3 className={heading}>{t('layoutTitle')}</h3><p className={`${copy} mb-6`}>{t('layoutCopy')}</p><dl className="divide-y divide-gray-200 dark:divide-gray-700">{['padding','grid','radius','width'].map(key => <div key={key} className="py-4"><dt className="font-semibold">{t(`${key}Label`)}</dt><dd className={`mt-1 ${copy}`}>{t(`${key}Value`)}</dd></div>)}</dl></div>
      </div>
      <div><h3 className={heading}>{t('behaviorTitle')}</h3><AccordionList items={[{question: t('focusTitle'), answer: t('focusCopy')}, {question: t('disclosureTitle'), answer: t('disclosureCopy')}, {question: t('emptyTitle'), answer: t('emptyCopy')}]} /></div>
    </div>
  </section>;
}
