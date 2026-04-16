import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, LayoutGrid, Briefcase, Plus, Trash2, Info, Users, Map, Target } from 'lucide-react'
import { createEmployeeCategory, deleteEmployeeCategory, createEmployeeSubCategory, deleteEmployeeSubCategory } from '../actions'
import { DeleteCategoryButton, DeleteSubCategoryButton } from '../DeleteButtons'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  
  const me = await prisma.user.findUnique({ 
    where: { email: session.user.email as string }, 
    include: { role: true } 
  })
  
  const normalized = (me?.role?.name || '').toUpperCase().replace(/\s+/g, '_')
  const allowedRoles = ['SUPER_ADMIN', 'CORPORATE_ADMIN', 'IT_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN']
  if (!allowedRoles.includes(normalized)) redirect('/')

  const categories = await prisma.employeeCategory.findMany({
    orderBy: { name: 'asc' },
    include: {
      subCategories: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { users: true } } }
      },
      _count: { select: { users: true } },
    },
  })

  // Flatten sub-categories for the secondary grid
  const allSubCategories = categories.flatMap(c => 
    c.subCategories.map(sub => ({ ...sub, parentName: c.name }))
  )

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-200/60">
        <div className="flex items-center gap-5">
          <Link 
            href="/admin" 
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter">Governance Engine</div>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">V2.4 Active</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Organizational <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Map</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white shadow-sm">
          <div className="px-6 py-2 bg-slate-900 rounded-xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Primary Hubs</p>
            <p className="text-xl font-black text-white leading-none">{categories.length}</p>
          </div>
          <div className="px-6 py-2 text-center border-l border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-0.5">Active Roles</p>
            <p className="text-xl font-black text-primary leading-none">{allSubCategories.length}</p>
          </div>
        </div>
      </header>

      {/* Architect Center - Compact Forms */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hub Creation */}
        <div className="group relative bg-[#1a1c2e] text-white rounded-[2rem] p-6 shadow-2xl overflow-hidden transition-all border border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] -mr-16 -mt-16 rounded-full" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-primary/20 transition-colors">
                <Map className="w-5 h-5 font-black text-primary" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight leading-none mb-1">Architect Hub</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">Initialize Strategic Segment</p>
              </div>
            </div>
            <form action={createEmployeeCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-1">
              <div className="sm:col-span-2">
                <input 
                  name="name" 
                  required 
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold placeholder:text-white/20 focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                  placeholder="Enterprise Hub Name..." 
                />
              </div>
              <button 
                type="submit"
                className="w-full px-4 py-3.5 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-xl shadow-lg transition-all whitespace-nowrap active:scale-95"
              >
                Create Hub
              </button>
            </form>
          </div>
        </div>

        {/* Position Blueprint */}
        <div className="group relative bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xl overflow-hidden transition-all">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight leading-none mb-1">Blueprint Role</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Deploy Professional Position</p>
              </div>
            </div>
            <form action={createEmployeeSubCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-2 px-1">
              <div className="sm:col-span-1">
                <select 
                  name="categoryId" 
                  required 
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer"
                >
                  <option value="">Hub...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <input 
                  name="name" 
                  required 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                  placeholder="Professional Title..." 
                />
              </div>
              <button 
                type="submit"
                className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-lg transition-all whitespace-nowrap active:scale-95"
              >
                Deploy
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Framework Grid */}
      <div className="grid grid-cols-1 gap-8">
        {categories.map((c) => (
          <div 
            key={c.id} 
            className="group block bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all"
          >
            {/* Hub Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-primary to-indigo-700 text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20 transition-transform group-hover:scale-105">
                  {c.name[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-1">{c.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{c._count.users} Members</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                      <Briefcase className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] text-primary font-bold uppercase tracking-widest">{c.subCategories.length} Active Positions</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                <DeleteCategoryButton id={c.id} name={c.name} deleteAction={deleteEmployeeCategory} />
              </div>
            </div>

            {/* Sub-Category Infrastructure Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {c.subCategories.length > 0 ? (
                c.subCategories.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="group/role relative p-5 bg-slate-50/50 border border-slate-200/40 rounded-[2rem] hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover/role:opacity-100 transition-opacity z-10">
                      <DeleteSubCategoryButton id={sub.id} name={sub.name} deleteAction={deleteEmployeeSubCategory} />
                    </div>
                    
                    <div className="relative space-y-4">
                      <h2 className="text-[13px] font-black text-slate-900 leading-tight pr-4">
                        {sub.name}
                      </h2>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/40">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub._count.users} Staff</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic opacity-60">No positions deployed in this architecture.</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center gap-4 opacity-30">
            <LayoutGrid className="w-20 h-20 text-slate-300" />
            <p className="text-lg font-black text-slate-400 uppercase tracking-[0.2em]">Framework Empty</p>
          </div>
        )}
      </div>

      {/* Corporate Governance Footer */}
      <footer className="pt-20 border-t border-slate-100 opacity-40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 rounded bg-slate-200" />
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Leeds Connect Governance Engine</p>
          </div>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest underline decoration-primary/20 cursor-help">Data Sovereignty</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest underline decoration-primary/20 cursor-help">Access Audit Logs</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
