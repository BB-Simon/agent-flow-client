import { apiClient } from '@/lib/api/client'

export interface ApiKeySummary {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  lastUsedAt: string | null
  revokedAt: string | null
  createdAt: string
}

export interface CreatedApiKey extends Omit<ApiKeySummary, 'keyPrefix' | 'lastUsedAt' | 'revokedAt'> {
  key: string
}

export async function listApiKeys() {
  const { data } = await apiClient.get<ApiKeySummary[]>('/api-keys')
  return data
}

export async function createApiKey(name: string) {
  const { data } = await apiClient.post<CreatedApiKey>('/api-keys', { name })
  return data
}

export async function revokeApiKey(id: string) {
  await apiClient.delete(`/api-keys/${id}`)
}
