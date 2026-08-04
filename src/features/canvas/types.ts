import type { Edge, Node } from '@xyflow/react'

export type NodeStatus = 'idle' | 'running' | 'waiting_human' | 'done' | 'error'

export const NODE_TYPES = [
  'InputNode',
  'AgentNode',
  'ToolNode',
  'RouterNode',
  'AggregatorNode',
  'HumanReviewNode',
  'OutputNode',
] as const

export type AgentFlowNodeType = (typeof NODE_TYPES)[number]

export const BUILT_IN_TOOLS = [
  'web_search',
  'calculator',
  'http_request',
  'date_time',
] as const

export type BuiltInTool = (typeof BUILT_IN_TOOLS)[number]

export interface RouterBranch {
  when: string
  targetNodeId: string
}

/** Single flexible data bag — each node type reads only the fields it needs. */
export interface AgentFlowNodeData extends Record<string, unknown> {
  label: string
  status?: NodeStatus
  // AgentNode
  systemPrompt?: string
  model?: string
  temperature?: number
  // ToolNode
  kind?: 'built-in' | 'custom'
  builtInTool?: BuiltInTool
  customToolId?: string
  // RouterNode
  branches?: RouterBranch[]
  defaultTargetNodeId?: string
}

export type AgentFlowNode = Node<AgentFlowNodeData, AgentFlowNodeType>
export type AgentFlowEdge = Edge

export interface WorkflowGraph {
  nodes: AgentFlowNode[]
  edges: AgentFlowEdge[]
  config?: {
    maxIterations?: number
  }
}
