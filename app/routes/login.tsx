import { redirect } from 'react-router'
import { store } from '../store'
import { authApi } from '../features/authApi'

export async function clientLoader() {
  const result = await store.dispatch(authApi.endpoints.getMe.initiate())
  if (!result.error) {
    throw redirect('/')
  }
  return null
}

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-md border p-8">
        <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
        <p className="text-black/60">Google Sign-In coming soon.</p>
      </div>
    </div>
  )
}
