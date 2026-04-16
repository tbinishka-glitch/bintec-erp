import { SuperAdminPageShell } from '@/components/admin/SuperAdminPageShell'
import { BarChart3 } from 'lucide-react'

export const metadata = { title: 'Subscription Management · Super Admin' }

export default function SuperSubscriptionsPage() {
  return (
    <SuperAdminPageShell
      title="Subscription"
      highlight="& Packages"
      subtitle="Licensing, Feature Entitlements & Billing Cycles · Sovereign Layer"
      icon={BarChart3}
      tag="Subscription Mgmt"
      description="Manage licensing tiers, feature entitlements, and billing cycles across all organizations. Configure plan limits, upgrade thresholds, and custom enterprise agreements."
      roadmapItems={[
        'Multi-tier subscription plan editor (Starter / Pro / Enterprise)',
        'Per-organization feature entitlement management',
        'Usage quotas: user limits, storage caps, API rate limits',
        'Billing cycle configuration and renewal automation',
        'Custom enterprise agreements and SLA attachments',
        'Revenue analytics and MRR/ARR reporting dashboard',
        'Trial period management with auto-conversion rules',
      ]}
    />
  )
}
