import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { immerable } from 'immer'
import _ from 'lodash'
import { Coord, Move, Chess, PieceColor, PieceType } from './chess'

class ChessState {
  [immerable] = true
  /** The coordinate of the selected piece if there is one */
  selection: null | Coord = null
  /** A move where a pawn is about to promote if such a move is being confirmed */
  promotionDraft: null | Move = null
  /** Information about an interface-locking animation if there is one */
  activeAnimation: null | {
    onComplete?: null | (() => void),
  } = null
  /** The current state of the game */
  game: Chess = new Chess()

  /** Reset move selection */
  deselect() {
    this.selection = null
    this.promotionDraft = null
  }

  /** Check if this move is illegal and if so emit an error to console */
  checkIllegal(move: Move): boolean {
    const isIllegal = !this.game.canMove(move)
    if (isIllegal) {
      console.error('An illegal move was attempted')
    }
    return isIllegal
  }

  /** Start an animated move */
  startMove(move: Move, onComplete = (()=>{})): void {
    // TODO: implement animation and interface lock; for now the move happens instantly
    this.game = this.game.afterMove(move) || this.game
  }

  /** Try to start a move (as an action from the interface) */
  tryMove(move: Move): void {
    if (this.checkIllegal(move)) return
    // activate promotion interface if promoting move is started
    if (this.game.doesNeedPromotion(move)) {
      this.promotionDraft = move
      return
    }
    // immediately begin legal non-promotion moves
    this.startMove(move)
  }
}

const initialState: ChessState = new ChessState()

const chessSlice = createSlice({
  name: 'chess',
  initialState,
  reducers: {
    deselectSquare(state) {
      state.deselect()
    },

    selectSquare(state, action: PayloadAction<Coord>) {
      const game = state.game
      const oldSelection = state.selection
      const newSelection = action.payload

      // just select a piece if no square is selected
      if (!oldSelection) {
        const piece = game.at(newSelection)
        // only select pieces of the player whose turn it is
        if (piece && piece.color === game.turnColor) {
          state.selection = newSelection
        }
      }
      // remove selection if same square is selected
      else if (oldSelection.is(newSelection)) {
        state.deselect()
      }
      // try to move if new square is selected
      else {
        state.tryMove(new Move(oldSelection, newSelection))
        state.deselect()
      }
    },

    /** Interface confirmation of a promoting move, with the new piece type */
    promote(state, action: PayloadAction<PieceType>) {
      const newType = action.payload
      const move = state.promotionDraft
      if (!move) {
        console.error('promotion attempted without move coordinates')
        return
      }
      state.startMove(new Move(move.from, move.to, newType))
      state.deselect()
    },
  },
})

export const { selectSquare, deselectSquare } = chessSlice.actions
export default chessSlice.reducer