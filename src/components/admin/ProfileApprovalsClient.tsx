'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, X, User, ArrowRight, Shield, MapPin, Mail, Phone, ExternalLink, Loader2 } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { approveProfileRequest, rejectProfileRequest } from '@/app/admin/approvals/actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function ProfileApprovalsClient({ pendingRequests }: { pendingRequests: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setLoadingId(id)
    try {
      if (action === 'approve') {
        const res = await approveProfileRequest(id)
        toast.success('Profile changes approved')
      } else {
        await rejectProfileRequest(id)
        toast.success('Request rejected')
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {pendingRequests.length === 0 ? (
        <div className="py-32 bg-white rounded-[3.5rem] shadow-premium border border-gray-100 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center text-primary/20">
             <Check className="w-16 h-16" />
          </div>
          <div className="space-y-1">
             <h3 className="text-xl font-black uppercase text-gray-900">Personnel Clear</h3>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No pending profile updates</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {pendingRequests.map((req, index) => {
              let changes: Record<string, string> = {}
              try { changes = JSON.parse(req.changes) } catch {}

              return (
                <motion.div 
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-premium p-8 md:p-10 flex flex-col xl:flex-row gap-10 items-start overflow-hidden relative"
                >
                  {/* Sidebar Info */}
                  <div className="xl:w-64 shrink-0 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                        <User className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight">{req.user?.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Requested Update</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                          <MapPin className="w-3.5 h-3.5" /> {req.user?.branch?.name || 'Main Office'}
                       </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50">
                       <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">Request Date</p>
                       <p className="text-xs font-bold text-gray-600">{req.createdAt ? format(new Date(req.createdAt), 'MMM dd, yyyy') : 'Recently'}</p>
                    </div>
                  </div>

                  {/* Changes Grid */}
                  <div className="flex-1 w-full space-y-6">
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-black text-gold-leeds uppercase tracking-[0.2em]">Data Diff Comparison</h4>
                        <span className="px-3 py-1 bg-gold-leeds/10 text-gold-leeds rounded-lg text-[9px] font-black uppercase">Review Required</span>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(changes).map(([field, value]) => (
                          <div key={field} className="group bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl p-4 transition-all overflow-hidden">
                             <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{field.replace(/([A-Z])/g, ' $1')}</span>
                                <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] text-gray-300 line-through truncate max-w-[100px]">{req.user[field] || 'Empty'}</span>
                                <span className="text-xs font-black text-primary truncate flex-1">{value}</span>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Quick Action Panel */}
                  <div className="xl:h-full flex flex-row xl:flex-col gap-3 shrink-0 w-full xl:w-auto">
                     <button 
                       onClick={() => handleAction(req.id, 'approve')}
                       disabled={loadingId === req.id}
                       className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all font-black uppercase text-[10px] tracking-widest disabled:opacity-50 h-14"
                     >
                        {loadingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Approve</>}
                     </button>
                     <button 
                       onClick={() => handleAction(req.id, 'reject')}
                       disabled={loadingId === req.id}
                       className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-2xl border border-gray-100 hover:border-red-100 transition-all font-black uppercase text-[10px] tracking-widest disabled:opacity-50 h-14"
                     >
                        {loadingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /> Reject</>}
                     </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
