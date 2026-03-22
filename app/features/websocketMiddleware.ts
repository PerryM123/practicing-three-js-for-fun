// TODO: Should I be using a /lib directory??
import type { Middleware } from '@reduxjs/toolkit'
import {
  connect,
  disconnect,
  connectionEstablished,
  connectionInitiated,
  telemetryReceived,
  connectionClosed,
  connectionError,
} from './streamSlice'
import type { Telemetry } from './streamSlice'

const WS_URL =
  (import.meta.env.VITE_TELEMETRY_WEB_SOCKET_URL as string) ||
  'ws://localhost:8080'

const THROTTLE_MS = 200 // Max ~5 updates/sec to reduce Redux churn

function isTelemetry(data: unknown): data is Telemetry {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'phase' in data &&
    'battery' in data
  )
}

const websocketMiddleware: Middleware = (store) => {
  console.log('perry: websocketMiddleware: store: ', store)
  let socket: WebSocket | null = null
  let lastDispatchAt = 0
  let pendingData: Telemetry | null = null
  let throttleTimer: ReturnType<typeof setTimeout> | null = null

  const flushPending = () => {
    throttleTimer = null
    if (pendingData) {
      lastDispatchAt = Date.now()
      store.dispatch(telemetryReceived(pendingData))
      pendingData = null
    }
  }

  return (next) => (action) => {
    console.log('perry: websocketMiddleware: next action')
    if (connect.match(action)) {
      if (socket) {
        socket.close()
      }
      store.dispatch(connectionInitiated())
      socket = new WebSocket(WS_URL)
      socket.onopen = () => {
        store.dispatch(connectionEstablished())
      }
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (!isTelemetry(data)) return
          const now = Date.now()
          if (now - lastDispatchAt >= THROTTLE_MS) {
            lastDispatchAt = now
            store.dispatch(telemetryReceived(data))
            pendingData = null
            if (throttleTimer) {
              clearTimeout(throttleTimer)
              throttleTimer = null
            }
          } else {
            pendingData = data
            if (!throttleTimer) {
              const delay = Math.max(0, THROTTLE_MS - (now - lastDispatchAt))
              throttleTimer = setTimeout(flushPending, delay)
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
      socket.onerror = (e: Event) => {
        const message = e instanceof ErrorEvent ? e.message : 'WebSocket error'
        store.dispatch(connectionError(message || 'WebSocket error'))
      }
      socket.onclose = () => {
        if (throttleTimer) clearTimeout(throttleTimer)
        store.dispatch(connectionClosed())
        socket = null
      }
      return
    }
    if (disconnect.match(action)) {
      if (throttleTimer) clearTimeout(throttleTimer)
      socket?.close()
      socket = null
      return
    }
    return next(action)
  }
}

export default websocketMiddleware
