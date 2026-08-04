import { apiClient } from '@/lib/api/client'
import type { RunStatus } from '@/features/execution/types'

export interface RunEventRecord {
  id: string
  runId: string
  nodeId: string
  eventType: string
  payload: unknown
  timestamp: string
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface Run {
  id: string
  workflowId: string
  status: RunStatus
  input: string | null
  startedAt: string
  finishedAt: string | null
  pendingReviewNodeId: string | null
  pendingReviewInput: string | null
  durationMs: number | null
  tokenUsage: TokenUsage
  events?: RunEventRecord[]
}

export interface RunSummary {
  id: string
  status: RunStatus
  input: string | null
  startedAt: string
  finishedAt: string | null
  durationMs: number | null
  tokenUsage: TokenUsage
}

export interface RunsPage {
  runs: RunSummary[]
  total: number
  limit: number
  offset: number
}

export async function listRuns(workflowId: string, params: { limit?: number; offset?: number } = {}) {
  const { data } = await apiClient.get<RunsPage>(`/workflows/${workflowId}/runs`, { params })
  return data
}

export function runExportUrl(runId: string) {
  return `${apiClient.defaults.baseURL}/runs/${runId}/export`
}

export async function startRun(workflowId: string, input?: string) {
  const { data } = await apiClient.post<Run>(`/workflows/${workflowId}/runs`, { input })
  return data
}

export async function getRun(runId: string) {
  const { data } = await apiClient.get<Run>(`/runs/${runId}`)
  return data
}

export async function resumeRun(
  runId: string,
  payload: { decision: 'approve' | 'edit' | 'reject'; editedContent?: string },
) {
  const { data } = await apiClient.post<{ success: boolean }>(`/runs/${runId}/resume`, payload)
  return data
}
