import { SuperAdminPageShell } from '@/components/admin/SuperAdminPageShell'
import { Database } from 'lucide-react'

export const metadata = { title: 'API & Integrations · Super Admin' }

export default function SuperApiPage() {
  return (
    <SuperAdminPageShell
      title="API"
      highlight="& Integrations"
      subtitle="API Keys, Webhooks & Third-Party Credential Management · Sovereign Layer"
      icon={Database}
      tag="API & Integrations"
      description="Centralized API and integration management hub. Generate and rotate API keys, configure webhooks, manage OAuth flows, and monitor all third-party integrations with health dashboards."
      roadmapItems={[
        'API key generator with scope-based permissions',
        'Key rotation scheduler and expiry notifications',
        'Webhook endpoint manager with delivery logs',
        'OAuth 2.0 client credentials management',
        'Third-party integration health monitoring',
        'Request/response inspector and debugger',
        'Rate limit configuration per API consumer',
        'Integration marketplace for pre-built connectors',
      ]}
    />
  )
}
