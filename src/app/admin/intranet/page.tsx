import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { IntranetAdminClient } from '@/components/admin/intranet/IntranetAdminClient'
import { getIntranetDashboardData } from './actions'

export default async function IntranetAdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const hasAccess = await can('intranet', 'view')
  if (!hasAccess) {
    redirect('/admin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true }
  })
  
  const roleName = user?.role?.name ?? ''

  const dashboardData = await getIntranetDashboardData()

  // Fetch all articles pending approval
  const pendingArticles = await prisma.article.findMany({
    where: { status: 'PENDING', organizationId: user?.organizationId || 'leeds' },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch all SOPs/Policies
  const sops = await prisma.article.findMany({
    where: { documentType: { in: ['SOP', 'Policy', 'Circular'] }, organizationId: user?.organizationId || 'leeds' },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch branches for targeted announcements
  const branches = await prisma.branch.findMany({
    where: { organizationId: user?.organizationId || 'leeds' },
    select: { id: true, name: true }
  })

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8F9FC] pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <IntranetAdminClient 
          roleName={roleName} 
          initialDashboardData={dashboardData}
          initialPendingArticles={pendingArticles}
          initialSops={sops}
          branches={branches}
        />
      </div>
    </div>
  )
}
