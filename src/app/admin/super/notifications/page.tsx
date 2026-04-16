import { SuperAdminPageShell } from '@/components/admin/SuperAdminPageShell'
import { BellRing } from 'lucide-react'

export const metadata = { title: 'Notification Rules · Super Admin' }

export default function SuperNotificationsPage() {
  return (
    <SuperAdminPageShell
      title="Notification"
      highlight="Rules Engine"
      subtitle="Rule-Based Multi-Channel Notification Delivery · Sovereign Layer"
      icon={BellRing}
      tag="Notification Rules"
      description="Craft intelligent, rule-based notification engines with multi-channel delivery: in-app, email, SMS, and push. Set triggers, audiences, frequency caps, and blackout windows globally."
      roadmapItems={[
        'Rule builder: event triggers, conditions, recipient targeting',
        'Multi-channel delivery: in-app, email, SMS, push notifications',
        'Audience segmentation by role, branch, department',
        'Frequency caps and notification fatigue prevention',
        'Blackout windows and quiet hours configuration',
        'Notification template editor with variable interpolation',
        'Delivery analytics: open rates, click-through, failures',
        'Global notification preference overrides',
      ]}
    />
  )
}
