import { describe, test, expect } from '@jest/globals'
import { Coord, newChess, PieceColor, PieceType, File, Rank, GameResult, afterMove, legalMoves, Chess, pieceAt, isInCheck } from '../src/features/chess/chess'
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

const testGame = (name: string, gameString: string): void => {
  test(`can simulate ${name}`, () => {
    // `as` is safe so long as the compiler works
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar as CompiledRules))
    // `ParsedGame` needs to be updated manually since nearley doesn't supply type inference
    const { moves, result } = parser.feed(gameString).results[0] as ParsedGame
    console.log(moves)
    const finishedGame = moves.reduce((before, moveRecord) => {
      // stop doing checks when the game state is no longer valid
      if (!before) return before
      const { color, type, from, capture, to, promotesTo, moveNote } = moveRecord

      // are we on the right turn?
      expect(before.turnColor).toEqual(color)

      const opponent = color === PieceColor.White ? PieceColor.Black : PieceColor.White
      const isCapture = !!capture
      const targetPiece = pieceAt(before, to)

      // are we capturing or not capturing as recorded?
      expect(targetPiece?.color === opponent).toBe(isCapture)
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

      // is the notation ambiguous due to an incorrect board state?
      expect(possibleMoves.length).toEqual(1)

      if (possibleMoves.length < 1) return null  // need a move to continue playing
      const move = Object.assign({},
        { from: possibleMoves[0].from, to },
        promotesTo ? { promotesTo } : {},
      )
      const after = afterMove(before, move)

      expect(after).not.toBeNull()

      if (!after) return null

      expect(isInCheck(after)).toBe(moveNote === '+')

      const winner = after.gameResult !== null && (
        after.gameResult === GameResult.WhiteWins ? PieceColor.White
        : after.gameResult === GameResult.BlackWins ? PieceColor.Black
        : null
      )

      expect(winner === color).toBe(moveNote === '#')

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