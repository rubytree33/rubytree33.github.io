import { useMemo } from 'react'
import { GetStaticPaths } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { Post, getPostSlugs, getPostBySlug } from '../../lib/posts'
import { getMDXComponent } from 'mdx-bundler/client'

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getPostSlugs().map(slug => ({
    params: { slug }
  })),
  fallback: false,
})

interface Params extends ParsedUrlQuery { slug: string }
interface Context { params: Params }
export const getStaticProps = async ({ params: { slug } }: Context) => {
  const post = await getPostBySlug(slug)
  return slug ? ({
    props: { post }
  }) : {}
}

interface Props { post: Post }
const Page = ({ post: { title, date, mdxSource } }: Props) => <>
  <h1>{title}</h1>
  <p>{date}</p>
  <br />
  <main>
    {useMemo(() => getMDXComponent(mdxSource), [mdxSource])({})}
  </main>
</>

export default Page