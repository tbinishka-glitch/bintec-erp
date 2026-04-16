import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { FileText, Clock } from 'lucide-react'
import { ContentApprovalsClient } from '@/components/admin/ContentApprovalsClient'

export default async function ContentApprovalsPage() {
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  
  if (roleName !== 'Corporate Admin' && roleName !== 'Super Admin') redirect('/')

  const pendingArticles = await prisma.article.findMany({
    where: { status: 'PENDING' },
    include: { author: { select: { name: true, image: true, id: true } } },
    orderBy: { createdAt: 'asc' }
  })

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-10">
      
      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-premium border border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <FileText className="w-6 h-6" />
             </div>
             <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">
               Content <span className="text-gold-leeds">Approvals</span>
             </h2>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-12">
            Governance Review: Authorize staff submissions for publication
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Queue Status</span>
            <span className="text-xl font-black text-primary">{pendingArticles.length} Pending</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
             <Clock className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* ── CONTENT AREA ── */}
      <ContentApprovalsClient pendingArticles={pendingArticles} />
    </div>
  )
}
