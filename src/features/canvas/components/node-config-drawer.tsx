import { Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AgentNodePanel } from '@/features/canvas/config-panels/agent-node-panel'
import { ToolNodePanel } from '@/features/canvas/config-panels/tool-node-panel'
import { RouterNodePanel } from '@/features/canvas/config-panels/router-node-panel'
import { NODE_TYPE_META } from '@/features/canvas/nodes'
import type { AgentFlowNode, AgentFlowNodeData } from '@/features/canvas/types'
import type { CustomTool } from '@/features/canvas/api/tools-api'

interface NodeConfigDrawerProps {
  node: AgentFlowNode
  allNodes: AgentFlowNode[]
  customTools: CustomTool[]
  onChange: (nodeId: string, patch: Partial<AgentFlowNodeData>) => void
  onDelete: (nodeId: string) => void
  onClose: () => void
}

export function NodeConfigDrawer({
  node,
  allNodes,
  customTools,
  onChange,
  onDelete,
  onClose,
}: NodeConfigDrawerProps) {
  const meta = NODE_TYPE_META[node.type as keyof typeof NODE_TYPE_META]
  const Icon = meta.icon
  const patch = (p: Partial<AgentFlowNodeData>) => onChange(node.id, p)

  const targetOptions = allNodes
    .filter((n) => n.id !== node.id)
    .map((n) => ({ id: n.id, label: `${n.data.label} (${NODE_TYPE_META[n.type as keyof typeof NODE_TYPE_META].label})` }))

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `color-mix(in srgb, ${meta.tint} 18%, transparent)`, color: meta.tint }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="flex-1 text-sm font-medium text-foreground">{meta.label}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="node-label">Label</Label>
          <Input
            id="node-label"
            value={node.data.label}
            onChange={(e) => patch({ label: e.target.value })}
          />
        </div>

        {node.type === 'AgentNode' ? (
          <AgentNodePanel data={node.data} onChange={patch} />
        ) : null}

        {node.type === 'ToolNode' ? (
          <ToolNodePanel data={node.data} customTools={customTools} onChange={patch} />
        ) : null}

        {node.type === 'RouterNode' ? (
          <RouterNodePanel data={node.data} targetOptions={targetOptions} onChange={patch} />
        ) : null}

        {node.type === 'InputNode' ||
        node.type === 'OutputNode' ||
        node.type === 'AggregatorNode' ||
        node.type === 'HumanReviewNode' ? (
          <p className="text-xs text-muted-foreground">
            This node has no additional configuration.
          </p>
        ) : null}
      </div>

      <div className="border-t border-border px-4 py-3">
        <Button
          type="button"
          variant="outline"
          className="w-full text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete node
        </Button>
      </div>
    </aside>
  )
}
