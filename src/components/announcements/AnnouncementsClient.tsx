'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import Link from 'next/link'
import { Pin, Megaphone, Search, Paperclip, CheckCircle2, Bell, Info } from 'lucide-react'
import ReactionBar from '@/components/ui/ReactionBar'
import CommentSection from '@/components/ui/CommentSection'
import { UserAvatar } from '@/components/ui/UserAvatar'

export function AnnouncementsClient({ 
  announcements, 
  userBranchName, 
  currentUserId 
}: { 
  announcements: any[], 
  userBranchName?: string, 
  currentUserId: string 
}) {
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({})

  const filteredAnnouncements = announcements.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       a.content.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchSearch) return false
    
    if (activeTab === 'Urgent') return a.isPinned
    if (activeTab === 'Branch') return a.branch?.name === userBranchName
    return true
  })

  const pinnedAnnouncements = announcements.filter(a => a.isPinned).slice(0, 3)

  // Calculate which tabs have content
  const hasUrgent = announcements.some(a => a.isPinned)
  const hasBranch = userBranchName && announcements.some(a => a.branch?.name === userBranchName)
  const hasDepartment = false 
  const hasArchived = false 
  
  const availableTabs: string[] = ['All']
  if (hasUrgent) availableTabs.push('Urgent')
  if (hasBranch) availableTabs.push('Branch')
  if (hasDepartment) availableTabs.push('Department')
  if (hasArchived) availableTabs.push('Archived')

  // Synthesize some stats
  const totalAck = Object.keys(acknowledged).length

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      
      {/* Header */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-primary to-primary-900 text-white shadow-premium">
        <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                <Megaphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase">Announcements</h1>
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mt-2">Leeds Corporate Briefing Center</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search memos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold-leeds/50 text-sm"
              />
            </div>
            <Link href="/announcements/new" className="shrink-0 bg-gold-leeds hover:bg-gold-leeds/90 text-black font-black py-3.5 px-8 rounded-2xl shadow-xl transition-all text-sm uppercase tracking-widest">
              + Post
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-10 pb-10 flex gap-2 overflow-x-auto scrollbar-none">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-white text-primary shadow-lg' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Framework (70 / 30) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Feed (70%) */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAnnouncements.length === 0 ? (
               <motion.div 
                 key="empty-announcements"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="bg-white p-16 rounded-[2.5rem] shadow-soft text-center text-gray-400 border border-gray-50"
               >
                 <Bell className="w-12 h-12 mx-auto mb-4 text-gray-100" />
                 <p className="text-lg font-bold text-gray-900">Nothing found.</p>
                 <p className="text-xs font-semibold uppercase tracking-widest mt-2">Try tweaking your active filters</p>
               </motion.div>
            ) : (
              filteredAnnouncements.map((a, index) => {
                const isAck = acknowledged[a.id]
                return (
                    <motion.div 
                      key={a.id || `announcement-${index}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-[2.5rem] p-8 transition-all duration-300 relative overflow-hidden shadow-soft hover:shadow-premium group border border-transparent hover:border-primary/5 ${a.isPinned ? 'border-l-4 border-l-rose-500' : ''}`}
                    >
                    {/* Read indicator stub */}
                    {!isAck && <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-primary rounded-full animate-pulse blur-[1px]" />}
                    {isAck && <div className="absolute top-6 right-6 flex items-center gap-1 text-[10px] uppercase font-bold text-teal-600"><CheckCircle2 className="w-3.5 h-3.5"/> Read</div>}

                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      {/* Avatar */}
                      <UserAvatar
                        imageUrl={a.author?.image}
                        firstName={a.author?.firstName}
                        lastName={a.author?.lastName}
                        name={a.author?.name}
                        size="lg"
                        className="shadow-inner"
                        gradient="from-indigo-100 to-primary/20"
                      />

                      {/* Content Body */}
                      <div className="flex-1 space-y-3 w-full">
                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                          <span className="text-gray-900">{a.author.name}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400">{format(new Date(a.createdAt), "MMM do, h:mm a")}</span>
                          <span className="text-muted-foreground">•</span>
                          {a.branch ? (
                             <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">{a.branch.name}</span>
                          ) : (
                             <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">Global HQ</span>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2">
                           {a.isPinned ? (
                             <span className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-rose-100"><Pin className="w-3 h-3"/> Urgent Action</span>
                           ) : (
                             <span className="flex items-center gap-1 px-3 py-1 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary/10"><Info className="w-3 h-3"/> Announcement</span>
                           )}
                        </div>

                        {/* Text */}
                        <div className="px-1">
                           <h3 className="text-2xl font-black text-gray-900 leading-tight mb-3 group-hover:text-primary transition-colors pr-8">{a.title}</h3>
                           <p className="text-sm text-gray-600 leading-loose whitespace-pre-wrap">{a.content}</p>
                        </div>
                        
                        {/* Bottom Actions */}
                        <div className="pt-6 mt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-6">
                           <div className="flex items-center gap-8 flex-1">
                             <ReactionBar entityType="Announcement" entityId={a.id} initialReactions={a.summaryReactions} revalidatePath="/announcements" />
                             <CommentSection entityType="Announcement" entityId={a.id} currentUserId={currentUserId} initialComments={a.comments} revalidatePath="/announcements" />
                           </div>
                           
                           <button 
                             onClick={() => setAcknowledged(p => ({...p, [a.id]: true}))}
                             disabled={isAck}
                             className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                               isAck 
                               ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100' 
                               : 'bg-primary hover:bg-primary/95 text-white shadow-premium shadow-primary/20 hover:translate-y-[-1px]'
                             }`}
                           >
                             {isAck ? 'Acknowledged' : 'Acknowledge'}
                           </button>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Sidebar (30%) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Pinned Widget */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-50 relative overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
               <Pin className="w-4 h-4 text-rose-500"/> Pinned Memos
            </h3>
            
            <div className="space-y-6 relative z-10">
              {pinnedAnnouncements.length === 0 ? (
                <p className="text-xs text-center py-4 text-gray-300 font-bold uppercase tracking-widest">No pinned memos.</p>
              ) : pinnedAnnouncements.map((p, index) => (
                <div key={p.id || `pinned-${index}`} className="group cursor-pointer border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1.5">{p.branch?.name || 'Global HQ'}</p>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">{p.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-gradient-to-br from-primary to-purple-800 p-1 rounded-[2.5rem] shadow-premium shadow-primary/20">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.4rem] space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Engagement Hub</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/10 rounded-3xl border border-white/10 text-center">
                  <p className="text-4xl font-black text-white">{announcements.length}</p>
                  <p className="text-[9px] uppercase font-black text-white/40 mt-1 tracking-widest leading-none">Total Memos</p>
                </div>
                <div className="p-5 bg-white/10 rounded-3xl border border-white/10 text-center">
                  <p className="text-4xl font-black text-gold-leeds">{totalAck}</p>
                  <p className="text-[9px] uppercase font-black text-white/40 mt-1 tracking-widest leading-none">Read</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
