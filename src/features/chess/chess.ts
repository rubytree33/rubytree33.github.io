import _ from 'lodash'
import { produce, immerable } from 'immer'

const enum Rank { R1 = 0, R2, R3, R4, R5, R6, R7, R8 }
const enum File { Fa = 0, Fb, Fc, Fd, Fe, Ff, Fg, Fh }

interface Coord {
  file: File
  rank: Rank
}

function up(coord: Coord, offset: number): Coord {
  return { file: coord.file, rank: coord.rank + offset }
}

function right(coord: Coord, offset: number): Coord {
  return { file: coord.file + offset, rank: coord.rank }
}

function plus(coord: Coord, other: Coord): Coord {
  return { file: coord.file + other.file, rank: coord.rank + other.rank }
}

const enum PieceColor { White, Black }

/** Chess piece type in standard notation:
 *  Pawn, **kNight**, Bishop, Rook, Queen, King */
const enum PieceType { P, N, B, R, Q, K }

/** A chess piece, or empty. (Board square contents) */
type P = null | { color: PieceColor, type: PieceType }

interface Move {
  /** The origin square of the primary piece of the move. */
  from: Coord
  /** The destination square of the primary piece of the move. */
  to: Coord
  /** The type the pawn will become, or `undefined`. */
  promotesTo?: PieceType
}

interface Chess {
  /** Which player's turn it is */
  turnColor: PieceColor
  /** Coordinate of a pawn which can be captured en passant */
  canEnPassant: null | Coord
  /** Whether or not each player can castle and in each direction.
    * OOO = queenside (toward lower files).
    * OO = kingside (toward higher files). */
  canCastle: {
    wOOO: boolean
    wOO: boolean
    bOOO: boolean
    bOO: boolean
  }
  /** 8x8 array of arrays of contents of squares on the board */
  board: P[][]
}

function newChess(): Chess {
  return {
    turnColor: PieceColor.White,
    canEnPassant: null,
    canCastle: {
      wOOO: true,
      wOO: true,
      bOOO: true,
      bOO: true,
    },
    board: _.range(8).map(file =>
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
      })),
  }
}

function isInBounds(coord: Coord): boolean {
  const { file, rank } = coord
  return 0 <= file && file <= 7 && 0 <= rank && rank <= 7
}

/** The square contents at `coord` (`null` if out of bounds) */
function at(game: Chess, coord: Coord): P {
  const { file, rank } = coord
  return isInBounds(coord) ? game.board[file][rank] : null
}

const coords: Coord[] =
  _.range(8).flatMap(file =>
    _.range(8).map(rank =>
      ({ file, rank })))

/** The coordinates of the pieces of the current player */
function friendlyCoords(game: Chess): Coord[] {
  return coords.filter(coord => at(game, coord)?.color === game.turnColor)
}

/** The same board state with the contents at `coord` instead being `piece` */
function _withAt(game: Chess, coord: Coord, piece: P): Chess {
  return produce(game, draft => {
    draft.board[coord.file][coord.rank] = piece
  })
}

/** Remove (capture) the piece behind the pawn that is capturing en passant, if such a move was played.
 *  Also ensure the en passant flag is correctly set for the next turn.
*/
function _withEnPassant(game: Chess, move: Move): Chess {
  const { from, to } = move
  // the direction the pawn moves
  const forward = game.turnColor === PieceColor.White ? 1 : -1
  const behind = up(to, -forward)
  // the move was en passant only if it is a pawn and was moving behind the en passant square
  const isEnPassant = at(game, from)?.type === PieceType.P && _.isEqual(game.canEnPassant, behind)
  // if it happens, delete the enemy pawn behind the pawn
  const withCaptured = isEnPassant ? _withAt(game, behind, null) : game
  return produce(withCaptured, draft => {
    // pawn can be captured en passant only if it moved two squares (only possibly in rank)
    draft.canEnPassant =
      at(game, from)?.type === PieceType.P && Math.abs(from.rank - to.rank) === 2
        ? to : null
  })
}

/** Complete a castling move by updating `game.canCastle` and moving the right rook,
 *  or disallow castling with a king or rook that moved.
 */
function _withCastle(game: Chess, move: Move): Chess {
  const { from, to } = move
  const piece = at(game, from)
  const type = piece?.type
  const homeRank = game.turnColor === PieceColor.White ? Rank.R1 : Rank.R8
  const castleColor = game.turnColor === PieceColor.White ? 'w' : 'b'
  return produce(game, draft => {
    function disableQueenside() { draft.canCastle[`${castleColor}OOO`] = false }
    function disableKingside () { draft.canCastle[`${castleColor}OO`]  = false }
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
function _withPass(game: Chess): Chess {
  return produce(game, draft => {
    draft.turnColor = draft.turnColor === PieceColor.White ? PieceColor.Black : PieceColor.White
  })
}

/** Legal moves from the current position plus moves that put the player's king in check. */
// (defined separately to prevent infinite mutual recursion in move finding)
function _illegalMovesFrom(game: Chess, from: Coord): Move[] {
  let moves: Move[] = []
  const friendly = game.turnColor
  const isWhite = friendly === PieceColor.White
  const opponent = isWhite ? PieceColor.Black : PieceColor.White
  /** Add a legal move to the result, ignoring out of bounds and self-capture */
  const allow = (to: Coord): void => {
    if (isInBounds(to) && at(game, to)?.color !== friendly) {
      moves.push({ from, to })
    }
  }
  /** Add legal moves in a direction until hitting a piece or leaving the board, including capture if it's an enemy */
  const allowRay = (heading: Coord): void => {
    let to = from
    do {
      to = plus(to, heading)
      // move into empty squares or capture the enemy if this is the last one
      allow(to)
    } while (isInBounds(to) && at(game, to) === null)
  }
  /** Add "bishop moves" (diagonal) */
  const allowBishop = (): void => {
    for (const file of [-1, 1]) {
      for (const rank of [-1, 1]) {
        allowRay({ file, rank })
      }
    }
  }
  /** Add "rook moves" (orthogonal) */
  const allowRook = (): void => {
    for (const dEither of [-1, 1]) {
      allowRay({ file: dEither, rank: 0 })
      allowRay({ file: 0, rank: dEither })
    }
  }
  switch (at(game, from)?.type) {
    case null:
      // can't move an empty square
      break
    case PieceType.P:
      // the rank the pawn starts at
      const homeRank = isWhite ? Rank.R2 : Rank.R7
      // the rank the pawn promotes at
      const promotingRank = isWhite ? Rank.R8 : Rank.R1
      // the direction the pawn moves, relative to up
      const forward = isWhite ? 1 : -1
      const allowPawn = (to: Coord): void => {
        // augment the moves we add with promotion options if they are on the promoting rank
        if (to.rank !== promotingRank) {
          allow(to)
        }
        [PieceType.N, PieceType.B, PieceType.R, PieceType.Q].map(promotesTo => {
          moves.push({ from, to, promotesTo })
        })
      }
      // if on home square allow moving two spaces
      if (from.rank === homeRank) {
        allowPawn(up(from, 2*forward))
      }
      // we can en passant if our pawn is next to the pawn that can be captured en passant
      const canEnPassant = game.canEnPassant
      if (canEnPassant
          && Math.abs(from.file - canEnPassant.file) === 1
          && from.rank === canEnPassant.rank) {
        allowPawn(up(canEnPassant, forward))
      }
      // if forward space is clear, allow move
      const forwardTo = up(from, forward)
      if (!at(game, forwardTo)) {
        allowPawn(forwardTo)
      }
      // if diagonal step either way is occupied by enemy, allow capture
      for (const dFile of [-1, 1]) {
        const to = right(forwardTo, dFile)
        if (at(game, to)?.color === opponent) allowPawn(to)
      }
      break
    case PieceType.N:
      // a knight moves 1 in one direction and 2 in the other to non-friendly
      for (const [fileAbs, rankAbs] of [[1, 2], [2, 1]]) {
        for (const fileSign of [-1, 1]) {
          for (const rankSign of [-1, 1]) {
            const to = up(right(from, fileSign*fileAbs), rankSign*rankAbs)
            if (at(game, to)?.color !== friendly) {
              allow(to)
            }
          }
        }
      }
      break
    case PieceType.B:
      allowBishop()
      break
    case PieceType.R:
      // (note: the castling flags are reset in _withCastle after each move)
      allowRook()
      break
    case PieceType.Q:
      allowBishop()
      allowRook()
      break
    case PieceType.K:
      // (note: the castling flags are reset in _withCastle after each move)
      // a king can move one in all 8 directions
      for (const dFile of [-1, 0, 1]) {
        for (const dRank of [-1, 0, 1]) {
          // no moving in place
          if (dFile || dRank) {
            allow(up(right(from, dFile), dRank))
          }
        }
      }
      // can castle by moving two files while the correct flag is still `true`
      const pairs: [number, 'OOO' | 'OO'][] = [[-2, 'OOO'], [2, 'OO']]
      for (const [dFile, side] of pairs) {
        if (game.canCastle[`${isWhite ? 'w' : 'b'}${side}`]) {
          allow(right(from, dFile))
        }
      }
      break
  }
  return moves
}

/** Legal moves for the current player from this coordinate */
function legalMovesFrom(game: Chess, coord: Coord): Move[] {
  // we need to filter out moves that would allow current player's king to be captured
  return _illegalMovesFrom(game, coord).filter(move => {
    const future = _illegalAfterMove(game, move)  // hypothetical future after this move
    return friendlyCoords(future)  // coordinates of enemy pieces
      .flatMap(coord => _illegalMovesFrom(future, coord))  // moves enemy pieces can make
      .filter(move => {
        const piece = at(future, move.to)  // piece that is target of enemy move
        // would this move capture the *current* player's king?
        return piece?.color === game.turnColor && piece?.type === PieceType.K
      }).length === 0
  })
}

/** Can the current player make this move? */
function canMove(game: Chess, move: Move): boolean {
  return legalMovesFrom(game, move.from).filter(_.partial(_.isEqual, move)).length > 0
}

/** Is this move missing a `promotesTo` field to be legal? */
function doesNeedPromotion(game: Chess, move: Move): boolean {
  const oppositeRank = game.turnColor === PieceColor.White ? Rank.R8 : Rank.R1
  return at(game, move.from)?.type === PieceType.P && move.to.rank === oppositeRank
}

/** The game after `move` is played, allowing moves that put the king in check. */  
function _illegalAfterMove(game: Chess, move: Move): Chess {
  const { from, to, promotesTo } = move
  // if promoting, use the new piece type
  const piece = promotesTo ? { color: game.turnColor, type: promotesTo } : at(game, from)
  return _.flow(
    _.partialRight(_withEnPassant, move),  // handle en passant capture and record
    _.partialRight(_withCastle, move),  // move rook if castle, update castle flags
    _.partialRight(_withAt, from, null),  // remove piece in old square
    _.partialRight(_withAt, to, piece),  // overwrite piece into new square
    _.partialRight(_withPass)  // pass to next player
  )(game)
}

/** The game after `move` is played, or `null` if the move is illegal. */
function afterMove(game: Chess, move: Move): Chess | null {
  return canMove(game, move) ? _illegalAfterMove(game, move) : null
}

export type { Coord, Move, Chess }
export { PieceColor, PieceType, newChess, legalMovesFrom, canMove, afterMove, doesNeedPromotion }
export const pieceAt = at