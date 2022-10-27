import type { NextPage } from 'next'
import Link from 'next/link'
import { MouseEventHandler, ReactElement, ReactFragment } from 'react'
import Title from '../components/title'
import Logo from '../components/logo'
import _ from 'lodash'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectSquare, deselectSquare, tryMove, completePromotion } from '../features/chess/chess-slice'
import { Coord, P, pieceAt, legalMovesFrom, PieceColor, GameResult, PieceType, coordString } from '../features/chess/chess'
import styles from './chess.module.sass'

type OnClick = MouseEventHandler<Element>
interface Props {
  className?: string,
  children?: ReactFragment,
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
  const { game, selection, promotionDraft } = chess
  const { turnColor, gameResult } = game
  const targeted: Coord[] = selection ? legalMovesFrom(game, selection).map(move => move.to) : []

  const isStalemate: boolean = gameResult === GameResult.Stalemate
  const winner: PieceColor | null =
    gameResult === GameResult.WhiteWins ? PieceColor.White
    : gameResult === GameResult.BlackWins ? PieceColor.Black
    : null
  const loser: PieceColor | null = winner && chooseWB(winner, PieceColor.Black, PieceColor.White)

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
          absolute left-1 bottom-0 text-ruby-950 opacity-50
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

    return <>
      <button key={file} onClick={onClick} className={`
          ${className}
          rounded-md
          ${isDarkSquare ? 'bg-ruby-700' : 'bg-ruby-400' }
          ${isSelected && `z-20 ring ${turnWB('ring-ruby-50', 'ring-ruby-950')}`}
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
    </>
  }

  const Chessboard: Component = ({ className }) => {
    return <div className={`${className} flex flex-col-reverse bg-ruby-700 rounded-md ring ring-ruby-700`}>
      {_.range(8).map(rank =>
        <div key={rank} className='grow basis-1/8 flex flex-row'>
          {_.range(8).map(file =>
            <Square key={file} coord={{ file, rank }} className='grow basis-1/8' />
          )}
        </div>
      )}
    </div>
  }

  const TurnIndicator: Component = () => {
    return (
      <div
        className={`
          absolute left-0 w-full
          motion-safe:transition-all
          rounded-md ring ring-offset-[12px] ring-ruby-700
          ${gameResult === null  // if game is still going indicate side and color
            ? `h-1/4 ${turnWB('ring-offset-ruby-50 top-3/4', 'ring-offset-ruby-950 top-0')}`
            : 'top-0 h-full'  // else indicator covers entire area with color
          }
          ${isStalemate && 'ring-offset-neutral-500'}
          ${winner !== null && chooseWB(winner,
            'ring-offset-ruby-50',
            'ring-offset-ruby-950'
          )}
        `}
      />
    )
  }

  return <>
    <Title>chess</Title>

    <ViewportCentered onClick={() => dispatch(deselectSquare())} className='shadow-2xl'>
      <TurnIndicator />
      <Chessboard
        className={`
          relative ${''/* set position so the board isn't obstructed by the turn/win indicator */}
          w-[100vmin] h-[100vmin]
          portrait:sm:w-[90vmin] portrait:sm:h-[90vmin]
          portrait:md:w-[75vmin] portrait:md:h-[75vmin]
          landscape:lg:w-[90vmin] landscape:lg:h-[90vmin]
          landscape:xl:w-[75vmin] landscape:xl:h-[75vmin]
        `}
      />
    </ViewportCentered>

    <Link href='/' className='absolute left-3 top-3'>
      <Logo alt='back' size={48} className='z-50 drop-shadow-sm opacity-30 hover:opacity-100 active:opacity-100' />
    </Link>
  </>
}

export default Page