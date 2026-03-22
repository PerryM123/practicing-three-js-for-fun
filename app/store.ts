// TODO: Figure out the directory structure when using redux toolkit
import { configureStore } from '@reduxjs/toolkit'
import streamReducer from './features/streamSlice'
// import websocketMiddleware from './features/websocketMiddleware'

export const store = configureStore({
  reducer: {
    stream: streamReducer,
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(websocketMiddleware),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
