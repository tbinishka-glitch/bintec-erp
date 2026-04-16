import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminClient } from '@/components/admin/AdminClient'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { 
      id: true,
      branchId: true,
      organizationId: true,
      organization: { select: { id: true, name: true } },
      role: { select: { id: true, name: true } }, 
      department: {
        select: { id: true, name: true }
      } 
    },
  })
  const normalized = (me?.role?.name || '').toUpperCase().replace(/\s+/g, '_')
  const allowedRoles = ['SUPER_ADMIN', 'CORPORATE_ADMIN', 'IT_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN']
  if (!allowedRoles.includes(normalized)) redirect('/')

  const roleName = me?.role?.name ?? 'IT Admin'
  const isHRAdmin = normalized === 'CORPORATE_ADMIN' || 
    (['NETWORK_ADMIN', 'BRANCH_ADMIN', 'MODERATOR'].includes(normalized) && me?.department?.name?.includes('HR'))
  const isSuperAdmin = normalized === 'SUPER_ADMIN'
  const isNetworkAdmin = normalized === 'NETWORK_ADMIN'
  const isBranchAdmin = normalized === 'BRANCH_ADMIN'
  const myBranchId = me?.branchId

  const branchFilterObj = isBranchAdmin ? { branchId: myBranchId || null } : {}

  // ── PURE GOVERNANCE DATA ACQUISITION ──
  const [
    userCount, branchCount, deptCount,
    pendingProfileApprovals,
    articlesRaw,
    auditLogsResult,
    categoryCount,
    chatGroupCount,
    meetingCount,
    eligibleProbationUsers
  ] = await Promise.all([
    prisma.user.count({ where: Object.assign({ deletedAt: null }, branchFilterObj) }).catch(() => 0),
    prisma.branch.count({ where: isBranchAdmin ? { id: myBranchId || '' } : {} }).catch(() => 0),
    prisma.department.count().catch(() => 0),
    prisma.profileUpdateRequest.count({ 
      where: { 
        status: 'PENDING',
        ...(isBranchAdmin ? { user: { branchId: myBranchId || null } } : {})
      } 
    }).catch(() => 0),
    prisma.article.findMany({ 
      where: isBranchAdmin ? { visibility: 'ALL' } : {},
      select: { status: true } 
    }).catch(() => []),
    prisma.auditLog.findMany({
      where: isBranchAdmin ? { user: { branchId: myBranchId || null } } : {},
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { 
          select: { name: true } 
        } 
      }
    }).catch(() => []),
    prisma.employeeCategory.count().catch(() => 0),
    prisma.chatGroup.count({ 
      where: isBranchAdmin ? { branchId: myBranchId || null } : {} 
    }).catch(() => 0),
    prisma.virtualMeeting.count({ 
      where: isBranchAdmin ? { branchId: myBranchId || null } : {} 
    }).catch(() => 0),
    prisma.user.findMany({
      where: { employmentStatus: 'PROBATION' },
      select: { id: true }
    }).catch(() => []),
  ])

  const pendingContentApprovals = (articlesRaw || []).filter((a: any) => a.status === 'PENDING').length
  const pendingProbationCount = (eligibleProbationUsers || []).length
  const alertCount = pendingProfileApprovals + pendingContentApprovals + pendingProbationCount

  // ── CORE SYSTEM MODULES (Layer 1) ──
  const coreModules = [
    { title: 'Identity Registry', desc: 'Secure personnel control and multi-role entity mapping.', href: '/admin/users', icon: 'Users', badge: userCount, advancedHref: isSuperAdmin ? '/admin/super/users' : undefined },
    { title: 'Branch Control', desc: 'Manage branch-level sovereignty and presence.', href: '/admin/branches', icon: 'Building', badge: branchCount, advancedHref: isSuperAdmin ? '/admin/super/branches' : undefined },
    { title: 'Governance Center', desc: 'Manage network-wide professional divisions and departments.', href: '/admin/governance/departments', icon: 'ShieldCheck', badge: deptCount },
    { title: 'Global Master Data', desc: 'Define employee categories and institutional global lists.', href: '/admin/categories', icon: 'Database', badge: categoryCount },
    { title: 'RBAC Switchboard', desc: 'Manage modular 6-factor permission matrices per role.', href: '/admin/roles', icon: 'ShieldAlert', advancedHref: isSuperAdmin ? '/admin/super/rbac' : undefined },
    { title: 'System Aesthetics', desc: 'Customize global visual attributes and seasonal effects.', href: '/admin/theme-engine', icon: 'Palette', advancedHref: isSuperAdmin ? '/admin/super/branding' : undefined },
    { title: 'Audit Telemetry', desc: 'Unified real-time audit stream of all system actions.', href: '/admin/audit-logs', icon: 'FileCheck', advancedHref: isSuperAdmin ? '/admin/super/telemetry' : undefined },
    ...(isSuperAdmin || isNetworkAdmin ? [{ title: 'Communication Audit', desc: 'Full compliance transparency of all system messages.', href: '/admin/chat-logs', icon: 'MessageSquare', advancedHref: isSuperAdmin ? '/admin/super/telemetry' : undefined }] : []),
    ...(isSuperAdmin ? [{ title: 'Probation Center', desc: 'Review and manage employee probation decisions.', href: '/admin/probation', icon: 'Clock' }] : []),
  ];

  // ── FUNCTIONAL ERP MODULES (Layer 2) ──
  // Safety check to prevent runtime crashes during HMR/Schema transitions
  const functionalModules = (prisma as any).module 
    ? await (prisma as any).module.findMany({
        where: { organizationId: me?.organization?.id },
        orderBy: { name: 'asc' }
      })
    : [];

  return (
    <div className="min-h-screen bg-[#F8F9FC] pt-8">
      <AdminClient 
        coreModules={coreModules}
        functionalModules={functionalModules}
        roleName={roleName}
        alertCount={alertCount}
        auditLogs={auditLogsResult}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  )
}
