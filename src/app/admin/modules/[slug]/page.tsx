import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { can } from '@/lib/rbac'
import { ModuleHubClient } from '@/components/admin/ModuleHubClient'

export default async function ModuleAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Verify module exists and is active
  const module = await prisma.module.findUnique({
    where: { slug },
    include: { organization: true }
  })

  if (!module || !module.isActive) {
    return notFound()
  }

  // Security: Check if user has view permission for this SPECIFIC module
  const hasAccess = await can(slug as any, 'view')
  if (!hasAccess) {
    redirect('/admin')
  }

  // AGGREGATE MODULE-SPECIFIC TELEMETRY
  let telemetry: any = {}

  if (slug === 'hr') {
    const [staffCount, probationCount, catCount] = await Promise.all([
      prisma.user.count({ where: { isEmployee: true } }),
      prisma.user.count({ where: { employmentStatus: 'PROBATION' } }),
      prisma.employeeCategory.count()
    ])
    telemetry = { staffCount, probationCount, catCount }
  } 
  else if (slug === 'intranet') {
    const [articleCount, pendingApprovals, commentCount, sopCount, announceCount, celebrationCount, citizenCount] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PENDING' } }),
      prisma.comment.count(),
      prisma.article.count({ where: { documentType: { in: ['SOP', 'Policy', 'Circular'] } } }),
      prisma.announcement.count(),
      prisma.celebration.count(),
      prisma.user.count({ where: { isInIntranet: true } })
    ])
    telemetry = { articleCount, pendingApprovals, commentCount, sopCount, announceCount, celebrationCount, citizenCount }
  }
  else if (slug === 'finance') {
    const [supplierCount, transactionCount] = await Promise.all([
      prisma.supplierProfile.count(),
      prisma.financialTransaction.count()
    ])
    telemetry = { supplierCount, transactionCount }
  }
  else if (slug === 'school') {
    const [studentCount, parentCount, gradeCount] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.parentProfile.count(),
      prisma.grade.count()
    ])
    telemetry = { studentCount, parentCount, gradeCount }
  }

  const roleName = session.user.roleName || 'User'

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-inter">
      <ModuleHubClient 
        module={module}
        telemetry={telemetry}
        roleName={roleName}
      />
    </div>
  )
}
