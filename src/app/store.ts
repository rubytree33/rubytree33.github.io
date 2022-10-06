import { configureStore } from '@reduxjs/toolkit'
import chessboardReducer from '../features/chess/chess-slice'

export const store = configureStore({
  reducer: {
    chessboard: chessboardReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>