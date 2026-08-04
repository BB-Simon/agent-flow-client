import { Handle, Position, type NodeProps } from '@xyflow/react'
import { UserCheck } from 'lucide-react'

import { BaseNode } from '@/features/canvas/nodes/base-node'
import type { AgentFlowNode } from '@/features/canvas/types'

export function HumanReviewNode({ data, selected }: NodeProps<AgentFlowNode>) {
  return (
    <BaseNode
      icon={<UserCheck className="h-3.5 w-3.5" />}
      tint="var(--node-human)"
      typeLabel="Human Review"
      label={data.label}
      status={data.status}
      selected={selected}
      subtitle="Pauses run for approval"
    >
      <Handle type="target" position={Position.Left} className="af-handle" />
      <Handle type="source" position={Position.Right} className="af-handle" />
    </BaseNode>
  )
}
