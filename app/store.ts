// TODO: Figure out the directory structure when using redux toolkit
import { configureStore } from '@reduxjs/toolkit'
import { excavatorApi } from './features/excavatorApi'
import { authApi } from './features/authApi'

export const store = configureStore({
  reducer: {
    [excavatorApi.reducerPath]: excavatorApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(excavatorApi.middleware)
      .concat(authApi.middleware),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
