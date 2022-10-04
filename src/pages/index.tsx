import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../components/layout'
import Link from 'next/link'

const Home: NextPage = () => (
  <Layout>
    <Head>
      <title>rubytree</title>
    </Head>
    <div className="mx-auto px-8 max-w-3xl space-y-1">
      <p>
        Thanks for visiting!
      </p>
      <p>
        If you&apos;re reading this, I&apos;ve only just started making this site.
      </p>
      <p>
        I have an <Link href='/chess' className='text-red-500'>incomplete chess game</Link>.
      </p>
    </div>
  </Layout>
)

export default Home