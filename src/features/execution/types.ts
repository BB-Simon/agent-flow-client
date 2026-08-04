export type RunStatus = 'queued' | 'running' | 'waiting_human' | 'completed' | 'failed'

export interface RunEventPayload {
  id: string
  runId: string
  nodeId: string
  eventType: 'node.started' | 'node.token' | 'node.tool_call' | 'node.completed' | 'node.error'
  payload: Record<string, unknown>
  timestamp: string
}

export interface ToolCallEntry {
  toolName: string
  arguments: unknown
  result?: string
  error?: string
}

export interface NodeRuntimeState {
  status: 'idle' | 'running' | 'waiting_human' | 'done' | 'error'
  tokens: string
  toolCalls: ToolCallEntry[]
  output?: string
  errorMessage?: string
}
