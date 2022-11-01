import type { NextPage } from 'next'
import Title from '../components/title'
import Link from 'next/link'
import Logo from '../components/logo'

const Home: NextPage = () => {
  return (
    <>
      <Title />
      <div className='absolute w-full top-1/2 -translate-y-1/2 flex flex-row [&>*]:grow text-lg'>
        <div />
        <div className='relative self-center text-center max-w-sm shrink-0 flex flex-col
            '>
          <div className='absolute -top-[72px] self-center [&>*]:inline [&>*]:align-middle space-x-4'>
            <Logo size={64} />
            <span className='font-display text-4xl font-extralight text-ruby-500'>rubytree</span>
          </div>
          <p className='mb-4'>Full-stack open-source web developer.</p>
          <div className='grid grid-flow-row grid-cols-4 [&>a]:text-ruby-500 [&>a:hover]:before:content-["<_"] [&>a:hover]:after:content-["_>"]'>
            <Link href='/chess'>chess</Link>
            <Link href='https://github.com/rubytree33'>github</Link>
            <Link href='https://www.linkedin.com/in/rubytree33/'>linkedin</Link>
            <Link href='https://github.com/rubytree33/rubytree33.github.io'>source</Link>
          </div>
        </div>
        <div />
      </div>
    </>
  )
}

export default Home
