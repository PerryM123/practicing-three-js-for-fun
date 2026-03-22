import { createSlice } from '@reduxjs/toolkit'

type StreamMessage = Record<string, unknown> | string | number | boolean | null
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

const streamSlice = createSlice({
  name: 'stream',
  initialState: {
    messages: [] as StreamMessage[],
    status: 'disconnected' as ConnectionStatus,
    error: null as string | null,
  },
  reducers: {
    // Triggered by the middleware when the socket opens
    connectionEstablished(state) {
      state.status = 'connected'
      state.error = null
    },
    // Triggered by the middleware on each incoming message
    messageReceived(state, action) {
      state.messages.push(action.payload)
    },
    // Triggered when the socket closes
    connectionClosed(state) {
      state.status = 'disconnected'
    },
    connectionError(state, action) {
      state.status = 'disconnected'
      state.error = action.payload
    },
    // These two are intercepted by the middleware — they don't mutate state directly
    connect: () => {},
    disconnect: () => {},
  },
})

export const {
  connect,
  disconnect,
  connectionEstablished,
  messageReceived,
  connectionClosed,
  connectionError,
} = streamSlice.actions

export default streamSlice.reducer
