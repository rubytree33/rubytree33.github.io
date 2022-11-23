import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { MouseEventHandler, ReactElement, ReactNode } from 'react'
import Meta from '../components/meta'
import Logo from '../components/logo'
import _ from 'lodash'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getGame, selectSquare, deselectSquare, tryMove, completePromotion, undoMove, restart, conclude } from '../features/chess/chess-slice'
import { Coord, P, pieceAt, legalMovesFrom, PieceColor, GameResult, PieceType, coordString } from '../features/chess/chess'
import styles from './chess.module.sass'
import { PayloadAction } from '@reduxjs/toolkit'

type OnClick = MouseEventHandler
interface Props {
  className?: string,
  children?: ReactNode,
  onClick?: OnClick,
}
type Component = (props: Props) => ReactElement

const chooseWB = <T,>(color: PieceColor, ifWhite: T, ifBlack: T): T =>
  color === PieceColor.White ? ifWhite : ifBlack

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
  const { selection, promotionDraft } = chess
  const game = getGame(chess)
  const { turnColor, gameResult } = game
  const targeted: Coord[] = selection ? legalMovesFrom(game, selection).map(move => move.to) : []

  const isStalemate: boolean = gameResult === GameResult.Stalemate
  const winner: PieceColor | null =
    gameResult === GameResult.WhiteWins ? PieceColor.White
    : gameResult === GameResult.BlackWins ? PieceColor.Black
    : null
  const loser: PieceColor | null = winner !== null ? chooseWB(winner, PieceColor.Black, PieceColor.White) : null

  const turnWB = _.partial(chooseWB, turnColor)

  const textBorder2 = styles['text-border-2']

  const isA1Dark = true  // how chess boards look

  type SquareProps = Props & { coord: Coord }

  const Square = ({ coord, className }: SquareProps): ReactElement => {
    const { file, rank } = coord
    const piece: P = pieceAt(game, coord)
    const isSelected: boolean = _.isEqual(coord, selection)
    const isTargeted: boolean = targeted.filter(x => _.isEqual(coord, x)).length > 0
    const wouldCapture: boolean = isTargeted && Boolean(piece)
    const isDarkSquare: boolean = Boolean((file + rank) % 2) === !isA1Dark

    const onClick: OnClick = e => {
      e.stopPropagation()
      if (gameResult) return  // pieces are is no longer interactable when the game ends
      else if (piece?.color === turnColor && !isSelected)
        dispatch(selectSquare(coord))
      else if (selection) {
        if (isTargeted)
          dispatch(tryMove({ from: selection, to: coord }))
        else if (isSelected || piece?.color !== turnColor)
          dispatch(deselectSquare())
      }
    }

    type PieceProps = Props & { piece: P }

    const Piece = ({ piece, className, onClick }: PieceProps): ReactElement => {
      return <svg viewBox={`0 0 17 17`} className='group' onClick={onClick}>
        {piece && <text x='50%' y='62%' dominantBaseline='middle' textAnchor='middle' className={`
          ${className}
          font-chess
          ${piece.color === turnColor && !isSelected && gameResult === null && // selectable piece
            'group-hover:opacity-70'}
          ${isStalemate  // gray (colored outline) all pieces on stalemate
              || piece.color === loser  // or losing pieces
            ? `${textBorder2} ${chooseWB(piece.color,
              'fill-neutral-400 shadow-ruby-50',
              'fill-neutral-600 shadow-ruby-950')}`
            : `${chooseWB(piece.color, 'fill-ruby-50', 'fill-ruby-950')}`
          }
        `}>
          {'♟♞♝♜♛♚'[piece.type] /* ♙♘♗♖♕♔♟♞♝♜♛♚ = white,black PNBRQK but we use black only for fill */}
        </text>}
      </svg>
    }

    /** Shows where moves can be played from the selected piece */
    const TargetIndicator: Component = () => {
      return isTargeted && !promotionDraft ? (
        <div className={`
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          rounded-full border-4
          ${wouldCapture
            ? `w-2/3 h-2/3 ${turnWB('border-ruby-50/70', 'border-ruby-950/70')}`
            : `w-1/2 h-1/2 ${turnWB('border-ruby-50/50', 'border-ruby-950/50')}`
          }
        `} />
        ) : <></>
    }

    /** Coordinate indicator */
    const Coordinate: Component = () => {
      return (
        <div className={`
          invisible sm:visible
          absolute left-1 bottom-0 font-display text-ruby-950 opacity-50
          ${textBorder2} ${isDarkSquare ? 'shadow-ruby-700' : 'shadow-ruby-400'}
        `}>
          {coordString(coord)}
        </div>
      )
    }

    const PromotionOptions: Component = () => {
      return (
        _.isEqual(coord, promotionDraft?.to) ? (
          <div className='
            absolute left-0 top-0 h-full w-full
            flex flex-row
          '>
            {[0, 1].map(y =>
              <div key={y} className='flex flex-col'>
                {[0, 1].map(x => {
                  const newType = PieceType.N + y + 2*x
                  return <Piece key={x}
                    piece={{ color: turnColor, type: newType }}
                    className={`
                      ${textBorder2} ${isDarkSquare ? 'shadow-ruby-700' : 'shadow-ruby-400'}
                    `}
                    onClick={e => {
                      e.stopPropagation()
                      dispatch(completePromotion(newType))
                    }}
                  />
                }
                )}
              </div>
            )}
          </div>
        ) : <></>
      )
    }

    return (
      <button key={file} onClick={onClick} className={`
          ${className}
          rounded-md
          ${isDarkSquare ? 'bg-ruby-700' : 'bg-ruby-400' }
          ${isSelected ? `z-40 ring ${turnWB('ring-ruby-50', 'ring-ruby-950')}` : 'z-20'}
          relative
        `}
      >
        <TargetIndicator />
        <Piece piece={piece} className={`
          ${_.isEqual(coord, promotionDraft?.to) && 'opacity-50' /* fade behind promotion options */}
        `} />
        <Coordinate />
        <PromotionOptions />
      </button>
    )
  }

  const Chessboard: Component = ({ className }) => {
    return <div className={`${className} relative shadow-2xl flex flex-col-reverse bg-ruby-700 rounded-md ring ring-ruby-700`}>
      {_.range(8).map(rank =>
        <div key={rank} className='grow basis-1/8 flex flex-row'>
          {_.range(8).map(file =>
            <Square key={file} coord={{ file, rank }} className='grow basis-1/8' />
          )}
        </div>
      )}
    </div>
  }

  const SidebarButton = ({
    payload,
    text,
    y = 0,
  }: {
    payload: PayloadAction<any>
    text: string
    y?: number
  }) => {
    return (
      <button onClick={e => { e.stopPropagation(); dispatch(payload) }}>
        <svg viewBox='0 0 24 24'>
          <text x='50%' y={`${54+y}%`} height='100%' dominantBaseline='middle' textAnchor='middle'
            className='fill-ruby-100 overflow-visible'
          >
            {text}
          </text>
        </svg>
      </button>
    )
  }

  const Sidebar: Component = ({ className }) => {
    return (
      <div className={`
        ${className}
        rounded-md
        ring ring-ruby-700 ring-offset-0
        bg-ruby-700
        relative z-10
        flex portrait:flex-row landscape:flex-col items-center
        [&>*]:w-[10vmin] [&>*]:aspect-square
        [&>:hover]:opacity-70
        shadow-2xl
      `}>
        <Link href='/' className='h-full box-content border-ruby-800 landscape:border-b portrait:border-r'>
          <Logo alt='back'
            className='
              h-full w-full scale-75 
              overflow-visible
              [&_circle]:fill-ruby-100 [&_path]:stroke-ruby-600
            '
          />
        </Link>
        {/* zero-width space U+200B prevents text display error */}
        <SidebarButton text={'\u200b⚐'} y={5} payload={conclude(turnWB(GameResult.BlackWins, GameResult.WhiteWins))} />
        <SidebarButton text='½' payload={conclude(GameResult.Stalemate)} />
        <SidebarButton text='⤺' payload={undoMove()} />
        <SidebarButton text='↺' payload={restart()} />
      </div>
    )
  }

  const ChessboardAndSidebar: Component = () => {
    return (
      <div className='
        flex
         portrait:w-[80vmin]  portrait:h-[90vmin]  portrait:flex-col  portrait:items-center
        landscape:w-[90vmin] landscape:h-[80vmin] landscape:flex-row landscape:items-start
      '>
        <Chessboard className='basis-[calc(8/9*100%)] portrait:-translate-y-2 landscape:-translate-x-2 aspect-square' />
        <Sidebar    className='basis-[calc(1/9*100%)]  portrait:translate-y-2  landscape:translate-x-2' />
      </div>
    )
  }

  return (
    <>
      <Meta
        title='chess'
        description='Chess in TypeScript, React, Redux'
        path={useRouter().asPath}
      />

      <ViewportCentered onClick={() => dispatch(deselectSquare())}>
        <ChessboardAndSidebar />
      </ViewportCentered>
    </>
  )
}

export default Page