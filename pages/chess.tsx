import type { NextPage } from 'next'
import Head from 'next/head'
import _ from 'lodash'

const Page: NextPage = () =>
  <>
    <Head>
      <title>rubytree - chess</title>
    </Head>
    <div className="absolute left-0 top-0 -z-1">
      <div className="relative w-screen h-screen">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          grid grid-cols-8
          shadow-2xl">
          {
            _.range(64).map(i => {
              const x = i % 8
              const y = 7 - (i - x) / 8
              return (
                <button key={i} className={`w-8 h-8 hover:saturate-200
                  ${(x+y)%2==0?'bg-ruby-700':'bg-ruby-400'}`}>
                    {`${'abcdefgh'[x]}${y + 1}`}
                </button>
              )
            })
          }
        </div>
      </div>
    </div>
  </>

const a = <div></div>

export default Page