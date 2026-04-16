import { SuperAdminPageShell } from '@/components/admin/SuperAdminPageShell'
import { Users } from 'lucide-react'

export const metadata = { title: 'Full User Controls · Super Admin' }

export default function SuperUsersPage() {
  return (
    <SuperAdminPageShell
      title="Full User"
      highlight="Controls"
      subtitle="Deep Personnel Administration & Mass Operations · Sovereign Layer"
      icon={Users}
      tag="Full User Controls"
      description="Advanced personnel control: mass import/export, entity merging, forced password resets, cross-org user movements, bulk role assignments, and comprehensive user lifecycle management."
      roadmapItems={[
        'Mass bulk user import via CSV/Excel with validation',
        'Cross-organization user transfer and merging',
        'Force password reset and session invalidation tools',
        'Bulk role assignment and demotion controls',
        'User lifecycle timeline and audit history viewer',
        'Inactive/dormant account detection and automated actions',
        'Suspicious activity alerts and account locking',
      ]}
    />
  )
}
