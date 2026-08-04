import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createWorkflow,
  deleteWorkflow,
  getWorkflow,
  listWorkflowVersions,
  listWorkflows,
  restoreWorkflowVersion,
  updateWorkflow,
} from '@/features/canvas/api/workflows-api'
import { listCustomTools } from '@/features/canvas/api/tools-api'
import type { WorkflowGraph } from '@/features/canvas/types'

const workflowsKey = ['workflows'] as const
const workflowKey = (id: string) => ['workflows', id] as const

export function useWorkflowsQuery() {
  return useQuery({ queryKey: workflowsKey, queryFn: listWorkflows })
}

export function useWorkflowQuery(id: string | undefined) {
  return useQuery({
    queryKey: workflowKey(id ?? ''),
    queryFn: () => getWorkflow(id!),
    enabled: !!id,
  })
}

export function useWorkflowVersionsQuery(id: string | undefined) {
  return useQuery({
    queryKey: [...workflowKey(id ?? ''), 'versions'],
    queryFn: () => listWorkflowVersions(id!),
    enabled: !!id,
  })
}

export function useCustomToolsQuery() {
  return useQuery({ queryKey: ['custom-tools'], queryFn: listCustomTools })
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; graphJson: WorkflowGraph }) =>
      createWorkflow(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowsKey })
    },
  })
}

export function useUpdateWorkflow(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name?: string; graphJson?: WorkflowGraph }) =>
      updateWorkflow(id, payload),
    onSuccess: (workflow) => {
      queryClient.setQueryData(workflowKey(id), workflow)
      queryClient.invalidateQueries({ queryKey: workflowsKey })
    },
  })
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowsKey })
    },
  })
}

export function useRestoreWorkflowVersion(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (versionId: string) => restoreWorkflowVersion(id, versionId),
    onSuccess: (workflow) => {
      queryClient.setQueryData(workflowKey(id), workflow)
    },
  })
}
