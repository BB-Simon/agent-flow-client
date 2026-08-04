import { apiClient } from '@/lib/api/client'

export interface CustomTool {
  id: string
  name: string
  description: string
}

export async function listCustomTools() {
  const { data } = await apiClient.get<CustomTool[]>('/tools')
  return data
}
