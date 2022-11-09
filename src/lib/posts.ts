import { readdirSync, readFileSync } from 'fs'
import { join as joinPath } from 'path'
import { bundleMDX } from 'mdx-bundler'

const postsPath = joinPath(process.cwd(), 'posts')

export interface Post {
  slug: string
  title?: string
  date?: string
  mdxSource: string
}

export const getPostSlugs = (): string[] =>
  readdirSync(postsPath)
    .filter(filename => filename.match(/\.mdx$/))
    .map(filename => filename.replace(/\..*$/, ''))

export const getPostBySlug = async (slug: string): Promise<Post> => {
  const { code: mdxSource, frontmatter } = await bundleMDX({ source: String(readFileSync(joinPath(postsPath, `${slug}.mdx`))) })
  return ({
    ...frontmatter,
    slug,
    mdxSource,
  })
}

const comparePostAge = (a: Post, b: Post): number =>
  Date.parse(a?.date ?? '') - Date.parse(b?.date ?? '')

export const getPosts = async (): Promise<Post[]> =>
  (await Promise.all(
    getPostSlugs().map(getPostBySlug)
  ))
    .sort(comparePostAge)