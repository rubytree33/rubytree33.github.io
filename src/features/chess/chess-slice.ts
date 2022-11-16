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
  /** A record of the stages of the game so far. */
  history: Chess[]
}

/** Reset move selection */
function deselect(state: ChessState) {
  state.selection = null
  state.promotionDraft = null
}

function getGame(state: ChessState): Chess {
  const game = state.history.at(-1)
  if (!game) throw new Error('A chess game state was needed, but there are none.')
  return game
}

function changeGame(state: ChessState, game: Chess) {
  state.history.push(game)
}

/** Check if this move is illegal and if so emit an error to console */
function checkIllegal(state: ChessState, move: Move): boolean {
  const isIllegal = !canMove(getGame(state), move)
  if (isIllegal) {
    console.error('An illegal move was attempted')
  }
  return isIllegal
}

/** Start an animated move */
function startMove(state: ChessState, move: Move, onComplete = (()=>{})): void {
  deselect(state)
  // TODO: implement animation and interface lock; for now the move happens instantly
  const game = getGame(state)
  changeGame(state, afterMove(game, move) || game)
}

const initialState: ChessState = {
  selection: null,
  promotionDraft: null,
  activeAnimation: null,
  history: [newChess()],
}

const chessSlice = createSlice({
  name: 'chess',
  initialState,
  reducers: {
    deselectSquare(state) {
      deselect(state)
    },

    selectSquare(state, action: PayloadAction<Coord>) {
      state.selection = action.payload
    },

    tryMove(state, action: PayloadAction<Move>): void {
      const move: Move = action.payload
      const game: Chess = getGame(state)
      // activate promotion interface if promoting move is started
      if (doesNeedPromotion(game, move)) {
        state.promotionDraft = move
        return
      }
      if (checkIllegal(state, move)) {
        console.error('An illegal move was attempted.')
        return
      }
      // immediately begin legal non-promotion moves
      startMove(state, move)
    },

    /** Interface confirmation of a promoting move, with the new piece type */
    completePromotion(state, action: PayloadAction<PieceType>) {
      const promotesTo = action.payload
      const move = state.promotionDraft
      if (!move) {
        console.error('promotion attempted without move coordinates')
        return
      }
      startMove(state, { ...move, promotesTo })
    },

    restart(state) {
      changeGame(state, initialState.history[0])
    }
  },
})

export const { selectSquare, deselectSquare, tryMove, completePromotion, restart } = chessSlice.actions
export { getGame }
export default chessSlice.reducer