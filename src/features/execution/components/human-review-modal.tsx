import { useState } from 'react'
import { UserCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface HumanReviewModalProps {
  nodeLabel: string
  input: string
  isResuming: boolean
  onResume: (decision: 'approve' | 'edit' | 'reject', editedContent?: string) => void
}

export function HumanReviewModal({ nodeLabel, input, isResuming, onResume }: HumanReviewModalProps) {
  const [editing, setEditing] = useState(false)
  const [editedText, setEditedText] = useState(input)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-warning/40 bg-card shadow-lg">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-warning/15 text-warning">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Human review needed</p>
            <p className="text-xs text-muted-foreground">{nodeLabel}</p>
          </div>
        </div>

        <div className="space-y-3 px-5 py-4">
          {editing ? (
            <div className="space-y-1.5">
              <Label htmlFor="review-edit">Edit content before continuing</Label>
              <Textarea
                id="review-edit"
                rows={6}
                className="font-mono text-xs"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Pending output</Label>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-panel p-3 font-mono text-xs text-foreground">
                {input || '(empty)'}
              </pre>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border px-5 py-3.5">
          {editing ? (
            <>
              <Button variant="outline" className="flex-1" onClick={() => setEditing(false)} disabled={isResuming}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={isResuming || !editedText.trim()}
                onClick={() => onResume('edit', editedText)}
              >
                Submit edit
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:bg-destructive/10"
                disabled={isResuming}
                onClick={() => onResume('reject')}
              >
                Reject
              </Button>
              <Button variant="outline" className="flex-1" disabled={isResuming} onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button className="flex-1" disabled={isResuming} onClick={() => onResume('approve')}>
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
