import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

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

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error'

export type ExcavatorStreamState = {
  telemetry: Telemetry | null
  connectionStatus: ConnectionStatus
  error: string | null
}

const WS_URL = import.meta.env.VITE_TELEMETRY_WEB_SOCKET_URL as string
const THROTTLE_MS = 200
const HEARTBEAT_TIMEOUT = 5000
const INITIAL_RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 30000

function isTelemetry(data: unknown): data is Telemetry {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'phase' in data &&
    'battery' in data
  )
}

const initialState: ExcavatorStreamState = {
  telemetry: null,
  connectionStatus: 'connecting',
  error: null,
}

export const excavatorApi = createApi({
  reducerPath: 'excavatorApi',
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 0,
  endpoints: (build) => ({
    excavatorTelemetry: build.query<ExcavatorStreamState, void>({
      queryFn: () => ({ data: initialState }),
      async onCacheEntryAdded(
        _arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
        console.log('perry: onCacheEntryAdded')
        try {
          await cacheDataLoaded
        } catch {
          return
        }
        let lastDispatchAt = 0
        let pendingData: Telemetry | null = null
        let throttleTimer: ReturnType<typeof setTimeout> | null = null
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null
        let heartbeatTimer: ReturnType<typeof setInterval> | null = null
        let lastMessageAt = Date.now()
        let reconnectAttempts = 0
        let released = false
        let connectionMadeAtLeastOnce = false
        let ws: WebSocket | null = null

        const flushPending = () => {
          throttleTimer = null
          const data = pendingData
          if (data) {
            lastDispatchAt = Date.now()
            updateCachedData((draft) => {
              draft.telemetry = data
            })
            pendingData = null
          }
        }

        const getReconnectDelay = (attempt: number): number => {
          const exponentialDelay =
            INITIAL_RECONNECT_DELAY * Math.pow(2, attempt)
          return Math.min(exponentialDelay, MAX_RECONNECT_DELAY)
        }

        const connectWebSocket = () => {
          ws = new WebSocket(WS_URL)
          const handleOffline = () => {
            console.error('Network offline detected, closing connection')
            ws?.close()
          }
          ws.onopen = () => {
            console.log('perry: onopen')
            reconnectAttempts = 0
            connectionMadeAtLeastOnce = true
            lastMessageAt = Date.now()
            updateCachedData((draft) => {
              draft.connectionStatus = 'connected'
              draft.error = null
            })
            window.addEventListener('offline', handleOffline)
            if (heartbeatTimer) clearInterval(heartbeatTimer)
            heartbeatTimer = setInterval(() => {
              if (Date.now() - lastMessageAt > HEARTBEAT_TIMEOUT) {
                console.log('No heartbeat received, closing connection')
                ws?.close()
              }
            }, HEARTBEAT_TIMEOUT)
          }
          ws.onmessage = (event) => {
            try {
              lastMessageAt = Date.now()
              const data = JSON.parse(event.data) as unknown
              if (!isTelemetry(data)) return
              const now = Date.now()
              if (now - lastDispatchAt >= THROTTLE_MS) {
                lastDispatchAt = now
                updateCachedData((draft) => {
                  draft.telemetry = data
                })
                pendingData = null
                if (throttleTimer) {
                  clearTimeout(throttleTimer)
                  throttleTimer = null
                }
              } else {
                pendingData = data
                if (!throttleTimer) {
                  const delay = Math.max(
                    0,
                    THROTTLE_MS - (now - lastDispatchAt)
                  )
                  throttleTimer = setTimeout(flushPending, delay)
                }
              }
            } catch {
              // TODO: I need to double check this
            }
          }
          ws.onerror = (e: Event) => {
            console.log('perry: onerror')
            const message =
              e instanceof ErrorEvent ? e.message : 'WebSocket error'
            updateCachedData((draft) => {
              draft.connectionStatus = 'error'
              draft.error = message || 'WebSocket error'
            })
          }
          ws.onclose = () => {
            window.removeEventListener('offline', handleOffline)
            updateCachedData((draft) => {
              draft.connectionStatus = 'disconnected'
              draft.error = null
            })
            if (throttleTimer) clearTimeout(throttleTimer)
            if (heartbeatTimer) clearInterval(heartbeatTimer)
            if (released) return
            reconnectAttempts++
            // TODO: Might be better to change this to attempt reconnects every 2 seconds
            const delay = getReconnectDelay(reconnectAttempts - 1)
            console.log(
              `perry: reconnect attempt ${reconnectAttempts} in ${delay}ms`
            )

            updateCachedData((draft) => {
              draft.connectionStatus = connectionMadeAtLeastOnce
                ? 'reconnecting'
                : 'connecting'
            })

            reconnectTimer = setTimeout(connectWebSocket, delay)
          }
        }

        connectWebSocket()

        await cacheEntryRemoved
        released = true
        if (throttleTimer) clearTimeout(throttleTimer)
        if (reconnectTimer) clearTimeout(reconnectTimer)
        if (heartbeatTimer) clearInterval(heartbeatTimer)
        // TODO: I need to double check this since the type is becoming the never type
        ws?.close()
      },
    }),
  }),
})

export const { useExcavatorTelemetryQuery } = excavatorApi
