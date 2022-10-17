import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { MouseEventHandler, ReactElement } from 'react'
import Logo from '../components/logo'
import _ from 'lodash'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectSquare, deselectSquare } from '../features/chess/chess-slice'
import { Coord, pieceAt, legalMovesFrom, PieceType, PieceColor } from '../features/chess/chess'

interface Props {
  className?: string,
  children?: ReactElement,
  onClick?: MouseEventHandler<HTMLElement>,
}
type Component = (props: Props) => ReactElement

const ViewportCentered: Component = ({ children, onClick, className }) =>
  <div className="absolute left-0 top-0">
    <div className="relative w-screen h-screen" onClick={onClick}>
      <div className={`${className} absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}>
        {children}
      </div>
    </div>
  </div>

const Page: NextPage = () => {
  const dispatch = useAppDispatch()
  const chess = useAppSelector(state => state.chess)
  const game = chess.game
  const selection: Coord | null = chess.selection
  const targeted: Coord[] = selection ? legalMovesFrom(game, selection).map(move => move.to) : []

  type SquareProps = Props & { coord: Coord }
  const Square = ({ coord, className }: SquareProps) => {
    const { file, rank } = coord
    const piece = pieceAt(game, coord)
    const isSelected = _.isEqual(coord, selection)
    const isTargeted = targeted.filter(x => _.isEqual(coord, x)).length > 0

    const isA1Dark = true  // how chess boards look

    return <>
      <button key={file} className={`
          ${className}
          rounded-md
          ${(file + rank) % 2 == Number(isA1Dark) ? 'bg-ruby-400' : 'bg-ruby-700'}
          hover:brightness-150
          ${isSelected && 'z-20 ring ring-white'}
          relative
        `}
        onClick={e => {
          e.stopPropagation()
          dispatch(!selection || isTargeted ? selectSquare(coord) : deselectSquare())
        }}
      >
        {/* targeted background */}
        {isTargeted && <div className={`
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-2/3 h-2/3 rounded-full
          border-4 border-ruby-50/50
        `} />}
        {/* piece */}
        {piece && <div className={`
          font-chess text-7xl
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          ${['text-ruby-50', 'text-ruby-950'][piece.color]}
          ${isSelected && 'animate-pulse'}
        `}>
          { // ♙♘♗♖♕♔♟♞♝♜♛♚ = white,black PNBRQK but we use black only for fill
          '♟♞♝♜♛♚'[piece.type]}
        </div>}
        {/* coordinate */}
        <div className='absolute left-1 bottom-0 opacity-50'>
          {`${'abcdefgh'[file]}${rank+1}`}
        </div>
      </button>
    </>
  }

  const Squares: Component = ({ className }) =>
    <div className={`${className} flex flex-col-reverse`}>
      {_.range(8).map(rank =>
        <div key={rank} className='grow basis-1/8 flex flex-row'>
          {_.range(8).map (file =>
            <Square key={file} coord={{ file, rank }} className='grow basis-1/8' />
          )}
        </div>
      )}
    </div>

  return <>
    <Head>
      <title>rubytree - chess</title>
    </Head>

    <ViewportCentered onClick={() => dispatch(deselectSquare())} className='shadow-2xl'>
      <Squares
        className='
          bg-ruby-700 rounded-md ring ring-ruby-700
          w-[100vmin] h-[100vmin]
          portrait:sm:w-[90vmin] portrait:sm:h-[90vmin]
          portrait:md:w-[75vmin] portrait:md:h-[75vmin]
          landscape:lg:w-[90vmin] landscape:lg:h-[90vmin]
          landscape:xl:w-[75vmin] landscape:xl:h-[75vmin]
        '
      />
    </ViewportCentered>

    <div className='absolute left-3 top-3'>
      <Link href='/'>
        <Logo alt='back' size={48} className='z-50 drop-shadow-sm hover:brightness-150' />
      </Link>
    </div>
  </>
}

export default Page