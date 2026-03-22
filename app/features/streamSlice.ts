import { createSlice } from '@reduxjs/toolkit'

export type Telemetry = {
  id: string
  phase: string
  position: { x: number; z: number }
  bodyRotation: number
  armAngle: number
  bucketDepth: number
  battery: number
  alert: string | null
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

const streamSlice = createSlice({
  name: 'stream',
  initialState: {
    telemetry: null as Telemetry | null,
    status: 'disconnected' as ConnectionStatus,
    error: null as string | null,
  },
  reducers: {
    connectionEstablished(state) {
      state.status = 'connected'
      state.error = null
    },
    telemetryReceived(state, action: { payload: Telemetry }) {
      state.telemetry = action.payload
    },
    connectionClosed(state) {
      state.status = 'disconnected'
    },
    connectionError(state, action: { payload: string }) {
      state.status = 'error'
      state.error = action.payload
    },
    connectionInitiated(state) {
      state.status = 'connecting'
    },
    connect: () => {},
    disconnect: () => {},
  },
})

export const {
  connect,
  disconnect,
  connectionEstablished,
  connectionInitiated,
  telemetryReceived,
  connectionClosed,
  connectionError,
} = streamSlice.actions

export default streamSlice.reducer
