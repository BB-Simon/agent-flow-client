import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BUILT_IN_TOOLS, type AgentFlowNodeData } from '@/features/canvas/types'
import type { CustomTool } from '@/features/canvas/api/tools-api'

interface ToolNodePanelProps {
  data: AgentFlowNodeData
  customTools: CustomTool[]
  onChange: (patch: Partial<AgentFlowNodeData>) => void
}

export function ToolNodePanel({ data, customTools, onChange }: ToolNodePanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tool source</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className={cn(data.kind === 'built-in' && 'border-accent text-accent')}
            onClick={() => onChange({ kind: 'built-in' })}
          >
            Built-in
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(data.kind === 'custom' && 'border-accent text-accent')}
            onClick={() => onChange({ kind: 'custom' })}
          >
            Custom
          </Button>
        </div>
      </div>

      {data.kind === 'built-in' ? (
        <div className="space-y-1.5">
          <Label htmlFor="tool-builtin">Built-in tool</Label>
          <NativeSelect
            id="tool-builtin"
            value={data.builtInTool ?? ''}
            onChange={(e) => onChange({ builtInTool: e.target.value as AgentFlowNodeData['builtInTool'] })}
          >
            <option value="" disabled>
              Select a tool…
            </option>
            {BUILT_IN_TOOLS.map((tool) => (
              <option key={tool} value={tool}>
                {tool}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}

      {data.kind === 'custom' ? (
        <div className="space-y-1.5">
          <Label htmlFor="tool-custom">Custom tool</Label>
          {customTools.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No custom tools defined for this team yet.
            </p>
          ) : (
            <NativeSelect
              id="tool-custom"
              value={data.customToolId ?? ''}
              onChange={(e) => onChange({ customToolId: e.target.value })}
            >
              <option value="" disabled>
                Select a custom tool…
              </option>
              {customTools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name}
                </option>
              ))}
            </NativeSelect>
          )}
        </div>
      ) : null}

      {!data.kind ? (
        <p className="text-xs text-muted-foreground">
          Choose built-in or custom, then attach this node to an Agent to make it callable.
        </p>
      ) : null}
    </div>
  )
}
