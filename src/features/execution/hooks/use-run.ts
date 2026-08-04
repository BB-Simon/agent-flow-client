import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getRun, resumeRun, startRun } from '@/features/execution/api/execution-api'

const TERMINAL_STATUSES = new Set(['completed', 'failed'])

export function useStartRun(workflowId: string) {
  return useMutation({
    mutationFn: (input?: string) => startRun(workflowId, input),
  })
}

/** Polls run status as a reliable fallback for terminal state — the gateway
 * streams per-node events but never emits a distinct "run finished" signal. */
export function useRunQuery(runId: string | null) {
  return useQuery({
    queryKey: ['runs', runId],
    queryFn: () => getRun(runId!),
    enabled: !!runId,
    refetchInterval: (query) =>
      query.state.data && TERMINAL_STATUSES.has(query.state.data.status) ? false : 1500,
  })
}

export function useResumeRun(runId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { decision: 'approve' | 'edit' | 'reject'; editedContent?: string }) =>
      resumeRun(runId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs', runId] })
    },
  })
}
