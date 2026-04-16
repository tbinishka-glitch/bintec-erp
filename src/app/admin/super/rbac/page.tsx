import { SuperAdminPageShell } from '@/components/admin/SuperAdminPageShell'
import { ShieldAlert } from 'lucide-react'

export const metadata = { title: 'RBAC Engine · Super Admin' }

export default function SuperRbacPage() {
  return (
    <SuperAdminPageShell
      title="RBAC"
      highlight="Engine"
      subtitle="Full 6-Factor Permission Matrix Editor · Sovereign Layer"
      icon={ShieldAlert}
      tag="RBAC Engine"
      description="The full 6-factor Role-Based Access Control engine. Design and enforce permission matrices across all roles, modules, branches, and data entities with granular read/write/delete controls."
      roadmapItems={[
        '6-factor permission matrix visual editor',
        'Role inheritance and override chain builder',
        'Module-level permission toggles per role',
        'Branch-scoped permission customization',
        'Permission conflict detection and resolution',
        'Role simulation tool: preview access as any role',
        'Bulk permission cloning between roles',
        'Permission changelog and rollback history',
      ]}
    />
  )
}
