import { NODE_TYPE_META } from '@/features/canvas/nodes'
import { NODE_TYPES, type AgentFlowNodeType } from '@/features/canvas/types'

interface NodePaletteProps {
  onAdd: (type: AgentFlowNodeType) => void
}

export function NodePalette({ onAdd }: NodePaletteProps) {
  return (
    <aside className="flex w-52 shrink-0 flex-col gap-1 border-r border-border bg-card px-3 py-4">
      <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Add node
      </p>
      {NODE_TYPES.map((type) => {
        const meta = NODE_TYPE_META[type]
        const Icon = meta.icon
        return (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
          >
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: `color-mix(in srgb, ${meta.tint} 18%, transparent)`, color: meta.tint }}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            {meta.label}
          </button>
        )
      })}
    </aside>
  )
}
