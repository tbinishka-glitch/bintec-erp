import { prisma } from '@/lib/prisma'
import { createAnnouncement } from '../actions'
import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ArrowLeft, Megaphone, ShieldCheck, Target } from 'lucide-react'

export default async function NewAnnouncementPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true, branch: true }
  })

  const roleName = me?.role?.name || ''
  const isBranchAdmin = roleName === 'Branch Admin'
  const isSuperAdmin = roleName === 'Super Admin'
  const isHR = roleName === 'Corporate Admin'
  const isNetworkAdmin = roleName === 'Network Admin'

  // Only certain roles can post announcements
  if (!['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(roleName)) {
    redirect('/announcements')
  }

  const branches = await prisma.branch.findMany({ 
    where: isBranchAdmin ? { id: me?.branchId || '' } : {},
    orderBy: { name: 'asc' } 
  })
  
  const categories = await prisma.employeeCategory.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      <div className="max-w-3xl mx-auto px-6 pt-12 space-y-8">
        
        <header className="space-y-4">
          <Link href="/announcements" className="flex items-center gap-2 text-sm font-black uppercase text-primary/50 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Intelligence
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">New <span className="text-primary">Transmission</span></h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">System-wide broadcast & targeted memo</p>
            </div>
          </div>
        </header>

        <form action={createAnnouncement} className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-premium space-y-8">
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-black text-gray-500 uppercase tracking-widest">Memo Title <span className="text-rose-500">*</span></label>
              <input
                id="title" name="title" type="text" required maxLength={200}
                placeholder="e.g. Q2 Strategic Realignment"
                className="w-full px-5 py-4 border border-gray-100 rounded-2xl bg-slate-50 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-xs font-black text-gray-500 uppercase tracking-widest">Transmission Body <span className="text-rose-500">*</span></label>
              <textarea
                id="content" name="content" rows={8} required
                placeholder="Declare the official system announcement..."
                className="w-full px-5 py-4 border border-gray-100 rounded-2xl bg-slate-50 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium leading-relaxed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
            <div className="space-y-2">
              <label htmlFor="branchId" className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Authority Level
              </label>
              <select
                id="branchId" name="branchId"
                disabled={isBranchAdmin}
                defaultValue={isBranchAdmin ? (me?.branchId || '') : ''}
                className="w-full px-5 py-4 border border-gray-100 rounded-2xl bg-slate-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold disabled:opacity-50"
              >
                {!isBranchAdmin && <option value="">Global (Network-wide)</option>}
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {isBranchAdmin && <input type="hidden" name="branchId" value={me?.branchId || ''} />}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-gold-leeds" /> Target Audiences
              </label>
              <div className="grid grid-cols-1 gap-2">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <input type="checkbox" name="categoryIds" value={c.id} className="w-4 h-4 rounded accent-primary" />
                    <span className="text-[11px] font-black uppercase text-gray-400 group-hover:text-primary transition-colors">{c.name}</span>
                  </label>
                ))}
                {categories.length === 0 && <p className="text-[10px] text-gray-300 italic">No categories defined</p>}
              </div>
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">If none selected, all staff in the level will receive.</p>
            </div>
          </div>

          <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-xs font-black text-rose-900 uppercase">Critical Priority</p>
                <p className="text-[10px] text-rose-800/60 font-medium">Pin this memo to the top of all personnel feeds</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="isPinned" className="sr-only peer" />
              <div className="w-11 h-6 bg-rose-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 pt-10">
            <Link href="/announcements" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
              Abort Transmission
            </Link>
            <button
              type="submit"
              className="px-10 py-5 bg-primary hover:bg-primary-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-premium shadow-primary/20 transition-all hover:-translate-y-1"
            >
              Confirm Broadcast
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
