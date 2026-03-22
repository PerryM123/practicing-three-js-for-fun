import type { Route } from './+types/dashboard'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

const ExcavatorInfo = () => {
  return (
    <div>
      <p>
        Battery Info: {'DUMMY TEXT HERE! TODO!'}{' '}
        {/* TODO: Need conditional for when the battery is bad. Maybe red */}
        <span className="inline-block h-3 w-3 rounded-2xl bg-green-400"></span>
      </p>
      <p>State: {'DUMMY TEXT HERE TOO! TODO!'}</p>
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
