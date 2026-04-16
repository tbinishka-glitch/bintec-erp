import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Crown, Building2, ChevronRight, Globe, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Company Management · Super Admin' }

export default async function SuperCompaniesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: { select: { name: true } } },
  })
  if (me?.role?.name !== 'Super Admin') redirect('/admin')

  const orgs = await prisma.organization.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { users: true, branches: true } }
    }
  }).catch(() => [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="relative border-b border-red-900/20 bg-gradient-to-r from-red-950/60 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(239,68,68,0.12),transparent_60%)]" />
        <div className="relative max-w-[1400px] mx-auto px-8 py-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-900 flex items-center justify-center shadow-xl shadow-red-900/40">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors">
                  Elite Command
                </Link>
                <ChevronRight size={12} className="text-slate-700" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Company Management</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">Company <span className="text-red-400">Management</span></h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Multi-Tenant Organization Registry · Sovereign Layer</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
            <Crown size={11} /> Super Admin Only
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Organizations', val: orgs.length, icon: Globe },
            { label: 'Total Users', val: orgs.reduce((acc: number, o: any) => acc + o._count.users, 0), icon: Users },
            { label: 'Total Branches', val: orgs.reduce((acc: number, o: any) => acc + o._count.branches, 0), icon: TrendingUp },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-900/30 flex items-center justify-center text-red-400">
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{s.val}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Organizations Table */}
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden">
          <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">Organization Registry</h2>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{orgs.length} entities</span>
          </div>
          <div className="divide-y divide-white/5">
            {orgs.length === 0 ? (
              <div className="px-8 py-12 text-center text-slate-600 font-bold uppercase tracking-widest text-[11px]">No organizations found</div>
            ) : orgs.map((org: any) => (
              <div key={org.id} className="px-8 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-900/40 to-slate-900 border border-red-900/20 flex items-center justify-center text-red-400 font-black text-sm">
                    {org.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{org.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {org.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-lg font-black text-white">{org._count.users}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-white">{org._count.branches}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Branches</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
