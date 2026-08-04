import { Handle, Position, type NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'

import { BaseNode } from '@/features/canvas/nodes/base-node'
import type { AgentFlowNode } from '@/features/canvas/types'

export function RouterNode({ data, selected }: NodeProps<AgentFlowNode>) {
  const branchCount = data.branches?.length ?? 0

  return (
    <BaseNode
      icon={<GitBranch className="h-3.5 w-3.5" />}
      tint="var(--node-router)"
      typeLabel="Router"
      label={data.label}
      status={data.status}
      selected={selected}
      subtitle={`${branchCount} branch${branchCount === 1 ? '' : 'es'}`}
    >
      <Handle type="target" position={Position.Left} className="af-handle" />
      <Handle type="source" position={Position.Right} className="af-handle" />
    </BaseNode>
  )
}
