import { GetStaticPaths } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { Post, getPostNames, getPostByName } from '../../lib/posts'

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getPostNames().map(name => ({
    params: { name }
  })),
  fallback: false,
})

interface Params extends ParsedUrlQuery { name: string }
interface Context { params: Params }
export const getStaticProps = async ({ params: { name } }: Context) =>
  name ? ({
    props: { post: await getPostByName(name) }
  }) : {}

interface Props { post: Post }
const Page = ({ post }: Props) => <>
  <h1>{post.name}</h1>
  <p>{post.date}</p>
  <br />
  <main dangerouslySetInnerHTML={{ __html: post.contentHTML }} />
</>

export default Page