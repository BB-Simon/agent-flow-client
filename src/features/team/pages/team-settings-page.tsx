import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { Loader2, UserPlus, X } from 'lucide-react'

import { AppHeader } from '@/components/app-header'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  useChangeMemberRole,
  useInviteMember,
  useRemoveMember,
  useTeamMembersQuery,
} from '@/features/team/hooks/use-team'
import type { Role } from '@/features/team/api/team-api'

const inviteSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  role: z.enum(['MEMBER', 'ADMIN']),
})

type InviteValues = z.infer<typeof inviteSchema>

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
  }
  return fallback
}

const ROLE_STYLES: Record<Role, string> = {
  OWNER: 'bg-accent/15 text-accent',
  ADMIN: 'bg-primary/15 text-primary',
  MEMBER: 'bg-muted text-muted-foreground',
}

export function TeamSettingsPage() {
  const currentUser = useAuthStore((s) => s.user)
  const isOwner = currentUser?.role === 'OWNER'
  const canInvite = isOwner || currentUser?.role === 'ADMIN'

  const { data: members, isLoading } = useTeamMembersQuery()
  const inviteMember = useInviteMember()
  const changeRole = useChangeMemberRole()
  const removeMember = useRemoveMember()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'MEMBER' },
  })

  const onInvite = form.handleSubmit((values) => {
    inviteMember.mutate(values, {
      onSuccess: () => {
        toast.success(`Invite sent to ${values.email}`)
        form.reset()
      },
      onError: (error) => {
        toast.error('Could not send invite', {
          description: errorMessage(error, 'Please try again.'),
        })
      },
    })
  })

  function handleRoleChange(userId: string, role: Role) {
    changeRole.mutate(
      { userId, role },
      {
        onError: (error) => {
          toast.error('Could not change role', {
            description: errorMessage(error, 'Please try again.'),
          })
        },
      },
    )
  }

  function handleRemove(userId: string) {
    removeMember.mutate(userId, {
      onSuccess: () => {
        toast.success('Member removed')
        setConfirmingId(null)
      },
      onError: (error) => {
        toast.error('Could not remove member', {
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
        <h1 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
          Team settings
        </h1>

        {canInvite ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invite a member</CardTitle>
              <CardDescription>They'll receive an email invite valid for 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onInvite} className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Input placeholder="teammate@company.com" {...form.register('email')} />
                  {form.formState.errors.email ? (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  ) : null}
                </div>
                <NativeSelect className="w-32" {...form.register('role')}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </NativeSelect>
                <Button type="submit" disabled={inviteMember.isPending}>
                  {inviteMember.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                  Invite
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {members?.map((member) => {
                  const isSelf = member.id === currentUser?.sub
                  return (
                    <li key={member.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          {member.email}
                          {isSelf ? <span className="ml-1.5 text-xs text-muted-foreground">(you)</span> : null}
                        </p>
                        {!member.emailVerified ? (
                          <p className="text-xs text-warning">Email not verified</p>
                        ) : null}
                      </div>

                      {isOwner ? (
                        <NativeSelect
                          className="w-28"
                          value={member.role}
                          disabled={changeRole.isPending}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                        >
                          <option value="OWNER">Owner</option>
                          <option value="ADMIN">Admin</option>
                          <option value="MEMBER">Member</option>
                        </NativeSelect>
                      ) : (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            ROLE_STYLES[member.role],
                          )}
                        >
                          {member.role}
                        </span>
                      )}

                      {isOwner && !isSelf ? (
                        confirmingId === member.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              disabled={removeMember.isPending}
                              onClick={() => handleRemove(member.id)}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setConfirmingId(null)}
                              disabled={removeMember.isPending}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setConfirmingId(member.id)}
                          >
                            Remove
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
