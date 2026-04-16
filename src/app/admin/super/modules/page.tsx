import { SuperAdminPageShell } from '@/components/admin/SuperAdminPageShell'
import { Zap } from 'lucide-react'

export const metadata = { title: 'Module Activation · Super Admin' }

export default function SuperModulesPage() {
  return (
    <SuperAdminPageShell
      title="Module"
      highlight="Activation"
      subtitle="Global ERP Module Lifecycle Management · Sovereign Layer"
      icon={Zap}
      tag="Module Activation"
      description="Activate, suspend, or configure all functional ERP modules globally. Control which features are accessible per organization, apply feature flags, and manage module rollouts with zero-downtime toggles."
      roadmapItems={[
        'One-click module activate/deactivate per organization',
        'Feature flag management with percentage rollouts',
        'Module dependency graph and conflict checker',
        'Scheduled module activation with maintenance windows',
        'Per-branch module availability overrides',
        'Module usage analytics and adoption metrics',
        'Legacy module sunset management and migration tools',
      ]}
    />
  )
}
