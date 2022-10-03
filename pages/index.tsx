import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../components/layout'

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
        Check out the links above for more information.
      </p>
    </div>
  </Layout>
)

export default Home
