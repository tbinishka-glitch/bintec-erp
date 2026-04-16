'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, X, Eye, Calendar, User, Clock, FileText, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { approvePublishedArticle, rejectPublishedArticle } from '@/app/admin/actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function ContentApprovalsClient({ pendingArticles }: { pendingArticles: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null)

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setLoadingId(id)
    const fd = new FormData()
    fd.append('id', id)
    
    try {
      if (action === 'approve') {
        await approvePublishedArticle(fd)
        toast.success('Article approved and published')
      } else {
        const confirmed = window.confirm('Are you sure you want to reject and delete this article?')
        if (!confirmed) return
        await rejectPublishedArticle(fd)
        toast.success('Article rejected and removed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {pendingArticles.length === 0 ? (
        <div className="py-32 bg-white rounded-[3.5rem] shadow-premium border border-gray-100 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center text-primary/20">
             <Check className="w-16 h-16" />
          </div>
          <div className="space-y-1">
             <h3 className="text-xl font-black uppercase text-gray-900">Queue Satisfied</h3>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No articles awaiting review</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence>
            {pendingArticles.map((article, index) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-[3rem] overflow-hidden shadow-premium hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col lg:flex-row"
              >
                {/* Visual Section */}
                <div className="lg:w-[350px] relative h-64 lg:h-auto bg-gray-100 overflow-hidden shrink-0">
                  <img 
                    src={article.imageUrl || '/images/placeholder-knowledge.jpg'} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                     <span className="px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-white/50 w-fit">
                       {article.documentType}
                     </span>
                     {article.isMultipart && (
                       <span className="px-4 py-2 rounded-xl bg-gold-leeds text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold-leeds/20 w-fit">
                         Part {article.partNumber}
                       </span>
                     )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-between space-y-8">
                   <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gold-leeds uppercase tracking-[0.2em]">
                               <Clock className="w-3.5 h-3.5" /> Submitted {article.createdAt ? format(new Date(article.createdAt), 'MMM dd, yyyy') : 'Recently'}
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">
                              {article.title}
                            </h3>
                         </div>
                         <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                               <UserAvatar imageUrl={article.author?.image} name={article.author?.name} size="xs" />
                               <span className="text-xs font-bold text-gray-700">{article.author?.name}</span>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Visibility</p>
                            <p className="text-xs font-black text-primary uppercase">{article.visibility}</p>
                         </div>
                         <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Primary Category</p>
                            <p className="text-xs font-black text-gray-800">{article.mainCategory || 'Uncategorized'}</p>
                         </div>
                         <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hidden md:block">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Sub-Category</p>
                            <p className="text-xs font-black text-gray-800">{article.subCategory || article.academicCategory || 'N/A'}</p>
                         </div>
                      </div>

                      <div className="relative group/content">
                        <div className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] max-h-32 overflow-hidden relative">
                           <p className="text-sm font-medium text-gray-600 leading-relaxed line-clamp-3">
                             {article.content}
                           </p>
                           <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-50 to-transparent" />
                        </div>
                        <button 
                          onClick={() => setSelectedArticle(article)}
                          className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-primary/10 hover:bg-white transition-all shadow-sm"
                        >
                           Full Review <Eye className="w-3 h-3" />
                        </button>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-50">
                      <button 
                        onClick={() => handleAction(article.id, 'reject')}
                        disabled={loadingId === article.id}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all border border-transparent hover:border-red-100"
                      >
                        {loadingId === article.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /> Reject Publication</>}
                      </button>
                      <button 
                         onClick={() => handleAction(article.id, 'approve')}
                         disabled={loadingId === article.id}
                         className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                      >
                        {loadingId === article.id ? 'Approving...' : <><Check className="w-5 h-5" /> Approve & Publish</>}
                      </button>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal for full review */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 overflow-y-auto scrollbar-none space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <span className="px-4 py-2 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                      Manuscript Review
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 leading-tight">{selectedArticle.title}</h2>
                  </div>
                  <button onClick={() => setSelectedArticle(null)} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center gap-6 py-6 border-y border-gray-50">
                  <div className="flex items-center gap-3">
                    <UserAvatar imageUrl={selectedArticle.author?.image} name={selectedArticle.author?.name} size="md" />
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted By</p>
                      <p className="text-sm font-bold text-gray-900">{selectedArticle.author?.name}</p>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-gray-100" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Visibility</p>
                    <p className="text-sm font-bold text-primary">{selectedArticle.visibility}</p>
                  </div>
                </div>

                {selectedArticle.imageUrl && (
                  <div className="aspect-video rounded-[2.5rem] overflow-hidden border border-gray-100">
                    <img src={selectedArticle.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-gray-600 font-medium leading-[1.8]">
                  {(selectedArticle.content || '').split('\n').map((para: string, i: number) => (
                    <p key={i} className="mb-4">{para}</p>
                  ))}
                </div>

                {selectedArticle.pdfUrl && (
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                           <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                           <p className="text-xs font-black text-gray-900 uppercase">Attached Manuscript (PDF)</p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase">Official Document Attachment</p>
                        </div>
                     </div>
                     <a href={selectedArticle.pdfUrl} target="_blank" className="px-6 py-3 bg-white hover:bg-gray-100 text-[10px] font-black uppercase text-primary rounded-xl border border-primary/10 transition-all">
                        View Document
                     </a>
                  </div>
                )}
              </div>

              <div className="p-8 bg-gray-50 flex justify-end gap-4 border-t border-gray-100">
                 <button 
                  onClick={() => {
                    handleAction(selectedArticle.id, 'reject')
                    setSelectedArticle(null)
                  }}
                  className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-colors"
                 >
                   Reject Request
                 </button>
                 <button 
                   onClick={() => {
                     handleAction(selectedArticle.id, 'approve')
                     setSelectedArticle(null)
                   }}
                   className="px-12 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
                 >
                   Confirm Approval
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
