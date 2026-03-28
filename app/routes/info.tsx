import { useExcavatorTelemetryQuery } from '../features/excavatorApi'
import type { Route } from './+types/info'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Dashboard' },
    { name: 'description', content: 'Welcome to Dashboard!' },
  ]
}

export default function Info() {
  const { data } = useExcavatorTelemetryQuery()
  const telemetry = data?.telemetry ?? null
  const status = data?.connectionStatus ?? 'disconnected'

  return (
    <>
      <h1 className="text-xl font-semibold">Excavator Telemetry</h1>
      <p>Status: {status}</p>
      {!telemetry ? (
        <p>
          Waiting for telemetry… Open Dashboard or Playground for a live
          connection.
        </p>
      ) : (
        <pre className="overflow-x-auto rounded bg-black/5 p-3 text-sm">
          {JSON.stringify(telemetry, null, 2)}
        </pre>
      )}
    </>
  )
}
