import { Plus, Trash2 } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import type { AgentFlowNodeData, RouterBranch } from '@/features/canvas/types'

interface RouterNodePanelProps {
  data: AgentFlowNodeData
  targetOptions: { id: string; label: string }[]
  onChange: (patch: Partial<AgentFlowNodeData>) => void
}

export function RouterNodePanel({ data, targetOptions, onChange }: RouterNodePanelProps) {
  const branches = data.branches ?? []

  function updateBranch(index: number, patch: Partial<RouterBranch>) {
    const next = branches.map((b, i) => (i === index ? { ...b, ...patch } : b))
    onChange({ branches: next })
  }

  function removeBranch(index: number) {
    onChange({ branches: branches.filter((_, i) => i !== index) })
  }

  function addBranch() {
    onChange({
      branches: [...branches, { when: '', targetNodeId: targetOptions[0]?.id ?? '' }],
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Branches</Label>
        <p className="text-xs text-muted-foreground">
          Routes to the first branch whose "when" text appears in the agent's output.
        </p>

        {branches.map((branch, index) => (
          <div
            key={index}
            className="space-y-2 rounded-md border border-border bg-panel p-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Branch {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeBranch(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <Input
              placeholder="when output contains…"
              value={branch.when}
              onChange={(e) => updateBranch(index, { when: e.target.value })}
            />
            <NativeSelect
              value={branch.targetNodeId}
              onChange={(e) => updateBranch(index, { targetNodeId: e.target.value })}
            >
              <option value="" disabled>
                Target node…
              </option>
              {targetOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" className="w-full" onClick={addBranch}>
          <Plus className="h-3.5 w-3.5" />
          Add branch
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="router-default">Default target (no branch matches)</Label>
        <NativeSelect
          id="router-default"
          value={data.defaultTargetNodeId ?? ''}
          onChange={(e) => onChange({ defaultTargetNodeId: e.target.value })}
        >
          <option value="">None</option>
          {targetOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  )
}
