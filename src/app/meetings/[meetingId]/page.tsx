import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { JitsiWrapper } from './JitsiWrapper'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function MeetingRoomPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { meetingId } = await params
  const meeting = await prisma.virtualMeeting.findUnique({
    where: { id: meetingId },
    include: { host: true }
  })
  
  if (!meeting) redirect('/meetings')

  const myBranch = (session.user as any)?.branchId
  const roleName = (session.user as any)?.roleName
  const isAdmin = roleName === 'Super Admin' || roleName === 'Corporate Admin'

  if (!isAdmin && meeting.branchId !== null && meeting.branchId !== myBranch) {
    redirect('/meetings')
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="bg-zinc-900 text-white p-4 flex items-center justify-between shrink-0 shadow-lg z-50">
        <div className="flex items-center gap-4">
          <Link href="/meetings" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold">{meeting.title}</h1>
            <p className="text-xs text-zinc-400">Hosted by {meeting.host.name} • End-to-End Encrypted</p>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full bg-black">
        <JitsiWrapper 
          roomName={`LeedsConnect-${meeting.id}`} 
          displayName={session.user.name || 'Staff Member'} 
          email={session.user.email || ''} 
        />
      </main>
    </div>
  )
}
