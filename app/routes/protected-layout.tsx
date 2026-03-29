import { Outlet, redirect } from 'react-router'
import { CommonHeader } from '../components/CommonHeader'
import { store } from '../store'
import { authApi } from '../features/authApi'

export async function clientLoader() {
  const result = await store.dispatch(authApi.endpoints.getMe.initiate())
  if (result.error) {
    throw redirect('/login')
  }
  return null
}

export default function ProtectedLayout() {
  return (
    <>
      <CommonHeader />
      <div className="mt-16 space-y-3">
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </>
  )
}
