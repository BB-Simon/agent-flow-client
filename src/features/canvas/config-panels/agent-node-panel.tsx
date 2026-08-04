import { useState } from 'react'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import type { AgentFlowNodeData } from '@/features/canvas/types'

const MODEL_OPTIONS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']

interface AgentNodePanelProps {
  data: AgentFlowNodeData
  onChange: (patch: Partial<AgentFlowNodeData>) => void
}

export function AgentNodePanel({ data, onChange }: AgentNodePanelProps) {
  const modelIsKnown = !data.model || MODEL_OPTIONS.includes(data.model)
  const [forceCustom, setForceCustom] = useState(false)
  const showCustomInput = forceCustom || !modelIsKnown

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="agent-system-prompt">System prompt</Label>
        <Textarea
          id="agent-system-prompt"
          rows={6}
          className="font-mono text-xs"
          placeholder="You are a helpful assistant that…"
          value={data.systemPrompt ?? ''}
          onChange={(e) => onChange({ systemPrompt: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="agent-model">Model</Label>
        <NativeSelect
          id="agent-model"
          value={showCustomInput ? '__custom__' : (data.model ?? '')}
          onChange={(e) => {
            if (e.target.value === '__custom__') {
              setForceCustom(true)
            } else {
              setForceCustom(false)
              onChange({ model: e.target.value })
            }
          }}
        >
          <option value="" disabled>
            Select a model…
          </option>
          {MODEL_OPTIONS.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
          <option value="__custom__">Custom…</option>
        </NativeSelect>
        {showCustomInput ? (
          <Input
            className="mt-1.5 font-mono text-xs"
            placeholder="model id"
            value={data.model ?? ''}
            onChange={(e) => onChange({ model: e.target.value })}
          />
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="agent-temperature">Temperature</Label>
        <Input
          id="agent-temperature"
          type="number"
          min={0}
          max={2}
          step={0.1}
          value={data.temperature ?? 0.7}
          onChange={(e) => onChange({ temperature: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}
