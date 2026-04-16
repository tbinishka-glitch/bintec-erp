'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { 
  Video, Calendar, Plus, Search, 
  Trash2, ArrowRight, User, Building2,
  Clock, ShieldCheck, Sparkles, ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/ui/UserAvatar'

export function MeetingsClient({ 
  meetings, 
  user,
  isAdmin,
  categories,
  createMeetingAction,
  deleteMeetingAction
}: { 
  meetings: any[], 
  user: any,
  isAdmin: boolean,
  categories: any[],
  createMeetingAction: (formData: FormData) => void,
  deleteMeetingAction: (formData: FormData) => void
}) {
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const filtered = meetings.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.host.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    const formData = new FormData()
    formData.append('id', id)
    
    try {
      await deleteMeetingAction(formData)
      toast.success('Meeting room deleted')
      setConfirmDeleteId(null)
    } catch (err) {
      toast.error('Failed to delete room')
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-24 space-y-12">
      
      {/* ── 1. CINEMATIC HERO HEADER ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[2.5rem] bg-[#5A2D82] text-white overflow-hidden shadow-premium shadow-primary/20"
      >
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-leeds rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 opacity-30" />
        </div>

        <div className="relative py-14 md:py-24 px-10 md:px-16 z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                <Video className="w-8 h-8 text-gold-leeds" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Virtual <span className="text-gold-leeds">Meeting</span> Hub</h1>
                <p className="text-white/60 text-xs font-black uppercase tracking-[0.3em] mt-2">Native WebRTC Coordination Center</p>
              </div>
            </div>
            <p className="text-base md:text-lg text-white/80 font-medium leading-relaxed max-w-lg">
              Secure, instant video rooms for seamless collaboration across our regional network. No downloads, zero latency.
            </p>
            <div className="flex gap-4">
               <button 
                 onClick={() => setIsCreating(true)}
                 className="px-8 py-4 bg-gold-leeds text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-gold-leeds/20 hover:scale-105 transition-all flex items-center gap-2"
               >
                 <Plus className="w-4 h-4" /> Start New Room
               </button>
            </div>
          </div>

          {/* Stats / Quick Info */}
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
             <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm min-w-[160px]">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Active Rooms</p>
                <p className="text-3xl font-black text-white">{meetings.length}</p>
             </div>
             <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm min-w-[160px]">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Accessibility</p>
                <p className="text-3xl font-black text-gold-leeds">Global</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. ACTIONS & FILTERS ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by meeting title or host..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4.5 bg-white border border-gray-100 rounded-[1.5rem] shadow-soft text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
            />
         </div>
         
         <div className="flex items-center gap-3">
            <span className="px-5 py-2.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-100">
               Total Rooms: {filtered.length}
            </span>
         </div>
      </div>

      {/* ── 3. CREATE MODAL (AnimatePresence) ── */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsCreating(false)}
               className="absolute inset-0 bg-black/40 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8"
             >
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Schedule Room</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Broadcast a new virtual space</p>
                   </div>
                   <button onClick={() => setIsCreating(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                      <Plus className="w-6 h-6 rotate-45" />
                   </button>
                </div>

                <form action={async (fd) => {
                  try {
                    await createMeetingAction(fd);
                    toast.success('Room scheduled successfully');
                    setIsCreating(false);
                  } catch (e) {
                    toast.error('Failed to schedule room');
                  }
                }} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Meeting Title</label>
                      <input name="title" required type="text" placeholder="e.g. Science Dept Sync" 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                   </div>
                   <div className="space-y-4 border-t border-slate-50 pt-6">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" /> Target Staff Categories
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((c) => (
                          <label key={c.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer group has-[:checked]:bg-primary/5 has-[:checked]:border-primary/20">
                            <input type="checkbox" name="categoryIds" value={c.id} className="w-4 h-4 rounded accent-primary" />
                            <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-primary transition-colors">{c.name}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest italic leading-relaxed">If none selected, room is open to all personnel in the branch.</p>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Scheduled Time (Optional)</label>
                      <input name="scheduledFor" type="datetime-local" 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                   </div>
                   <button type="submit" className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
                      Create Virtual Space
                   </button>
                   <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest opacity-60">Powered by Secure WebRTC Infrastructure</p>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 4. MEETINGS GRID ── */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-4"
          >
             <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                <Video className="w-10 h-10" />
             </div>
             <div>
                <p className="text-xl font-black text-gray-900 uppercase tracking-widest">No Active Rooms</p>
                <p className="text-xs font-bold text-gray-300 mt-2 uppercase tracking-widest">Schedule a room to begin a session</p>
             </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((m, i) => (
              <motion.div 
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-[3rem] p-8 shadow-soft border border-gray-50 hover:shadow-premium hover:border-primary/5 transition-all flex flex-col gap-8 relative overflow-hidden"
              >
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-12 translate-x-12 group-hover:bg-primary/10 transition-colors" />

                <div className="flex justify-between items-start">
                   <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                      <Video className="w-7 h-7" />
                   </div>
                   {isAdmin && (
                     <div className="relative">
                        <AnimatePresence mode="wait">
                          {confirmDeleteId === m.id ? (
                            <motion.div 
                              key="confirm"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center gap-2"
                            >
                               <button 
                                 onClick={() => setConfirmDeleteId(null)}
                                 className="px-3 py-1.5 bg-gray-100 text-gray-500 text-[9px] font-black uppercase rounded-lg hover:bg-gray-200 transition-all"
                               >
                                 Cancel
                               </button>
                               <button 
                                 onClick={() => handleDelete(m.id)}
                                 className="px-3 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase rounded-lg hover:bg-rose-600 shadow-md shadow-rose-200 transition-all"
                               >
                                 Delete
                               </button>
                            </motion.div>
                          ) : (
                            <motion.button 
                              key="trash"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setConfirmDeleteId(m.id)}
                              className="p-2 hover:bg-rose-50 text-gray-300 hover:text-rose-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          )}
                        </AnimatePresence>
                     </div>
                   )}
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                      <Sparkles className="w-3.5 h-3.5" /> Room Active
                   </div>
                   <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-1">{m.title}</h3>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <UserAvatar imageUrl={m.host.image} name={m.host.name} size="xs" />
                         <span className="text-xs font-bold text-gray-600">{m.host.name}</span>
                      </div>
                      {m.scheduledFor && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-400 font-bold text-[9px] rounded-lg">
                           <Clock className="w-3 h-3" /> {format(new Date(m.scheduledFor), 'MMM d, p')}
                        </div>
                      )}
                   </div>
                </div>

                <Link href={`/meetings/${m.id}`} className="mt-2 w-full flex items-center justify-center gap-3 py-4.5 bg-gray-50 rounded-2xl text-[11px] font-black uppercase text-gray-500 tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm group-hover:shadow-primary-premium">
                   Enter Boardroom <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── 5. PRIVACY & SECURITY FOOTER ── */}
      <div className="flex flex-col items-center justify-center gap-6 pt-12 border-t border-gray-100 opacity-40 grayscale">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
               <ShieldCheck className="w-4 h-4" /> End-to-End Encrypted
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
               <Building2 className="w-4 h-4" /> ISO 27001 Infrastructure
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
               <ExternalLink className="w-4 h-4" /> WebRTC Compliant
            </div>
         </div>
      </div>

    </div>
  )
}
