import { useSelector } from 'react-redux'
import type { RootState } from '../store'

export default function Info() {
  const telemetry = useSelector((state: RootState) => state.stream.telemetry)
  const status = useSelector((state: RootState) => state.stream.status)

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
