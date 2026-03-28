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
  | 'disconnected'
  | 'error'

export type ExcavatorStreamState = {
  telemetry: Telemetry | null
  connectionStatus: ConnectionStatus
  error: string | null
}

const WS_URL = import.meta.env.VITE_TELEMETRY_WEB_SOCKET_URL as string
const THROTTLE_MS = 200

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
        const ws = new WebSocket(WS_URL)
        let released = false
        ws.onopen = () => {
          console.log('perry: onopen')
          updateCachedData((draft) => {
            draft.connectionStatus = 'connected'
            draft.error = null
          })
        }
        ws.onmessage = (event) => {
          console.log('perry: onmessage')
          try {
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
                const delay = Math.max(0, THROTTLE_MS - (now - lastDispatchAt))
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
          console.log('perry: onclose')
          if (throttleTimer) clearTimeout(throttleTimer)
          if (released) return
          updateCachedData((draft) => {
            draft.connectionStatus = 'disconnected'
          })
        }
        await cacheEntryRemoved
        released = true
        if (throttleTimer) clearTimeout(throttleTimer)
        ws.close()
      },
    }),
  }),
})

export const { useExcavatorTelemetryQuery } = excavatorApi
