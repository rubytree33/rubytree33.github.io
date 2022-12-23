import { describe, test, expect } from '@jest/globals'
import { Coord, newChess, PieceColor, PieceType, File, Rank, GameResult, afterMove, legalMoves, Chess, pieceAt, isInCheck, opponent, winner } from '../src/features/chess/chess'
import nearley, { CompiledRules } from 'nearley'
import grammar from './chess-grammar'
import _ from 'lodash'

interface ParsedGame {
  moves: {
    color: PieceColor
    type: PieceType
    from: { file?: File, rank?: Rank }
    capture: boolean
    to: Coord
    promotesTo?: PieceType
    moveNote: string
  }[]
  result?: GameResult
}

/** Confirm that a game plays out under the engine as expected per its notation.
 * @param name The name of the game, for logging purposes.
 * @param gameString A text representation of the game in standard notation.
 */
const testGame = (name: string, gameString: string): void => {
  test(`can simulate ${name}`, () => {
    // `as` is safe so long as the compiler works
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar as CompiledRules))
    // `ParsedGame` needs to be updated manually since nearley doesn't supply type inference
    const { moves, result } = parser.feed(gameString).results[0] as ParsedGame

    // compute the result of the moves while checking that the game follows the notation along the way
    const finishedGame = moves.reduce((before, moveRecord) => {
      // stop doing checks when the game state is no longer valid
      if (!before) return before

      // are we on the right turn?
      expect(before.turnColor).toEqual(moveRecord.color)

      const isCapture = !!moveRecord.capture
      const targetPiece = pieceAt(before, moveRecord.to)
      // are we capturing or not capturing as recorded?
      expect(targetPiece?.color === opponent(moveRecord.color)).toBe(isCapture)
      expect(!targetPiece).toBe(!isCapture)

      // find the origin of the move to help the engine
      const possibleMoves = legalMoves(before).filter(move =>
        _.isEqual(moveRecord.to, move.to)  // same target
        && moveRecord.promotesTo === move.promotesTo  // same resulting piece
        && moveRecord.color === pieceAt(before, move.from)?.color  // same color
        && moveRecord.type === pieceAt(before, move.from)?.type  // same type
        && (!moveRecord.from.file || moveRecord.from.file === move.from.file)  // same starting file if mentioned
        && (!moveRecord.from.rank || moveRecord.from.rank === move.from.rank)  // same starting rank if mentioned
      )
      // the notation should be unambiguous, and we must have a move to play to continue
      expect(possibleMoves.length).toEqual(1)

      const move = {
        from: possibleMoves[0].from, 
        to: moveRecord.to,
        ...moveRecord.promotesTo ? { promotesTo: moveRecord.promotesTo } : {},
      }
      const after = afterMove(before, move)
      // the move must be playable to continue
      expect(after).not.toBeNull()
      // (this is just to make the change of type explicit for typescript)
      if (!after) return null

      // the player whose turn it now is should be in check if the notation says so
      expect(isInCheck(after)).toBe(['+', '#'].includes(moveRecord.moveNote))

      // the game should have ended in checkmate if the notation says so
      expect(winner(after) === moveRecord.color).toBe(moveRecord.moveNote === '#')

      return after
    }, newChess() as Chess | null)
    if (!finishedGame) return  // the null test is in the reduce so we don't need to repeat it

    expect(finishedGame.gameResult).toBe(result)
  })
}

describe('chess engine', () => {
  test("white plays first", () => {
    expect(newChess().turnColor).toBe(PieceColor.White)
  })

  testGame("fool's mate", '1. f3 e5 2. g4 Qh4# 0-1')
  testGame("reverse fool's mate", '1. e4 f6 2. e5 g5 3. Qh5# 1-0')
})