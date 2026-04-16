import { createArticle } from '../actions'
import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, BookOpen, ShieldCheck, Target, Layers } from 'lucide-react'

const CATEGORIES = ['Policy', 'Guide', 'Best Practice', 'Resource', 'Handout', 'Other']

export default async function NewArticlePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true, branch: true }
  })

  const roleName = me?.role?.name || ''
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin'].includes(roleName)
  const isBranchAdmin = roleName === 'Branch Admin'

  // Only certain roles can create official knowledge articles
  if (!['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin', 'User'].includes(roleName)) {
    redirect('/knowledge')
  }

  const [branches, employeeCategories] = await Promise.all([
    prisma.branch.findMany({ 
      where: isBranchAdmin ? { id: me?.branchId || '' } : {},
      orderBy: { name: 'asc' } 
    }),
    prisma.employeeCategory.findMany({ orderBy: { name: 'asc' } })
  ])

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24 font-inter">
      <div className="max-w-4xl mx-auto px-6 pt-12 space-y-8">
        
        <header className="space-y-4">
          <Link href="/knowledge" className="flex items-center gap-2 text-sm font-black uppercase text-primary/50 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Archives
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Draft <span className="text-primary">Intelligence</span></h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Official internal documentation & resource creation</p>
            </div>
          </div>
        </header>

        <form action={createArticle} className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-premium space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="text-xs font-black text-gray-400 uppercase tracking-widest">Document Title <span className="text-rose-500">*</span></label>
              <input
                id="title" name="title" type="text" required maxLength={200}
                placeholder="e.g. Employee Wellness Program 2024"
                className="w-full px-5 py-4 border border-gray-100 rounded-2xl bg-slate-50 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="documentType" className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Classification
              </label>
              <select
                id="documentType" name="documentType" required
                className="w-full px-5 py-4 border border-gray-100 rounded-2xl bg-slate-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="branchId" className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-leeds" /> Authority Level
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
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-50 pt-8">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Target Audiences
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {employeeCategories.map((c) => (
                <label key={c.id} className="flex items-center gap-3 p-4 rounded-3xl border border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer group has-[:checked]:bg-primary/5 has-[:checked]:border-primary/20">
                  <input type="checkbox" name="targetCategoryIds" value={c.id} className="w-4 h-4 rounded accent-primary" />
                  <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-primary transition-colors">{c.name}</span>
                </label>
              ))}
            </div>
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.1em]">Documents with specific targets are only visible to the selected personnel categories.</p>
          </div>

          <div className="space-y-2 border-t border-slate-50 pt-8">
            <label htmlFor="content" className="text-xs font-black text-gray-400 uppercase tracking-widest">Article Body Content <span className="text-rose-500">*</span></label>
            <textarea
              id="content" name="content" rows={12} required
              placeholder="Structure your knowledge base article here..."
              className="w-full px-5 py-4 border border-gray-100 rounded-3xl bg-slate-50 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="text-xs font-black text-gray-400 uppercase tracking-widest">Search Metadata (Tags)</label>
            <input
              id="tags" name="tags" type="text"
              placeholder="e.g. HR, POLICY, LEAVE (comma separated)"
              className="w-full px-5 py-4 border border-gray-100 rounded-2xl bg-slate-50 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Link href="/knowledge" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
              Cancel Draft
            </Link>
            <button
              type="submit"
              className="px-10 py-5 bg-primary hover:bg-primary-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-premium shadow-primary/20 transition-all hover:-translate-y-1"
            >
              Submit for Publication
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
