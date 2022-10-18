import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { MouseEventHandler, ReactElement, ReactFragment } from 'react'
import Logo from '../components/logo'
import _ from 'lodash'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectSquare, deselectSquare } from '../features/chess/chess-slice'
import { Coord, pieceAt, legalMovesFrom, PieceColor, GameResult } from '../features/chess/chess'

interface Props {
  className?: string,
  children?: ReactFragment,
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
  // For some reason this only seems to be detected by Tailwind with twice the necessary coordinates
  // and only with these specific numbers (16 and 8 and 2). Rounding doesn't seem to help.
  // Probably a Tailwind bug but this is good enough for now so I'll leave it.
  const textRing =
    `[text-shadow:_${
      _.range(16)
        .map(i => {
          const rad = Math.PI*2 * i/8  // degree of shadow in radians
          return [2 * Math.cos(rad), 2 * Math.sin(rad)]  // shadow offset coordinates
        })
        .map(([x, y]) => `${x}px_${y}px_var(--tw-shadow-color)`)  // css for each shadow
    }]`

  type SquareProps = Props & { coord: Coord }
  const isA1Dark = true  // how chess boards look
  const Square = ({ coord, className }: SquareProps) => {
    const { file, rank } = coord
    const piece = pieceAt(game, coord)
    const isSelected = _.isEqual(coord, selection)
    const isTargeted = targeted.filter(x => _.isEqual(coord, x)).length > 0
    const isDarkSquare = Boolean((file + rank) % 2) === !isA1Dark
    return <>
      <button key={file} className={`
          ${className}
          rounded-md
          ${isDarkSquare ? 'bg-ruby-700' : 'bg-ruby-400' }
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
          transition-all
          font-chess text-7xl
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          ${game.gameResult === GameResult.Stalemate
              || game.gameResult === GameResult.WhiteWins && piece.color === PieceColor.Black
              || game.gameResult === GameResult.BlackWins && piece.color === PieceColor.White
            ? `${textRing} ${['text-neutral-400 shadow-ruby-50', 'text-neutral-600 shadow-ruby-950'][piece.color]}`
            : `${['text-ruby-50', 'text-ruby-950'][piece.color]}`
          }
        `}>
          { // ♙♘♗♖♕♔♟♞♝♜♛♚ = white,black PNBRQK but we use black only for fill
          '♟♞♝♜♛♚'[piece.type]}
        </div>}
        {/* coordinate */}
        <div className={`
          absolute left-1 bottom-0 text-ruby-950 opacity-50
          ${textRing} ${isDarkSquare ? 'shadow-ruby-700' : 'shadow-ruby-400'}
        `}>
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
      <div
        className={`
          absolute left-0 w-full
          transition-all
          rounded-md ring ring-offset-[12px] ring-ruby-700
          ${game.gameResult !== null  // if the game has ended
            ? 'top-0 h-full ' + (game.gameResult === GameResult.WhiteWins
              ? 'ring-offset-ruby-50'  // white won
              : game.gameResult === GameResult.BlackWins
                ? 'ring-offset-ruby-950'  // black won
                : 'ring-offset-neutral-500'  // stalemate
            )
            : 'h-1/4 ' + (game.turnColor === PieceColor.White
              ? 'ring-offset-ruby-50  top-3/4'  // white's turn
              : 'ring-offset-ruby-950 top-0'  // black's turn
            )
          }
        `}
      />
      <Squares
        className={`
          relative ${''/* set position so the board isn't obstructed by the turn/win indicator */}
          bg-ruby-700 rounded-md ring ring-ruby-700
          w-[100vmin] h-[100vmin]
          portrait:sm:w-[90vmin] portrait:sm:h-[90vmin]
          portrait:md:w-[75vmin] portrait:md:h-[75vmin]
          landscape:lg:w-[90vmin] landscape:lg:h-[90vmin]
          landscape:xl:w-[75vmin] landscape:xl:h-[75vmin]
        `}
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