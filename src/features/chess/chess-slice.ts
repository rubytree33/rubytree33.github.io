import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import _ from 'lodash'

interface Coord {
  x: number,
  y: number,
}

const enum PieceColor { White, Black }
/** Chess piece type in standard notation:
 *  Pawn, kNight, Bishop, Rook, Queen, King */
const enum PieceType { P, N, B, R, Q, K }
/** A chess piece, or empty. (Board square contents) */
type P = null | { color: PieceColor, type: PieceType }

const enum Rank { R1 = 0, R2, R3, R4, R5, R6, R7, R8 }
const enum File { Fa = 0, Fb, Fc, Fd, Fe, Ff, Fg, Fh }

interface BoardState {
  selection: null | Coord,
  board: P[][],
}

const initialState: BoardState = {
  selection: null,
  board: _.range(8).map(y =>
    _.range(8).map(x => {
      // rank 3-6 empty
      if (Rank.R3 <= y && y <= Rank.R6) {
        return null
      }

      // white looks like this:
      //   rank 2: P P P P P P P P
      //   rank 1: R N B Q K B N R
      //     file: a b c d e f g h
      // black has the same pieces on ranks 7 and 8, vertically mirrored

      // white on low ranks, black on high ranks
      const color = y <= Rank.R2 ? PieceColor.White : PieceColor.Black

      const type =
        y === Rank.R2 || y === Rank.R6 ? PieceType.P :  // pawns on ranks 2 and 7
        x === File.Fa || x === File.Fh ? PieceType.R :  // rooks on files a and h
        x === File.Fb || x === File.Fg ? PieceType.N :  // knights on files b and g
        x === File.Fc || x === File.Ff ? PieceType.B :  // bishops on files c and f
        x === File.Fd                  ? PieceType.Q :  // queens on file d
        x === File.Fe                  ? PieceType.K :  // kings on file e
        (()=>{throw new Error('Could not initialize chessboard')})()

      return { color, type }
    })),
}

const chessSlice = createSlice({
  name: 'chess',
  initialState,
  reducers: {
    deselectSquare(state) {
      state.selection = null
    },

    selectSquare(state, action: PayloadAction<Coord>) {
      state.selection = action.payload
    },
  },
})

export const { selectSquare, deselectSquare } = chessSlice.actions
export default chessSlice.reducer
export type { Coord }