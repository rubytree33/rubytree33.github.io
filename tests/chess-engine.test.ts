import { describe, test, expect } from '@jest/globals'
import _ from 'lodash'
import { newChess, afterMove, GameResult, Move, Chess, PieceColor } from '../src/features/chess/chess'

describe('chess engine', () => {
  test("White plays first", () => {
    expect(newChess().turnColor).toEqual(PieceColor.White)
  })
})