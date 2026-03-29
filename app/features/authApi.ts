import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type UserPublic = {
  id: number
  name: string
  email: string
}

export type LoginRequest = {
  id_token: string
}

export type LoginResponse = {
  token: string
  token_type: 'Bearer'
}

export type LogoutResponse = {
  message: string
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/api/v1/login',
        method: 'POST',
        body,
      }),
    }),
    logout: build.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/api/v1/logout',
        method: 'POST',
      }),
    }),
    getMe: build.query<UserPublic, void>({
      query: () => '/api/v1/me',
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi
