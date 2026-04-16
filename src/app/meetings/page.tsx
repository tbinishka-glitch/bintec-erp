import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { createMeeting, deleteMeeting } from './actions'
import { MeetingsClient } from '@/components/meetings/MeetingsClient'

export default async function MeetingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true, branch: true }
  })
  const roleName = me?.role?.name || ''
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin'].includes(roleName)
  const isBranchAdmin = roleName === 'Branch Admin'

  const categories = await prisma.employeeCategory.findMany({ orderBy: { name: 'asc' } })

  const meetings = await prisma.virtualMeeting.findMany({
    where: {
      AND: [
        // Role/Branch scoping
        isAdmin ? {} : (isBranchAdmin ? { branchId: me?.branchId } : { OR: [{ branchId: me?.branchId }, { branchId: null }] }),
        
        // Category targeting: Show if none targeted OR user is in targeted category
        !isAdmin ? {
          OR: [
            { targetCategories: { none: {} } },
            { targetCategories: { some: { id: me?.employeeCategoryId || '' } } }
          ]
        } : {}
      ]
    },
    include: { host: true, targetCategories: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-white">
      <MeetingsClient 
        meetings={meetings}
        user={session.user}
        isAdmin={isAdmin || isBranchAdmin}
        categories={categories}
        createMeetingAction={createMeeting}
        deleteMeetingAction={deleteMeeting}
      />
    </div>
  )
}
