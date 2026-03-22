import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { connect } from '../features/streamSlice'

/**
 * Dispatches WebSocket connect when mounted.
 * Mounted at app root so telemetry is available to dashboard and info routes.
 */
export function TelemetryConnector() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(connect())
  }, [dispatch])

  return null
}
