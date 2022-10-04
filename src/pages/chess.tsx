import type { NextPage } from 'next'
import Head from 'next/head'
import _ from 'lodash'

const ViewportCentered = ({ children }: any) =>
  <div className="absolute left-0 top-0">
    <div className="relative w-screen h-screen">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  </div>

const Page: NextPage = () =>
  <>
    <Head>
      <title>rubytree - chess</title>
    </Head>
    <ViewportCentered>
      {/* TODO: set size with multi-dimensional breakpoints */}
      <div className="
        w-[100vmin] h-[100vmin]
        sm:w-[90vmin] sm:h-[90vmin]
        md:w-[75vmin] md:h-[75vmin]
        text-ruby-50
        bg-ruby-700 rounded-md
        shadow-2xl
        flex flex-col
      ">
        {_.range(8).map(y =>
          <div key={y} className="grow basis-1/8 flex flex-row">
            {_.range(8).map (x =>
                <button key={x} className={`
                  grow basis-1/8
                  z-0 rounded-md
                  ${(x + y) % 2 == 0 ? 'bg-ruby-400' : 'bg-ruby-700'}
                  hover:z-10 hover:brightness-150 hover:drop-shadow-2xl
                `}>
                  {`${'abcdefgh'[x]}${8 - y}`}
                </button>
            )}
          </div>
        )}
      </div>
    </ViewportCentered>
  </>

export default Page