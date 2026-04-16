import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DepartmentManagerClient } from '@/components/admin/DepartmentManagerClient'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function DepartmentGovernancePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  })

  // Security Hardening: Only high-tier admins can access Governance
  const allowedRoles = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin']
  if (!allowedRoles.includes(user?.role?.name ?? '')) {
    redirect('/admin')
  }

  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { users: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-24 space-y-10">
      
      {/* ── BREADCRUMBS & NAVIGATION ── */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin" 
          className="group flex items-center gap-3 text-slate-400 hover:text-primary transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
            <ArrowLeft size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Back to Command Hub</span>
        </Link>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl shadow-xl">
           <ShieldCheck className="w-4 h-4 text-gold-leeds" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Governance Module</span>
        </div>
      </div>

      <DepartmentManagerClient departments={departments} />
    </div>
  )
}
