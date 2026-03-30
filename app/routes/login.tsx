import { redirect, useNavigate } from 'react-router'
import { store } from '../store'
import { authApi, useLoginMutation } from '../features/authApi'
import { GoogleLogin } from '@react-oauth/google'

export async function clientLoader() {
  const result = await store.dispatch(authApi.endpoints.getMe.initiate())
  if (!result.error) {
    throw redirect('/')
  }
  return null
}

export default function Login() {
  const navigate = useNavigate()
  const [login, { isLoading, error }] = useLoginMutation()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-md border p-8">
        <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
        {error && (
          <p className="mb-4 text-sm text-red-500">Sign-in failed. Please try again.</p>
        )}
        {isLoading ? (
          <p className="text-black/60">Signing in...</p>
        ) : (
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (!credentialResponse.credential) return
              login({ id_token: credentialResponse.credential })
                .unwrap()
                .then(() => navigate('/'))
            }}
            onError={() => {}}
          />
        )}
      </div>
    </div>
  )
}
