import { SuperAdminPageShell } from '@/components/admin/SuperAdminPageShell'
import { Settings } from 'lucide-react'

export const metadata = { title: 'System Settings · Super Admin' }

export default function SuperSettingsPage() {
  return (
    <SuperAdminPageShell
      title="System-Wide"
      highlight="Settings"
      subtitle="Global Configuration, Security Policies & Feature Flags · Sovereign Layer"
      icon={Settings}
      tag="System Settings"
      description="Master configuration center for the entire platform. Set global security policies, localization preferences, session management rules, password complexity requirements, and system-wide feature flags."
      roadmapItems={[
        'Global security policy editor: MFA, session timeouts, IP rules',
        'Localization settings: timezone, currency, language packs',
        'Password complexity rules and rotation policies',
        'System maintenance mode with user notification',
        'Feature flag management with A/B testing support',
        'Email delivery configuration and SMTP management',
        'Rate limiting and API throttle controls',
        'Log retention and purge policy settings',
      ]}
    />
  )
}
