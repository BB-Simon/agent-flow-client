import type { NodeRuntimeState } from '@/features/execution/types'

interface RunEventLike {
  nodeId: string
  eventType: string
  payload: Record<string, unknown>
}

/**
 * Pure reducer from one RunEvent onto the per-node runtime map. Shared by the
 * live execution hook (folds events one at a time as they stream in) and the
 * replay viewer (folds the full persisted log up to a scrub position).
 */
export function applyRunEvent(
  prev: Record<string, NodeRuntimeState>,
  event: RunEventLike,
): Record<string, NodeRuntimeState> {
  const { nodeId, eventType, payload } = event
  const current: NodeRuntimeState = prev[nodeId] ?? {
    status: 'idle',
    tokens: '',
    toolCalls: [],
  }

  switch (eventType) {
    case 'node.started':
      return { ...prev, [nodeId]: { status: 'running', tokens: '', toolCalls: [] } }
    case 'node.token':
      return {
        ...prev,
        [nodeId]: { ...current, tokens: current.tokens + ((payload.token as string) ?? '') },
      }
    case 'node.tool_call':
      return {
        ...prev,
        [nodeId]: {
          ...current,
          toolCalls: [
            ...current.toolCalls,
            {
              toolName: payload.toolName as string,
              arguments: payload.arguments,
              result: payload.result as string | undefined,
              error: payload.error as string | undefined,
            },
          ],
        },
      }
    case 'node.completed':
      return {
        ...prev,
        [nodeId]: { ...current, status: 'done', output: payload.output as string | undefined },
      }
    case 'node.error':
      return {
        ...prev,
        [nodeId]: { ...current, status: 'error', errorMessage: payload.message as string | undefined },
      }
    default:
      return prev
  }
}
