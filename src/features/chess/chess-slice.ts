import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import _ from 'lodash'
import { Coord, Move, Chess, PieceType, newChess, pieceAt, canMove, afterMove, doesNeedPromotion } from './chess'

interface ChessState {
  /** The coordinate of the selected piece if there is one */
  selection: null | Coord
  /** A move where a pawn is about to promote if such a move is being confirmed */
  promotionDraft: null | Move
  /** Information about an interface-locking animation if there is one */
  activeAnimation: null | {
    onComplete?: null | (() => void),
  }
  /** The current state of the game */
  game: Chess
}

/** Reset move selection */
function deselect(state: ChessState) {
  state.selection = null
  state.promotionDraft = null
}

/** Check if this move is illegal and if so emit an error to console */
function checkIllegal(state: ChessState, move: Move): boolean {
  const isIllegal = !canMove(state.game, move)
  if (isIllegal) {
    console.error('An illegal move was attempted')
  }
  return isIllegal
}

/** Start an animated move */
function startMove(state: ChessState, move: Move, onComplete = (()=>{})): void {
  // TODO: implement animation and interface lock; for now the move happens instantly
  state.game = afterMove(state.game, move) || state.game
}

/** Try to start a move (as an action from the interface) */
function tryMove(state: ChessState, move: Move): void {
  if (checkIllegal(state, move)) return
  // activate promotion interface if promoting move is started
  if (doesNeedPromotion(state.game, move)) {
    state.promotionDraft = move
    return
  }
  // immediately begin legal non-promotion moves
  startMove(state, move)
}

const initialState: ChessState = {
  selection: null,
  promotionDraft: null,
  activeAnimation: null,
  game: newChess(),
}

const chessSlice = createSlice({
  name: 'chess',
  initialState,
  reducers: {
    deselectSquare(state) {
      deselect(state)
    },

    selectSquare(state, action: PayloadAction<Coord>) {
      const game = state.game
      const oldSelection = state.selection
      const newSelection = action.payload

      // just select a piece if no square is selected
      if (!oldSelection) {
        const piece = pieceAt(game, newSelection)
        // only select pieces of the player whose turn it is
        if (piece && piece.color === game.turnColor) {
          state.selection = newSelection
        }
      }
      // remove selection if same square is selected
      else if (_.isEqual(oldSelection, newSelection)) {
        deselect(state)
      }
      // try to move if new square is selected
      else {
        tryMove(state, { from: oldSelection, to: newSelection })
        deselect(state)
      }
    },

    /** Interface confirmation of a promoting move, with the new piece type */
    promote(state, action: PayloadAction<PieceType>) {
      const promotesTo = action.payload
      const move = state.promotionDraft
      if (!move) {
        console.error('promotion attempted without move coordinates')
        return
      }
      startMove(state, { ...move, promotesTo })
      deselect(state)
    },
  },
})

export const { selectSquare, deselectSquare } = chessSlice.actions
export default chessSlice.reducer