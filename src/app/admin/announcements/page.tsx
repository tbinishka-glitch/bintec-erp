import { redirect } from 'next/navigation'

export default function AnnouncementsRedirectPage() {
  // Gracefully redirect the legacy /admin/announcements path
  // to the newly unified Intranet Master Hub
  redirect('/admin/intranet')
}
