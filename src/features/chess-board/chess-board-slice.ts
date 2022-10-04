import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Coord {
  x: number,
  y: number,
}

interface BoardState {
  selection: null | Coord
}

const initialState: BoardState = {
  selection: null,
}

const chessboardSlice = createSlice({
  name: 'chessboard',
  initialState,
  reducers: {
    deselectSquare(state) {
      state.selection = null
    },
    selectSquare(state, action: PayloadAction<Coord>) {
      state.selection = action.payload
    }
  },
})

export const { selectSquare, deselectSquare } = chessboardSlice.actions
export default chessboardSlice.reducer
export type { Coord }