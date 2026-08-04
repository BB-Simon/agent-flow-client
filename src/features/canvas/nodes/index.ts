import type { NodeTypes } from '@xyflow/react'
import {
  Bot,
  GitBranch,
  Layers,
  LogIn,
  LogOut,
  UserCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import { InputNode } from '@/features/canvas/nodes/input-node'
import { AgentNode } from '@/features/canvas/nodes/agent-node'
import { ToolNode } from '@/features/canvas/nodes/tool-node'
import { RouterNode } from '@/features/canvas/nodes/router-node'
import { AggregatorNode } from '@/features/canvas/nodes/aggregator-node'
import { HumanReviewNode } from '@/features/canvas/nodes/human-review-node'
import { OutputNode } from '@/features/canvas/nodes/output-node'
import type { AgentFlowNodeType } from '@/features/canvas/types'

export const nodeTypes: NodeTypes = {
  InputNode,
  AgentNode,
  ToolNode,
  RouterNode,
  AggregatorNode,
  HumanReviewNode,
  OutputNode,
}

export const NODE_TYPE_META: Record<
  AgentFlowNodeType,
  { label: string; icon: LucideIcon; tint: string }
> = {
  InputNode: { label: 'Input', icon: LogIn, tint: 'var(--node-input)' },
  AgentNode: { label: 'Agent', icon: Bot, tint: 'var(--node-agent)' },
  ToolNode: { label: 'Tool', icon: Wrench, tint: 'var(--node-tool)' },
  RouterNode: { label: 'Router', icon: GitBranch, tint: 'var(--node-router)' },
  AggregatorNode: { label: 'Aggregator', icon: Layers, tint: 'var(--node-aggregator)' },
  HumanReviewNode: { label: 'Human Review', icon: UserCheck, tint: 'var(--node-human)' },
  OutputNode: { label: 'Output', icon: LogOut, tint: 'var(--node-output)' },
}
