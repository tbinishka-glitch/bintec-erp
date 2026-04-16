import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { TrashClient } from '@/components/admin/TrashClient'

export const dynamic = 'force-dynamic'

export default async function SystemTrashPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true }
  })

  if (me?.role?.name !== 'Super Admin') {
    redirect('/admin')
  }

  const trashedEntities = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
    select: {
      id: true,
      entityId: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      deletedAt: true,
      role: { select: { name: true } },
      branch: { select: { name: true } }
    }
  })

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-white rounded-[2.5rem] shadow-premium border border-gray-50 flex flex-col m-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-x-0 -top-40 h-96 bg-gradient-to-b from-rose-50/80 via-white to-transparent pointer-events-none" />

      {/* Hero Header */}
      <div className="px-10 py-12 relative z-10 flex flex-col sm:flex-row items-center gap-8 justify-between border-b border-gray-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-rose-200/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Trash2 className="w-7 h-7 text-rose-600 relative z-10 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              System Trash Bin
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] uppercase font-black tracking-widest border border-rose-200 shadow-sm">
                RESTRICTED
              </span>
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Permanent Data Destruction & Recovery Center</p>
          </div>
        </div>

        <Link
          href="/admin"
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 z-10 overflow-hidden flex flex-col">
        <TrashClient entities={trashedEntities} />
      </div>
    </div>
  )
}
