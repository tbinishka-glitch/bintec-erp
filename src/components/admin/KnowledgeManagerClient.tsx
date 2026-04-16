'use client'

import { useState } from 'react'
import { Search, Filter, Clock, CheckCircle2, XCircle, User, MapPin, Target, Eye, Trash2, ShieldCheck, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { updateArticleStatus } from '@/app/intranet/knowledge/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


export function KnowledgeManagerClient({ initialArticles }: { initialArticles: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [articles, setArticles] = useState(initialArticles)
  const router = useRouter()

  const filtered = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleStatusUpdate(id: string, newStatus: 'APPROVED' | 'REJECTED') {
    try {
      await updateArticleStatus(id, newStatus)
      setArticles(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
      router.refresh()
    } catch (error) {
      alert('Failed to update status.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 ml-2 hidden md:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:flex-none px-6 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-black uppercase tracking-widest focus:bg-white focus:border-primary/20 transition-all cursor-pointer"
          >
            <option value="ALL">All States</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Articles Grid/Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-premium overflow-hidden font-inter">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">Article Concept</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">Author & Branch</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">Governance Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">Target Targets</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((article) => (
                <tr key={article.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${article.imageUrl ? 'bg-slate-100 p-1' : 'bg-primary/5 text-primary'}`}>
                        {article.imageUrl ? (
                          <img src={article.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <BookOpen className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors leading-tight">{article.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-300" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            {format(new Date(article.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <User className="w-4 h-4 text-gray-300" />
                       <div>
                         <p className="text-xs font-black text-gray-800">{article.author?.name}</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                           <MapPin className="w-3 h-3"/> {article.author?.branch?.name || 'Global HQ'}
                         </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                      ${article.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 
                        article.status === 'REJECTED' ? 'bg-rose-500 text-white' : 
                        'bg-amber-500 text-white animate-pulse-slow'}
                    `}>
                      {article.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                      {article.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {article.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {article.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1.5">
                      {article.targetCategories.length > 0 ? (
                        article.targetCategories.map((c: any) => (
                           <span key={c.name} className="px-2 py-0.5 bg-indigo-50 text-primary text-[9px] font-black uppercase tracking-tighter rounded-md border border-indigo-100">
                             {c.name}
                           </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 italic uppercase">All Categories</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {article.status === 'PENDING' && (
                         <>
                           <button 
                             onClick={() => handleStatusUpdate(article.id, 'APPROVED')}
                             className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                             title="Approve for Publication"
                           >
                             <CheckCircle2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleStatusUpdate(article.id, 'REJECTED')}
                             className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                             title="Reject Transmission"
                           >
                             <XCircle className="w-4 h-4" />
                           </button>
                         </>
                       )}
                       <Link 
                         href={`/intranet/knowledge/${article.id}`}
                         className="p-2.5 rounded-xl bg-indigo-50 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                         title="Preview Intelligence"
                       >
                         <Eye className="w-4 h-4" />
                       </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <ShieldCheck className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-loose">
                      No matching records found in the governance archive buffer
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
