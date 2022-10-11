import _ from 'lodash'
import { produce, immerable } from 'immer'
import { DRAFTABLE } from 'immer/dist/internal'
import { fileURLToPath } from 'url'

const enum Rank { R1 = 0, R2, R3, R4, R5, R6, R7, R8 }
const enum File { Fa = 0, Fb, Fc, Fd, Fe, Ff, Fg, Fh }

class Coord {
  [immerable] = true

  file: File
  rank: Rank
  constructor(file: number, rank: number) {
    this.file = file
    this.rank = rank
  }

  is(other: Coord): boolean {
    return this.file === other.file
        && this.rank === other.rank
  }

  up(offset: number): Coord {
    return new Coord(this.file, this.rank + offset)
  }

  right(offset: number): Coord {
    return new Coord(this.file + offset, this.rank)
  }

  plus(other: Coord): Coord {
    return new Coord(this.file + other.file, this.rank + other.rank)
  }

  delta(other: Coord) {
    return { dfile: other.file - this.file, drank: other.rank - this.rank }
  }
}

const enum PieceColor { White, Black }

/** Chess piece type in standard notation:
 *  Pawn, kNight, Bishop, Rook, Queen, King */
const enum PieceType { P, N, B, R, Q, K }

/** A chess piece, or empty. (Board square contents) */
type P = null | { color: PieceColor, type: PieceType }

class Move {
  [immerable] = true

  /** The origin square of the primary piece of the move. */
  from: Coord
  /** The destination square of the primary piece of the move. */
  to: Coord
  /** The type the pawn will become, or `null`. */
  promotesTo: null | PieceType

  constructor(from: Coord, to: Coord, promotesTo: null | PieceType = null) {
    this.from = from
    this.to = to
    this.promotesTo = promotesTo
  }

  is(other: Move) {
    return this.from.is(other.from)
        && this.to.is(other.to)
        && this.promotesTo === other.promotesTo
  }
}

class Chess {
  [immerable] = true

  /** Which player's turn it is */
  turnColor: PieceColor = PieceColor.White

  /** Coordinate of a pawn which can be captured en passant */
  enPassantTo: null | Coord = null

  /** Whether or not each player can castle and in each direction.
    * OOO = queenside (toward lower files).
    * OO = kingside (toward higher files). */
  canCastle = {
    wOOO: true,
    wOO: true,
    bOOO: true,
    bOO: true,
  }

  /** 8x8 array of arrays of contents of squares on the board */
  board: P[][] = _.range(8).map(file =>
    _.range(8).map(rank => {
      // rank 3-6 empty
      if (Rank.R3 <= rank && rank <= Rank.R6) {
        return null
      }
      // white looks like this:
      //   rank 2: P P P P P P P P
      //   rank 1: R N B Q K B N R
      //     file: a b c d e f g h
      // black has the same pieces on ranks 7 and 8, vertically mirrored
      const color = rank <= Rank.R2 ? PieceColor.White : PieceColor.Black
      const type =
        rank === Rank.R2 || rank === Rank.R7 ? PieceType.P :  // pawns on ranks 2 and 7
        file === File.Fa || file === File.Fh ? PieceType.R :  // rooks on files a and h
        file === File.Fb || file === File.Fg ? PieceType.N :  // knights on files b and g
        file === File.Fc || file === File.Ff ? PieceType.B :  // bishops on files c and f
        file === File.Fd                     ? PieceType.Q :  // queens on file d
        file === File.Fe                     ? PieceType.K :  // kings on file e
        (()=>{throw new Error('Could not initialize chessboard')})()
      return { color, type }
    }))

  /** The square contents at `coord` (`null` if out of bounds) */
  at(coord: Coord): P {
    const { file, rank } = coord
    return 0 <= file && file <= 7 && 0 <= rank && rank <= 7
      ? this.board[coord.file][coord.rank] : null
  }

  /** The same board state with the contents at `coord` instead being `piece` */
  _withAt(coord: Coord, piece: P): Chess {
    return produce(this, draft => {
      draft.board[coord.file][coord.rank] = piece
    })
  }

  /** Update canEnPassant for the next turn */
  _withCanEnPassant(move: Move): Chess {
    return produce(this, draft => {
      const { from, to } = move
      draft.enPassantTo =
        this.at(from)?.type === PieceType.P && Math.abs(from.rank - to.rank) === 2
          ? to : null
    })
  }

  /** Remove (capture) the piece behind the pawn that is capturing en passant, if such a move was played. */
  _withCapturedEnPassant(move: Move): Chess {
    const { from, to } = move
    // the move was en passant only if it is a pawn and was moving into the en passant square
    const isEnPassant = this.at(from)?.type === PieceType.P && this.enPassantTo?.is(to)
    if (!isEnPassant) return this
    // delete the piece (pawn) at the square behind it
    // (en passant can only occur on R3 and R6, capturing R4 and R5 respectively)
    const capturedCoord = new Coord(to.file, to.rank === Rank.R3 ? Rank.R4 : Rank.R5)
    return this._withAt(capturedCoord, null)
  }

  /** Complete a castling move by updating `this.canCastle` and moving the right rook,
   *  or disallow castling with a king or rook that moved.
   */
  _withCastle(move: Move): Chess {
    const { from, to } = move
    const piece = this.at(from)
    const type = piece?.type
    const homeRank = this.turnColor === PieceColor.White ? Rank.R1 : Rank.R8
    const castleColor = this.turnColor === PieceColor.White ? 'w' : 'b'
    return produce(this, draft => {
      const disableQueenside = () => draft.canCastle[`${castleColor}OOO`] = false
      const disableKingside  = () => draft.canCastle[`${castleColor}OO`] = false
      switch (type) {
        // A normal rook move
        case PieceType.R:
          // If either rook moves out of a home square, disable castling on that side
          if (from.rank === homeRank) {
            switch (from.file) {
              case File.Fa:
                disableQueenside()
                break
              case File.Fh:
                disableKingside()
                break
            }
          }
          break
        // A normal king move, or a castle
        case PieceType.K:
          // If a king moves (including castling), disable castling for both sides
          if (type === PieceType.K) {
            disableQueenside()
            disableKingside()
          }
          // We only need to move the rook if this is a castle
          // This is a castle if the main piece is a king and they move two files
          const isCastle = type === PieceType.K && Math.abs(from.file - to.file) === 2
          if (!isCastle) break
          // The direction of castling determines which rook moves and where
          // King moves to file c (queenside): the rook on file a moves to file d
          // King moves to file g (kingside):  the rook on file h moves to file f
          const rookFileFrom = to.file === File.Fc ? File.Fa : File.Fh
          const rookFileTo   = to.file === File.Fc ? File.Fd : File.Ff
          draft.board[homeRank][rookFileFrom] = null
          draft.board[homeRank][rookFileTo] = piece
          break
        default:
          // nothing else affects whether or not we can castle
          break
      }
    })
  }

  /** The board as is, but on the next turn, as if the turn was passed.
   *  Not a legal move in standard chess, but can be used to complete turns in a functional style.
   */
  _withPass(): Chess {
    return produce(this, draft => {
      draft.turnColor = draft.turnColor === PieceColor.White ? PieceColor.Black : PieceColor.White
    })
  }

  legalMovesFrom(from: Coord): Move[] {
    throw new Error('not yet implemented')
    let moves: Move[] = []
    const isWhite = this.turnColor === PieceColor.White
    switch (this.at(from)?.type) {
      case null:
        // can't move an empty square
        break
      case PieceType.P:
        // the rank the pawn starts at
        const homeRank = isWhite ? Rank.R2 : Rank.R7
        // the rank the pawn promotes at
        const promotingRank = isWhite ? Rank.R8 : Rank.R1
        // the direction the pawn moves, relative to up
        const step = isWhite ? 1 : -1
        const allow = (to: Coord): void => {
          // augment the moves we add with promotion options if they are on the promoting rank
          if (to.rank !== promotingRank) {
            moves.push(new Move(from, to))
          }
          [PieceType.N, PieceType.B, PieceType.R, PieceType.Q].map(type => {
            moves.push(new Move(from, to, type))
          })
        }
        // if on home square allow moving two spaces
        if (from.rank === homeRank) {
          allow(new Coord(from.file, from.rank + step))
        }
        // we can en passant if our pawn can capture forward into it
        const enPassantTo = this.enPassantTo
        if (enPassantTo
            && Math.abs(from.file - enPassantTo.file) === 1
            && from.rank + step === enPassantTo.rank) {
          allow(enPassantTo)
        }
        // if forward space is clear, allow move
        const forwardTo = from.up(step)
        if (!this.at(forwardTo)) {
          allow(forwardTo)
        }
        // if diagonal step either way is occupied by enemy, allow capture
        const allowCapture = (to: Coord) => {
          if (this.at(to)) {
            allow(to)
          }
        }
        allowCapture(forwardTo.right(-1))
        allowCapture(forwardTo.right(1))
        break
      case PieceType.N:
    }
    return moves
  }

  /** Can the current player make this move? */
  canMove(move: Move): boolean {
    return this.legalMovesFrom(move.from).filter(move.is.bind(move)).length > 0
  }

  doesNeedPromotion(move: Move): boolean {
    const oppositeRank = this.turnColor === PieceColor.White ? Rank.R8 : Rank.R1
    return this.at(move.from)?.type === PieceType.P && move.to.rank === oppositeRank
  }

  /** The game after `move` is played, or `null` if the move is illegal. */
  afterMove(move: Move): Chess | null {
    if (!this.canMove(move)) return null
    const { from, to, promotesTo } = move
    // if promoting, use the new piece type
    const piece = promotesTo ? { color: this.turnColor, type: promotesTo } : this.at(from)
    return this
      ._withCapturedEnPassant(move)  // if en passant, also delete captured pawn
      ._withCanEnPassant(move)  // update en passant record
      ._withCastle(move)  // also move rook and update flags if castle
      ._withAt(from, null)  // remove piece in old square
      ._withAt(to, piece)  // overwrite piece into new square
      ._withPass()
  }
}

export { PieceColor, PieceType, Coord, Move, Chess }