import type { Plan } from '@/features/billing/api/billing-api'

export const PLAN_ORDER: Plan[] = ['FREE', 'PRO', 'TEAM']

export interface PlanInfo {
  plan: Plan
  name: string
  features: string[]
}

export const PLANS: PlanInfo[] = [
  {
    plan: 'FREE',
    name: 'Free',
    features: ['1 workflow', '20 runs / month', 'No team invites'],
  },
  {
    plan: 'PRO',
    name: 'Pro',
    features: ['Unlimited workflows', '500 runs / month', 'Team invites'],
  },
  {
    plan: 'TEAM',
    name: 'Team',
    features: [
      'Unlimited workflows',
      'Unlimited runs (usage-based overages)',
      'Priority support',
      'SSO option',
    ],
  },
]
