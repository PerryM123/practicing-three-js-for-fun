import { useEffect, useState } from 'react'
type Telemetry = {
  id: string
  phase: string
  position: { x: number; z: number }
  bodyRotation: number
  armAngle: number
  bucketDepth: number
  battery: number
  alert: string | null
}
type ConnectionType = 'connecting' | 'connected' | 'disconnected' | 'error'
export default function Info() {
  const wsUrl = (import.meta.env.VITE_TELEMETRY_WEB_SOCKET_URL as string) || ''
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)
  const [status, setStatus] = useState<ConnectionType>('connecting')
  useEffect(() => {
    console.log('perry: useEffect')
    const ws = new WebSocket(wsUrl)
    ws.onopen = () => setStatus('connected')
    ws.onmessage = (event) => {
      try {
        const data: Telemetry = JSON.parse(event.data)
        setTelemetry(data)
      } catch (e) {
        console.error('Failed to parse telemetry:', e)
      }
    }
    ws.onerror = () => setStatus('error')
    ws.onclose = () => setStatus('disconnected')
    return () => ws.close()
  }, [])
  return (
    <>
      <h1 className="text-xl font-semibold">Excavator Telemetry</h1>
      <p>Status: {status}</p>
      {!telemetry ? (
        <p>Waiting for telemetry...</p>
      ) : (
        <pre className="overflow-x-auto rounded bg-black/5 p-3 text-sm">
          {JSON.stringify(telemetry, null, 2)}
        </pre>
      )}
    </>
  )
}
