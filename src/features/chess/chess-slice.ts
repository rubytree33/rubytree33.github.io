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

const chessSlice = createSlice({
  name: 'chess',
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

export const { selectSquare, deselectSquare } = chessSlice.actions
export default chessSlice.reducer
export type { Coord }