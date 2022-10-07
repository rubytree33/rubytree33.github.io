import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Logo from '../components/logo'
import _ from 'lodash'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectSquare, deselectSquare } from '../features/chess/chess-slice'

const ViewportCentered = ({ children, onClick }: any) =>
  <div className="absolute left-0 top-0">
    <div className="relative w-screen h-screen" onClick={onClick}>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  </div>

const Page: NextPage = () => {
  const dispatch = useAppDispatch()
  const selection = useAppSelector(state => state.chess.selection)
  const board = useAppSelector(state => state.chess.board)

  interface SquareProps {
    key?: number,
    file?: number,
    rank?: number,
    className?: string,
  }

  const Square = ({ key, file, rank, className }: SquareProps) => {
    if (file === undefined || rank === undefined) {
      console.error('Cannot render <Square /> without file/rank')
      return <></>
    }

    const isA1Dark = true

    const piece = board[file][rank]

    return <>
      <button key={key} className={`
          ${className}
          rounded-md
          ${(file + rank) % 2 == Number(isA1Dark) ? 'bg-ruby-400' : 'bg-ruby-700'}
          hover:brightness-150
          ${file === selection?.file && rank === selection?.rank && 'z-20 ring ring-white'}
          relative
        `}
        onClick={e => {
          e.stopPropagation()
          dispatch(selectSquare({file, rank}))
        }}
      >
        {/* piece */}
        {piece && <div className={`
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            text-3xl font-bold
            ${['text-ruby-50', 'text-ruby-950'][piece.color]}
          `}
        >
          {'PNBRQK'[piece.type]}
        </div>}
        {/* coordinate */}
        <div className='absolute left-1 bottom-0 opacity-50'>
          {`${'abcdefgh'[file]}${rank}`}
        </div>
      </button>
    </>
  }

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
        flex flex-col-reverse
      ">
        {_.range(8).map(rank =>
          <div key={rank} className="grow basis-1/8 flex flex-row">
            {_.range(8).map (file =>
              <Square key={file} file={file} rank={rank} className='grow basis-1/8' />
            )}
          </div>
        )}
      </div>
    </ViewportCentered>

    <div className='absolute left-3 top-3'>
      <Link href='/'>
        <Logo alt='back' size={48} className='z-50 drop-shadow-sm hover:brightness-150' />
      </Link>
    </div>
  </>
}

export default Page