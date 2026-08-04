import { useMutation, useQuery } from '@tanstack/react-query'

import {
  createCheckoutSession,
  createPortalSession,
  getCurrentUsage,
} from '@/features/billing/api/billing-api'

export function useCurrentUsageQuery() {
  return useQuery({ queryKey: ['usage', 'current'], queryFn: getCurrentUsage })
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (plan: 'PRO' | 'TEAM') => createCheckoutSession(plan),
  })
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: createPortalSession,
  })
}
