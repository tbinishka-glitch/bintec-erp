import { SuperAdminPageShell } from '@/components/admin/SuperAdminPageShell'
import { Paintbrush } from 'lucide-react'

export const metadata = { title: 'Branding & White-label · Super Admin' }

export default function SuperBrandingPage() {
  return (
    <SuperAdminPageShell
      title="Branding"
      highlight="& White-label"
      subtitle="Custom Logos, Color Palettes, Domains & Per-Tenant UI Theming · Sovereign Layer"
      icon={Paintbrush}
      tag="Branding"
      description="Full white-label configuration hub. Upload custom logos, define color palettes, map custom domains, and inject per-tenant CSS overrides for a completely branded experience per organization."
      roadmapItems={[
        'Logo upload and management per organization',
        'Primary/secondary/accent color palette editor',
        'Custom domain mapping with SSL auto-provisioning',
        'Per-organization favicon and browser title customization',
        'Font family selection from approved Google Fonts library',
        'Custom CSS injection for advanced theme overrides',
        'Dark/light mode branding variants per tenant',
        'Email template branding: headers, footers, color schemes',
      ]}
    />
  )
}
