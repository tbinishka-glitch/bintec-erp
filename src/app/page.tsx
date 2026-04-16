import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { 
  Users, Building, Megaphone, Briefcase
} from 'lucide-react'
import { IntelligenceCenterClient } from '@/components/dashboard/IntelligenceCenterClient'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // ── DATA ACQUISITION LAYER ──
  // Fetching a combination of core models and new BI extension models
  const [
    userCount, branchCount, deptCount, announcementCount,
    me,
    rawFinance,
    rawAttendance,
    categories,
    branches
  ] = await Promise.all([
    prisma.user.count().catch(() => 0),
    prisma.branch.count().catch(() => 0),
    prisma.department.count().catch(() => 0),
    prisma.announcement.count().catch(() => 0),
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    }).catch(() => null),
    // BI Extensions (Extreme safety gating for runtime sync)
    ((prisma as any).financialTransaction ? (prisma as any).financialTransaction.findMany({
      orderBy: { date: 'asc' },
      take: 20
    }).catch(() => []) : Promise.resolve([])) as Promise<any[]>,
    ((prisma as any).attendanceRecord ? (prisma as any).attendanceRecord.findMany({
      where: { entityType: 'STAFF' },
      orderBy: { date: 'asc' },
      take: 28 
    }).catch(() => []) : Promise.resolve([])) as Promise<any[]>,
    prisma.employeeCategory.findMany({
      include: { _count: { select: { users: true } } }
    }).catch(() => []),
    prisma.branch.findMany({
      include: { _count: { select: { users: true } } }
    }).catch(() => []),
  ])



  // ── INTELLIGENCE PROCESSING ──
  
  // 1. Finance Processing (Month Aggregation)
  const monthMap: Record<string, { income: number; expense: number }> = {}
  if (Array.isArray(rawFinance)) {
    rawFinance.forEach(tx => {
      const month = tx?.date?.toLocaleString?.('en-US', { month: 'short' }) || 'Global'
      if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 }
      if (tx.type === 'INCOME') monthMap[month].income += tx.amount
      else monthMap[month].expense += tx.amount
    })
  }
  const financeReports = Object.entries(monthMap).map(([name, data]) => ({ name, ...data }))

  // 2. Attendance Processing (Success Rate per Branch)
  const branchAttendanceMap: Record<string, { total: number; present: number; count: number }> = {}
  if (Array.isArray(rawAttendance)) {
    rawAttendance.forEach(att => {
      const bId = att.branchId || 'Unknown'
      if (!branchAttendanceMap[bId]) branchAttendanceMap[bId] = { total: 0, present: 0, count: 0 }
      branchAttendanceMap[bId].total += att.totalCount
      branchAttendanceMap[bId].present += att.presentCount
      branchAttendanceMap[bId].count += 1
    })
  }

  
  // Match branch IDs to names for the chart
  const attendanceReports = branches.map(b => {
    const data = branchAttendanceMap[b.id] || { total: 1, present: 0 } 
    return {
      name: b.name.split(' ')[0], // Short name
      rate: Math.round((data.present / (data.total || 1)) * 100)
    }
  })

  // 3. Normalized Analytics
  const categoryReports = categories.map(cat => ({
    name: cat.name,
    value: cat._count.users
  }))

  const branchReports = branches.map(br => ({
    name: br.name,
    value: br._count.users
  }))

  const stats = [
    { label: 'Total Staff', value: userCount, icon: 'Users', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Branches', value: branchCount, icon: 'Building', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Departments', value: deptCount, icon: 'Briefcase', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Broadcasts', value: announcementCount, icon: 'Megaphone', color: 'text-amber-600', bg: 'bg-amber-50' },
  ]


  const data = {
    stats,
    financeReports,
    categoryReports,
    branchReports,
    attendanceReports,
    user: {
      name: me?.name || 'Authorized User',
      role: me?.role?.name || 'User'
    }
  }

  return <IntelligenceCenterClient data={data} />
}
