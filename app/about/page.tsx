import type { Author } from 'contentlayer/generated'
import { allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { AuthorLayout } from '~/layouts/author-layout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import { MDX_COMPONENTS } from '~/components/mdx'
import { SocialAccounts } from '~/components/author/social-accounts'
import { SupportMe } from '~/components/author/support-me'

export const metadata = genPageMetadata({ title: 'About' })

export default function AboutPage() {
  const author = allAuthors.find((p) => p.slug === 'default') as Author
  const mainContent = coreContent(author)

  const AuthorMDXComponents = {
    ...MDX_COMPONENTS,
    SocialAccounts,
    SupportMe,
  }

  return (
    <AuthorLayout content={mainContent}>
      <MDXLayoutRenderer code={author.body.code} components={AuthorMDXComponents} />
    </AuthorLayout>
  )
}
