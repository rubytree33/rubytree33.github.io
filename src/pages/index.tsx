import type { NextPage } from 'next'
import Layout from '../components/layout'
import Title from '../components/title'
import Link from 'next/link'

const Home: NextPage = () => (
  <Layout>
    <Title />
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
