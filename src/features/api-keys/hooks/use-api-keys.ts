import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApiKey, listApiKeys, revokeApiKey } from '@/features/api-keys/api/api-keys-api'

const API_KEYS_KEY = ['api-keys']

export function useApiKeysQuery() {
  return useQuery({ queryKey: API_KEYS_KEY, queryFn: listApiKeys })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createApiKey(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: API_KEYS_KEY }),
  })
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: API_KEYS_KEY }),
  })
}
