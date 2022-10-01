import React, { ReactNode } from 'react'
import Link from 'next/link'
import Logo from './logo'

interface Props {
  children?: ReactNode
}

export default function Layout({ children }: Props) {
  const headerHeight = 'h-14 mb-4'
  return (
    <>
      <div className={headerHeight}>
      </div>
      <main>
        {children}
      </main>
      <header className={`${headerHeight} absolute top-0 w-full p-2 flex flex-row items-center space-x-10
                        border-b border-ruby-600 border-opacity-50 text-ruby-900 dark:text-ruby-200`}>
        <Link href="/" className="ml-16 p-1 pt-0  text-3xl font-extralight text-ruby-600">
          <Logo className="inline mr-3 align-middle" />
          rubytree
        </Link>
        <Link href="https://github.com/rubytree33">
          github
        </Link>
        <Link href="https://github.com/rubytree33/rubytree33.github.io">
          source
        </Link>
      </header>
      <footer className="fixed bottom-0 p-2 mt-8">
        <Logo />
      </footer>
    </>
  )
}