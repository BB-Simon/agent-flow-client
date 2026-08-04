import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  changeMemberRole,
  inviteMember,
  listMembers,
  removeMember,
  type Role,
} from '@/features/team/api/team-api'

const MEMBERS_KEY = ['team', 'members']

export function useTeamMembersQuery() {
  return useQuery({ queryKey: MEMBERS_KEY, queryFn: listMembers })
}

export function useInviteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { email: string; role?: Role }) => inviteMember(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEMBERS_KEY }),
  })
}

export function useChangeMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      changeMemberRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEMBERS_KEY }),
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => removeMember(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEMBERS_KEY }),
  })
}
