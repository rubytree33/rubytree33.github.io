import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Logo from '../components/logo'
import _ from 'lodash'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectSquare, deselectSquare } from '../features/chess-board/chess-board-slice'

const ViewportCentered = ({ children, onClick }: any) =>
  <div className="absolute left-0 top-0">
    <div className="relative w-screen h-screen" onClick={onClick}>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  </div>

const Page: NextPage = () => {
  const selection = useAppSelector((state) => state.chessboard.selection)
  const dispatch = useAppDispatch()

  const handleSquare = (x: number, y: number) =>
    dispatch(selectSquare({x, y}))

  return <>
    <Head>
      <title>rubytree - chess</title>
    </Head>

    <ViewportCentered onClick={() => dispatch(deselectSquare())}>
      <div className="
        w-[100vmin] h-[100vmin]
        portrait:sm:w-[90vmin] portrait:sm:h-[90vmin]
        portrait:md:w-[75vmin] portrait:md:h-[75vmin]
        landscape:lg:w-[90vmin] landscape:lg:h-[90vmin]
        landscape:xl:w-[75vmin] landscape:xl:h-[75vmin]
        text-ruby-50
        bg-ruby-700 rounded-md ring ring-ruby-700
        z-10
        shadow-2xl
        flex flex-col
      ">
        {_.range(8).map(y =>
          <div key={y} className="grow basis-1/8 flex flex-row">
            {_.range(8).map (x =>
                <button key={x} className={`
                  relative
                  grow basis-1/8
                  rounded-md
                  ${(x + y) % 2 == 0 ? 'bg-ruby-400' : 'bg-ruby-700'}
                  hover:brightness-150
                  ${x === selection?.x && y === selection?.y && 'z-20 ring ring-white'}
                `}
                onClick={(e) => { e.stopPropagation(); handleSquare(x, y) }}
                >
                  <span className='absolute left-1 bottom-0 opacity-50'>
                    {`${'abcdefgh'[x]}${8 - y}`}
                  </span>
                </button>
            )}
          </div>
        )}
      </div>
    </ViewportCentered>

    <div className='absolute left-3 top-3'>
      <Link href='/'>
        <Logo size={48} className='z-50 drop-shadow-sm hover:brightness-150' />
      </Link>
    </div>
  </>
}

export default Page