'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Trophy, Star, Gift, TrendingUp, Award, Users, Plus } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: string; gradient: string }> = {
  'Work Anniversary': { color: 'text-amber-700', bg: 'bg-amber-100', icon: '🎂', gradient: 'from-amber-400 to-orange-500' },
  'Award':            { color: 'text-purple-700', bg: 'bg-purple-100', icon: '🏆', gradient: 'from-purple-500 to-primary' },
  'Promotion':        { color: 'text-emerald-700', bg: 'bg-emerald-100', icon: '🚀', gradient: 'from-emerald-400 to-teal-600' },
  'Recognition':      { color: 'text-blue-700', bg: 'bg-blue-100', icon: '⭐', gradient: 'from-blue-400 to-indigo-600' },
  'Other':            { color: 'text-gray-600', bg: 'bg-muted', icon: '🎉', gradient: 'from-gray-400 to-gray-600' },
}

export function CelebrationsClient({
  milestones, staffList, isAdmin, addMilestoneAction
}: {
  milestones: any[],
  staffList: any[],
  isAdmin: boolean,
  addMilestoneAction: (formData: FormData) => void
}) {
  const [activeFilter, setActiveFilter] = useState('All')
  const types = ['All', ...Array.from(new Set(milestones.map(m => m.type)))]

  const filtered = milestones.filter(m => activeFilter === 'All' || m.type === activeFilter)

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-8">

      {/* Hero Header */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#5A2D82] via-[#5A2D82] to-[#7c4da6] text-white shadow-premium shadow-primary/20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
           <div className="absolute top-0 right-0 w-96 h-96 bg-gold-leeds rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                <Trophy className="w-8 h-8 text-gold-leeds" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Celebrations <span className="text-gold-leeds">& Hub</span></h1>
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mt-2">Recognizing Excellence across LEEDS</p>
              </div>
            </div>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest flex-wrap">
              <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 text-gold-leeds" /> {milestones.length} Milestones
              </span>
              <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm">
                <Users className="w-3.5 h-3.5 text-gold-leeds" /> {new Set(milestones.map(m => m.userId)).size} Staff Celebrated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HR Admin: Post celebration */}
      {isAdmin && (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border-2 border-dashed border-primary/10">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
               <Plus className="w-5 h-5 text-primary" />
             </div>
             <h3 className="text-xl font-black text-gray-900 tracking-tight">Post New Recognition</h3>
          </div>
          <form action={addMilestoneAction} className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="userId" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Staff Member</label>
              <select id="userId" name="userId" required
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-[1.25rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">Select staff member…</option>
                {staffList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Milestone Type</label>
              <select id="type" name="type" required
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-[1.25rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">Select type…</option>
                {['Work Anniversary', 'Award', 'Promotion', 'Recognition', 'Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="description" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Message (displayed on wall)</label>
              <textarea id="description" name="description" rows={3}
                placeholder="Describe the achievement in detail..."
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all" />
            </div>
            <div className="sm:col-span-2 flex justify-end pt-2">
              <button type="submit"
                className="px-10 py-4 bg-primary hover:bg-primary/95 text-white text-sm font-black rounded-2xl shadow-premium shadow-primary/20 transition-all">
                Submit Celebration 🎉
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {types.map(type => (
          <button key={type} onClick={() => setActiveFilter(type)}
            className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeFilter === type ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
            }`}>
            {type === 'All' ? '🎊 All' : `${TYPE_CONFIG[type]?.icon || '🎉'} ${type}`}
          </button>
        ))}
      </div>

      {/* Milestones Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white p-20 rounded-[2.5rem] shadow-soft text-center text-gray-400 border border-gray-50">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-100" />
            <p className="text-xl font-black text-gray-900 uppercase tracking-widest leading-none">Wall Empty</p>
            <p className="text-xs font-bold text-gray-300 mt-3 uppercase tracking-widest">No celebrations recorded in this category</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m, i) => {
              const cfg = TYPE_CONFIG[m.type] || TYPE_CONFIG.Other
              return (
                 <motion.div layout key={m.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft group hover:shadow-premium transition-all border border-transparent hover:border-primary/5">
                  {/* Banner */}
                  <div className={`h-24 bg-gradient-to-r ${cfg.gradient} relative overflow-hidden flex items-center px-8`}>
                    <div className="absolute inset-0 bg-black/10" />
                     <span className="relative z-10 px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">
                        {cfg.icon} {m.type}
                      </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <UserAvatar imageUrl={m.user.image} name={m.user.name} size="lg" className="ring-4 ring-primary/5" />
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 group-hover:text-primary transition-colors truncate">{m.user.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{m.user.branch?.name || 'Network-wide'}</p>
                      </div>
                    </div>
                    {m.description && (
                      <p className="text-sm text-gray-600 leading-loose bg-gray-50 rounded-[1.25rem] px-6 py-5 italic font-medium relative">
                         <span className="text-primary/20 absolute -top-1 left-2 text-2xl font-serif">“</span>
                         {m.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-[0.15em] pt-4 border-t border-gray-50">
                      <span className="text-gray-300">{format(new Date(m.createdAt), 'MMMM do, yyyy')}</span>
                      <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                        <Star className="w-3.5 h-3.5 fill-current" /> Celebrate
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
