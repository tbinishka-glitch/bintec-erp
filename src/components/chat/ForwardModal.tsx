'use client'

import { useState } from 'react'
import { X, Search, Send, Users, MessageSquare } from 'lucide-react'

interface ForwardModalProps {
  onClose: () => void
  onForward: (targetGroupId: string) => Promise<void>
  groups: any[]
  currentUserId: string
  isMultiple: boolean
}

export function ForwardModal({ onClose, onForward, groups, currentUserId, isMultiple }: ForwardModalProps) {
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filteredGroups = groups.filter((g: any) => {
    const isDirect = g.type === 'DIRECT'
    const peer = isDirect ? g.members.find((m: any) => m.userId !== currentUserId)?.user : null
    const title = isDirect ? (peer?.name || '') : (g.name || '')
    return title.toLowerCase().includes(search.toLowerCase())
  })

  const handleForward = async (groupId: string) => {
    setLoadingId(groupId)
    try {
      await onForward(groupId)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#4A5568]/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div>
            <h3 className="text-xl font-bold text-[#5A2D82] flex items-center gap-2">
              <Send className="w-5 h-5" />
              {isMultiple ? 'Forward Selected Messages' : 'Forward Message'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Choose a destination to share</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-secondary rounded-xl transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border bg-[#F9FAFB]/50">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-border rounded-xl px-10 py-2.5 text-sm focus:ring-2 focus:ring-[#5A2D82]/20 outline-none transition-all shadow-sm"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
          </div>
        </div>

        {/* Dest List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#F9FAFB]/50">
          {filteredGroups.map((g: any) => {
            const isDirect = g.type === 'DIRECT'
            const peer = isDirect ? g.members.find((m: any) => m.userId !== currentUserId)?.user : null
            const title = isDirect ? (peer?.name || 'Staff Member') : g.name
            const isLoading = loadingId === g.id

            return (
              <button 
                key={g.id}
                onClick={() => handleForward(g.id)}
                disabled={!!loadingId}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200 group border border-transparent hover:border-[#5A2D82]/10 disabled:opacity-50"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${
                  isDirect ? 'bg-gradient-to-br from-[#5A2D82] to-[#4A5568]' : 'bg-gradient-to-br from-[#C9A227] to-[#BC8E1E]'
                }`}>
                  {isDirect ? <MessageSquare className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-[#4A5568] truncate">{title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{g.type}</p>
                </div>
                <div className={`p-2 rounded-lg transition-all ${isLoading ? 'bg-[#5A2D82]/10 rotate-12' : 'group-hover:bg-[#5A2D82]/10'}`}>
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[#5A2D82] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-[#5A2D82]" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
