import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Clock, CheckCircle2, XCircle, Search, Filter, ShieldCheck } from 'lucide-react'
import { KnowledgeManagerClient } from '@/components/admin/KnowledgeManagerClient'

export default async function AdminKnowledgeManagerPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: { role: true }
  })

  const normalized = (me?.role?.name || '').toUpperCase().replace(/\s+/g, '_')
  const allowedRoles = ['SUPER_ADMIN', 'CORPORATE_ADMIN', 'IT_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN']
  if (!allowedRoles.includes(normalized)) redirect('/')

  const isBranchAdmin = normalized === 'BRANCH_ADMIN'
  const filter = isBranchAdmin ? { branchId: me.branchId } : {}

  const articles = await prisma.article.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, branch: { select: { name: true } } } },
      targetCategories: { select: { name: true } }
    }
  })

  // Group stats
  const pendingCount = articles.filter(a => a.status === 'PENDING').length
  const approvedCount = articles.filter(a => a.status === 'APPROVED').length

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24 font-inter">
      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 font-inter">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-sm font-black uppercase text-primary/50 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> System Control
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary shadow-inner">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Knowledge <span className="text-primary">Governance</span></h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Centralized archive management & quality assurance</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-soft flex items-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-black text-amber-500">{pendingCount}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pending Review</p>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-500">{approvedCount}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Approved</p>
              </div>
            </div>
          </div>
        </header>

        {/* Manager Component */}
        <KnowledgeManagerClient initialArticles={articles} />

      </div>
    </div>
  )
}
