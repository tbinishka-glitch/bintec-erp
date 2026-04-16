import { SuperAdminPageShell } from '@/components/admin/SuperAdminPageShell'
import { HardDrive } from 'lucide-react'

export const metadata = { title: 'Backup & Restore · Super Admin' }

export default function SuperBackupsPage() {
  return (
    <SuperAdminPageShell
      title="Backup"
      highlight="& Restore"
      subtitle="Scheduled Snapshots, Disaster Recovery & Data Integrity · Sovereign Layer"
      icon={HardDrive}
      tag="Backup & Restore"
      description="Complete data protection management: schedule automated backups, trigger on-demand snapshots, restore from checkpoints with point-in-time recovery, and manage cross-region replication."
      roadmapItems={[
        'Automated backup scheduling: hourly, daily, weekly',
        'On-demand snapshot triggers with metadata tagging',
        'Point-in-time recovery to any historical checkpoint',
        'Cross-region backup replication for DR compliance',
        'Backup integrity verification and checksum validation',
        'Selective restore: individual records, tables, or full DB',
        'Retention policy management and auto-purge rules',
        'Backup download and export to external storage',
      ]}
    />
  )
}
