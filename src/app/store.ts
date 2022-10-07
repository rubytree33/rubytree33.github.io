import { configureStore } from '@reduxjs/toolkit'
import chessReducer from '../features/chess/chess-slice'

export const store = configureStore({
  reducer: {
    chess: chessReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>