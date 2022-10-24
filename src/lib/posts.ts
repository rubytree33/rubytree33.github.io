import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsPath = path.join(process.cwd(), 'posts')

export interface Post {
  name: string
  title?: string
  date?: string
  contentHTML: string
}

export const getPostNames = (): string[] =>
  fs.readdirSync(postsPath)
    .filter(filename => filename.match(/\.md$/))
    .map(filename => filename.replace(/\.md$/, ''))

export const getPostByName = async (name: string): Promise<Post> => {
  const parsed = matter(fs.readFileSync(path.join(postsPath, `${name}.md`)))
  return ({
    name,
    contentHTML: (await remark().use(html).process(parsed.content)).toString(),
    ...parsed.data,
  })
}

export const getPosts = async (): Promise<Post[]> =>
  (await Promise.all(getPostNames().map(getPostByName)))
    .sort((a: any, b: any) => (b?.date ?? -1) - (a?.date ?? -1))