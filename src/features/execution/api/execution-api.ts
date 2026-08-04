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
