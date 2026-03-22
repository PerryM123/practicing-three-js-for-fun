// TODO: Should I be using a /lib directory??
import type { Middleware } from '@reduxjs/toolkit'
import {
  connect,
  disconnect,
  connectionEstablished,
  messageReceived,
  connectionClosed,
  connectionError,
} from './streamSlice'

const WS_URL = 'wss://your-server.example.com/stream'

const websocketMiddleware: Middleware = (store) => {
  console.log('perry: websocketMiddleware: store: ', store)
  let socket: WebSocket | null = null

  return (next) => (action) => {
    console.log('perry: websocketMiddleware: next action')
    if (connect.match(action)) {
      // Avoid opening duplicate connections
      if (socket) socket.close()

      socket = new WebSocket(WS_URL)

      socket.onopen = () => {
        store.dispatch(connectionEstablished())
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        store.dispatch(messageReceived(data))
      }

      socket.onerror = (e: Event) => {
        const message = e instanceof ErrorEvent ? e.message : 'WebSocket error'
        store.dispatch(connectionError(message || 'WebSocket error'))
      }

      socket.onclose = () => {
        store.dispatch(connectionClosed())
        socket = null
      }

      return // Don't pass connect() to the reducer
    }

    if (disconnect.match(action)) {
      socket?.close()
      socket = null
      return
    }

    // All other actions pass through normally
    console.log('perry: Runs action normally')
    next(action)
  }
}

export default websocketMiddleware
