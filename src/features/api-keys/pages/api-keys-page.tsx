import { useState } from 'react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { Check, Copy, KeyRound, Loader2, X } from 'lucide-react'

import { AppHeader } from '@/components/app-header'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useApiKeysQuery, useCreateApiKey, useRevokeApiKey } from '@/features/api-keys/hooks/use-api-keys'
import type { CreatedApiKey } from '@/features/api-keys/api/api-keys-api'

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
  }
  return fallback
}

export function ApiKeysPage() {
  const currentUser = useAuthStore((s) => s.user)
  const canManage = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN'

  const { data: keys, isLoading } = useApiKeysQuery()
  const createKey = useCreateApiKey()
  const revokeKey = useRevokeApiKey()

  const [name, setName] = useState('')
  const [revealedKey, setRevealedKey] = useState<CreatedApiKey | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  function handleCreate() {
    if (!name.trim()) return
    createKey.mutate(name.trim(), {
      onSuccess: (created) => {
        setRevealedKey(created)
        setName('')
      },
      onError: (error) => {
        toast.error('Could not create API key', {
          description: errorMessage(error, 'Please try again.'),
        })
      },
    })
  }

  function handleCopy(key: string) {
    navigator.clipboard.writeText(key)
    toast.success('Copied to clipboard')
  }

  function handleRevoke(id: string) {
    revokeKey.mutate(id, {
      onSuccess: () => {
        toast.success('API key revoked')
        setConfirmingId(null)
      },
      onError: (error) => {
        toast.error('Could not revoke key', {
          description: errorMessage(error, 'Please try again.'),
        })
        setConfirmingId(null)
      },
    })
  }

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold tracking-tight text-foreground">API keys</h1>

        {revealedKey ? (
          <Alert variant="success" className="mb-6">
            <Check />
            <AlertTitle>Copy your new API key now — it won't be shown again</AlertTitle>
            <AlertDescription>
              <div className="mt-2 flex w-full items-center gap-2">
                <code className="flex-1 truncate rounded-md border border-border bg-panel px-3 py-1.5 font-mono text-xs text-foreground">
                  {revealedKey.key}
                </code>
                <Button size="sm" variant="outline" onClick={() => handleCopy(revealedKey.key)}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setRevealedKey(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {canManage ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generate a new key</CardTitle>
              <CardDescription>Used to trigger workflow runs via the public API.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. CI pipeline"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                  }}
                />
                <Button onClick={handleCreate} disabled={!name.trim() || createKey.isPending}>
                  {createKey.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="h-3.5 w-3.5" />
                  )}
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Keys</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !keys || keys.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                No API keys yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {keys.map((key) => {
                  const revoked = !!key.revokedAt
                  return (
                    <li key={key.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">{key.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {key.keyPrefix}… ·{' '}
                          {key.lastUsedAt
                            ? `last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                            : 'never used'}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          revoked ? 'bg-muted text-muted-foreground' : 'bg-success/15 text-success',
                        )}
                      >
                        {revoked ? 'Revoked' : 'Active'}
                      </span>

                      {canManage && !revoked ? (
                        confirmingId === key.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              disabled={revokeKey.isPending}
                              onClick={() => handleRevoke(key.id)}
                            >
                              Confirm
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setConfirmingId(null)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setConfirmingId(key.id)}
                          >
                            Revoke
                          </Button>
                        )
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
