import React, { ReactNode } from 'react'
import Link from 'next/link'
import Logo from './logo'

interface Props {
  children?: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div className="h-full flex flex-col">
      <header className="
        w-full px-16 mb-4
        h-14 py-2
        flex flex-row items-center
        text-ruby-900 dark:text-ruby-200
        ">
        <Link href="/" className="p-1 pt-0 text-3xl font-display font-extralight text-ruby-500">
          <Logo className="inline align-middle" />
          <span className="sm:inline hidden ml-3">rubytree</span>
        </Link>
        <div className="space-x-10 sm:ml-auto ml-10">
          <Link href="https://github.com/rubytree33">
            github
          </Link>
          <Link href="https://github.com/rubytree33/rubytree33.github.io">
            source
          </Link>
        </div>
      </header>
      <main className="flex-grow mx-auto px-8 max-w-3xl space-y-1">
        {children}
      </main>
    </div>
  )
}