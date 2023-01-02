import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Meta from '../components/meta'
import Logo from '../components/logo'

const Home: NextPage = () => {
  return (
    <>
      <Meta
        title='home'
        description="TypeScript/React developer rubytree's personal website"
        path={useRouter().asPath}
        />
      <div className='absolute w-full top-1/2 -translate-y-1/2 flex flex-row [&>*]:grow text-lg'>
        <div />
        <div className='relative items-center text-center max-w-sm shrink-0 flex flex-col'>
          <div className='absolute -top-[72px] self-center [&>*]:inline [&>*]:align-middle space-x-4'>
            <Logo size={64} />
            <span className='font-display text-4xl font-extralight text-ruby-500'>rubytree</span>
          </div>
          <p className='mb-4'>Full-stack open-source web developer.</p>
          <div className='
            flex flex-col items-center w-4/5
            [&>*]:grid [&>*]:grid-flow-row [&>*~*]:grid-cols-2 [&>*]:w-full
            text-ruby-500                   font-normal
            [&_a:hover]:before:content-["<_"] [&_a]:before:font-normal
            [&_a:hover]:after:content-["_>"]  [&_a]:after:font-normal
          '>
            <div className='font-semibold'>
              <Link href='/chess'>chess</Link>
            </div>
            <div>
              <Link href='https://github.com/rubytree33/rubytree33.github.io'>source</Link>
              <Link href='https://www.linkedin.com/in/rubytree33/'>linkedin</Link>
              <Link href='https://github.com/rubytree33'>github</Link>
              <Link href='https://triplebyte.com/tb/thomas-moore-cotboog/certificate'>triplebyte</Link>
            </div>
          </div>
        </div>
        <div />
      </div>
    </>
  )
}

export default Home
