import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => (
  <>
    <Head>
      <title>about rubytree</title>
      <meta name="description" content="about rubytree" />
    </Head>
    <div className="space-y-1">
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
  </>
)

export default Home
