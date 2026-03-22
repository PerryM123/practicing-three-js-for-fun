import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import type { Route } from './+types/dashboard'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

const ExcavatorInfo = () => {
  const telemetry = useSelector((state: RootState) => state.stream.telemetry)
  const status = useSelector((state: RootState) => state.stream.status)

  if (!telemetry) {
    return (
      <div>
        <p>Status: {status}</p>
        <p>Waiting for excavator telemetry...</p>
      </div>
    )
  }

  const BATTERY_PERCENTAGE = {
    LOW: 25,
    GOOD: 50,
  }

  const batteryColor =
    telemetry.battery <= BATTERY_PERCENTAGE.LOW
      ? 'bg-red-400'
      : telemetry.battery <= BATTERY_PERCENTAGE.GOOD
        ? 'bg-yellow-400'
        : 'bg-green-400'

  return (
    <div>
      <p>
        Battery: {telemetry.battery.toFixed(1)}%
        <span
          className={`ml-2 inline-block h-3 w-3 rounded-2xl ${batteryColor}`}
          aria-hidden
        />
      </p>
      <p>Phase: {telemetry.phase}</p>
      {telemetry.alert && (
        <p className="text-amber-600">Alert: {telemetry.alert}</p>
      )}
    </div>
  )
}

export default function Dashoard() {
  const userInfo = {
    name: 'Perry',
    email: 'perry@perry.com',
  }
  return (
    <div>
      <h1 className="text-3xl">Dashboard</h1>
      <p>Welcome {userInfo.name}</p>
      <div className="mt-3 rounded-md border p-4">
        <h2 className="text-xl">Current Excavator Info</h2>
        <ExcavatorInfo />
      </div>
    </div>
  )
}
