import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { BookUser, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EntityRegistryClient } from '@/components/admin/EntityRegistryClient'

export const dynamic = 'force-dynamic'

export default async function EntityRegistryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: { role: true }
  })

  const normalized = (me?.role?.name || '').toUpperCase().replace(/\s+/g, '_')
  const allowedRoles = ['SUPER_ADMIN', 'CORPORATE_ADMIN', 'IT_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN']
  if (!allowedRoles.includes(normalized)) redirect('/')

  const roleName = me?.role?.name || 'User'
  const isBranchAdmin = roleName === 'Branch Admin'
  const myBranchId = me?.branchId

  const [entities, branches, roles, categories, subCategories, departments] = await Promise.all([
    prisma.user.findMany({
      where: Object.assign({ deletedAt: null }, isBranchAdmin ? { branchId: myBranchId ?? undefined } : {}),
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      include: {
        role: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
        employeeCategory: { select: { id: true, name: true } },
        employeeSubCategory: { select: { id: true, name: true, categoryId: true } },
        department: { select: { id: true, name: true } },
        studentProfile: { select: { userId: true, studentId: true } },
        parentProfile: { select: { userId: true } },
        supplierProfile: { select: { userId: true, companyName: true } },
      },
    }),
    prisma.branch.findMany({
      where: isBranchAdmin ? { id: myBranchId ?? undefined } : {},
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    }),
    prisma.role.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.employeeCategory.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.employeeSubCategory.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, categoryId: true } }),
    prisma.department.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return (
    <div className="p-6 md:p-10 max-w-[1800px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── PAGE HEADER ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
            <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Core System Control
            </Link>
            <span>›</span>
            <span className="text-primary">Entity Registry</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <BookUser className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Entity Registry</h1>
              <p className="text-slate-500 font-medium mt-1 text-sm">
                Central Institutional Identity Governance and Universal Entity Management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 shadow-sm">
            <span className="text-primary font-black text-lg mr-1">{entities.length}</span> Universal Entities
          </div>
          <Link
            href="/admin"
            className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* ── REGISTRY CLIENT ── */}
      <EntityRegistryClient
        entities={entities as any}
        roles={roles}
        branches={branches}
        categories={categories}
        subCategories={subCategories}
        departments={departments}
        myRole={roleName}
      />
    </div>
  )
}
