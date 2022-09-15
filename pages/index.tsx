import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const Home: NextPage = () =>
  <>
    <Head>
      <title>about rubytree</title>
      <meta name="description" content="about rubytree" />
    </Head>
    <header className="p-2 mb-4 flex flex-row items-baseline space-x-8
                      border-b border-rose-600 border-opacity-50 text-rose-900">
      <Link href="/" className="ml-16 p-1 pt-0  text-3xl font-extralight text-rose-600">
        rubytree
      </Link>
      <Link href="/">
        about
      </Link>
      <Link href="https://github.com/rubytree33">
        github
      </Link>
      <Link href="https://github.com/rubytree33/rubytree33.github.io/main/pages/index.tsx">
        page source
      </Link>
    </header>
    <main className="mx-auto px-8 max-w-3xl space-y-1">
      <p>
        Thanks for visiting!
      </p>
      <p>
        If you&apos;re reading this, I&apos;ve only just started making this site.
      </p>
    </main>
    <footer className="fixed bottom-0 p-2 mt-8">
    </footer>
  </>

export default Home
