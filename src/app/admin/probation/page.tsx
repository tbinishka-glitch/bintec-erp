import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ProbationManagerClient from '@/components/admin/ProbationManagerClient'

export default async function ProbationPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: { 
      role: true, 
      department: { select: { id: true, name: true } } 
    }
  })

  const normalized = (me?.role?.name || '').toUpperCase().replace(/\s+/g, '_')
  const allowedRoles = ['SUPER_ADMIN', 'CORPORATE_ADMIN', 'IT_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN']
  
  // Eligibility Check: Only HR Administrators or Super Admin
  const isHRAdmin = normalized === 'CORPORATE_ADMIN' || 
    (['NETWORK_ADMIN', 'BRANCH_ADMIN', 'MODERATOR'].includes(normalized) && me?.department?.name?.includes('HR'))

  if (!isHRAdmin && normalized !== 'SUPER_ADMIN') {
    redirect('/')
  }

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())

  // Fetch all users in PROBATION who crossed the 6 month mark
  const eligibleUsers = await prisma.user.findMany({
    where: {
      employmentStatus: 'PROBATION',
      joinedDate: { lte: sixMonthsAgo }
    },
    include: {
      branch: { select: { name: true } }
    },
    orderBy: {
      joinedDate: 'asc'
    }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      <div className="mb-10 flex items-center gap-3">
        <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-[11px] font-black uppercase tracking-widest text-slate-400">
          Administration / <span className="text-slate-800">Probation Center</span>
        </div>
      </div>
      
      <ProbationManagerClient eligibleUsers={eligibleUsers} />
    </div>
  )
}
