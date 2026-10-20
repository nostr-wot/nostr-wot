import {MDXRemote} from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import {getTranslations} from 'next-intl/server';
import {markdownComponents} from '@/components/blog/BlogContent';
import reference from '@/data/docs/sdk-reference.json';

export const referenceTopicIds = Object.keys(reference.topics);

export async function SdkReferenceContent({id}:{id:string}) {
  const t=await getTranslations('docs');
  const topic=reference.topics[id as keyof typeof reference.topics];
  if(!topic) throw new Error(`Missing SDK reference: ${id}`);
  return <>
    <p className="lead">{t(`apiGuides.${id}.intro`)}</p>
    <p className="text-sm text-gray-500">{t('apiGuides.languageNotice')}</p>
    <div lang="en">
      <MDXRemote source={topic.content} components={markdownComponents} options={{mdxOptions:{format:'md',remarkPlugins:[remarkGfm]}}}/>
    </div>
    <p><a href={topic.source}>{t('packageDocs.reference')}</a></p>
  </>;
}
