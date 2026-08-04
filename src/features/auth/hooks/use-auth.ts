import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { useAuthStore } from '@/store/auth-store'
import {
  fetchCurrentUser,
  login,
  logout,
  signup,
  type LoginPayload,
  type SignupPayload,
} from '@/features/auth/api/auth-api'

const CURRENT_USER_KEY = ['auth', 'me']

/** Hydrates the auth store from the session cookie on app load. */
export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)

  const query = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    } else if (query.isError) {
      clearUser()
    }
  }, [query.data, query.isError, setUser, clearUser])

  return query
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(CURRENT_USER_KEY, user)
    },
  })
}

export function useSignup() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SignupPayload) => signup(payload),
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(CURRENT_USER_KEY, user)
    },
  })
}

export function useLogout() {
  const clearUser = useAuthStore((s) => s.clearUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearUser()
      queryClient.setQueryData(CURRENT_USER_KEY, null)
    },
  })
}

export function authErrorMessage(error: unknown, fallback = 'Something went wrong.') {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join(' ')
    if (typeof message === 'string') return message
  }
  return fallback
}
