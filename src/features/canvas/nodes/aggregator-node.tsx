import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Layers } from 'lucide-react'

import { BaseNode } from '@/features/canvas/nodes/base-node'
import type { AgentFlowNode } from '@/features/canvas/types'

export function AggregatorNode({ data, selected }: NodeProps<AgentFlowNode>) {
  return (
    <BaseNode
      icon={<Layers className="h-3.5 w-3.5" />}
      tint="var(--node-aggregator)"
      typeLabel="Aggregator"
      label={data.label}
      status={data.status}
      selected={selected}
      subtitle="Waits for all inputs"
    >
      <Handle type="target" position={Position.Left} className="af-handle" />
      <Handle type="source" position={Position.Right} className="af-handle" />
    </BaseNode>
  )
}
