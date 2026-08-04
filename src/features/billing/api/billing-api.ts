import { apiClient } from '@/lib/api/client'

export type Plan = 'FREE' | 'PRO' | 'TEAM'

export interface CurrentUsage {
  plan: Plan
  periodStart: string
  periodEnd: string
  tokensUsed: number
  runsUsed: number
  runsLimit: number | null
  workflowsUsed: number
  workflowsLimit: number | null
}

export async function getCurrentUsage() {
  const { data } = await apiClient.get<CurrentUsage>('/usage/current')
  return data
}

export async function createCheckoutSession(plan: 'PRO' | 'TEAM') {
  const { data } = await apiClient.post<{ url: string }>('/billing/checkout', { plan })
  return data
}

export async function createPortalSession() {
  const { data } = await apiClient.post<{ url: string }>('/billing/portal')
  return data
}
