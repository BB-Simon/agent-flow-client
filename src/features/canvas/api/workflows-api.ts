import { apiClient } from '@/lib/api/client'
import type { WorkflowGraph } from '@/features/canvas/types'

export interface WorkflowSummary {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Workflow extends WorkflowSummary {
  graphJson: WorkflowGraph
  teamId: string
}

export interface WorkflowVersionSummary {
  id: string
  createdAt: string
}

export async function listWorkflows() {
  const { data } = await apiClient.get<WorkflowSummary[]>('/workflows')
  return data
}

export async function getWorkflow(id: string) {
  const { data } = await apiClient.get<Workflow>(`/workflows/${id}`)
  return data
}

export async function createWorkflow(payload: { name: string; graphJson: WorkflowGraph }) {
  const { data } = await apiClient.post<Workflow>('/workflows', payload)
  return data
}

export async function updateWorkflow(
  id: string,
  payload: { name?: string; graphJson?: WorkflowGraph },
) {
  const { data } = await apiClient.patch<Workflow>(`/workflows/${id}`, payload)
  return data
}

export async function deleteWorkflow(id: string) {
  await apiClient.delete(`/workflows/${id}`)
}

export async function listWorkflowVersions(id: string) {
  const { data } = await apiClient.get<WorkflowVersionSummary[]>(
    `/workflows/${id}/versions`,
  )
  return data
}

export async function restoreWorkflowVersion(id: string, versionId: string) {
  const { data } = await apiClient.post<Workflow>(
    `/workflows/${id}/versions/${versionId}/restore`,
  )
  return data
}
