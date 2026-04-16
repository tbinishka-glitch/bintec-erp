'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Plus, X, MessageSquare, Users, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createDirectMessage, createGroupChat, deleteChatGroup } from './actions'
import { DeleteConversationModal } from '@/components/chat/DeleteConversationModal'

export function ChatSidebar({ groups, availableUsers, currentUserId, categories }: any) {
  const [modal, setModal] = useState<'NONE' | 'DM' | 'GROUP'>('NONE')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const pathname = usePathname()
  const router = useRouter()
  const [deleteModal, setDeleteModal] = useState<{ id: string, title: string } | null>(null)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const [groupIconUrl, setGroupIconUrl] = useState<string | null>(null)

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingIcon(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        setGroupIconUrl(data.url)
      }
    } catch (err) {
      console.error('Icon upload failed', err)
    } finally {
      setIsUploadingIcon(false)
    }
  }

  const filteredGroups = groups.filter((g: any) => {
    const isDirect = g.type === 'DIRECT'
    const peer = isDirect ? g.members.find((m: any) => m.userId !== currentUserId)?.user : null
    const title = isDirect ? (peer?.name || '') : (g.name || '')
    
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'ALL' || g.categoryId === filterCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <div className="flex flex-col h-full bg-card">
        {/* Header */}
        <div className="p-5 border-b border-border space-y-4 bg-card">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#5A2D82]">Messages</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setModal('DM')} 
                className="p-2.5 bg-[#5A2D82]/5 hover:bg-[#5A2D82]/10 rounded-xl transition-all duration-300 group" 
                title="New Direct Message"
              >
                <MessageSquare className="w-5 h-5 text-[#5A2D82] group-hover:scale-110 transition-transform" />
              </button>
              <button 
                onClick={() => setModal('GROUP')} 
                className="p-2.5 bg-[#5A2D82]/5 hover:bg-[#5A2D82]/10 rounded-xl transition-all duration-300 group" 
                title="New Group Chat"
              >
                <Users className="w-5 h-5 text-[#5A2D82] group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5A2D82]/20 transition-all outline-none pl-10"
              />
              <Plus className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground rotate-45" />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button 
                onClick={() => setFilterCategory('ALL')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                  filterCategory === 'ALL' 
                    ? 'bg-[#5A2D82] text-white border-[#5A2D82]' 
                    : 'bg-transparent text-muted-foreground border-border hover:border-primary'
                }`}
              >
                All
              </button>
              {categories.map((cat: any) => (
                <button 
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                    filterCategory === cat.id 
                      ? 'bg-[#5A2D82] text-white border-[#5A2D82]' 
                      : 'bg-transparent text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#F9FAFB]/50">
          {filteredGroups.map((g: any) => {
            const isDirect = g.type === 'DIRECT'
            const peer = isDirect ? g.members.find((m: any) => m.userId !== currentUserId)?.user : null
            const title = isDirect ? (peer?.name || 'Staff Member') : g.name
            const isActive = pathname === `/chat/${g.id}`
            const latestMsg = g.messages?.[0]
            const unread = g.unreadCount || 0

            return (
              <Link key={g.id} href={`/chat/${g.id}`} 
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group relative border ${
                  isActive 
                    ? 'bg-white shadow-md border-[#5A2D82]/20 translate-x-1' 
                    : 'hover:bg-white hover:shadow-sm border-transparent'
                }`}>
                
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm transition-transform group-hover:scale-105 overflow-hidden ${
                  isActive ? 'ring-2 ring-primary ring-offset-2' : ''
                } ${
                  isDirect ? 'bg-gradient-to-br from-[#5A2D82] to-[#4A5568]' : 'bg-gradient-to-br from-[#C9A227] to-[#BC8E1E]'
                }`}>
                  {isDirect && peer?.image ? (
                    <img src={peer.image} alt={title} className="w-full h-full object-cover" />
                  ) : !isDirect && g.iconUrl ? (
                    <img src={g.iconUrl} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    title.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-bold text-sm truncate ${isActive ? 'text-[#5A2D82]' : 'text-[#4A5568]'}`}>
                      {title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-relaxed">
                    {latestMsg ? (
                      <>
                        <span className="font-medium text-[#4A5568]/70">{latestMsg.sender?.name?.split(' ')[0]}: </span>
                        {latestMsg.type === 'TEXT' ? latestMsg.content : 'Sent an attachment'}
                      </>
                    ) : (
                      'No messages yet'
                    )}
                  </p>
                </div>

                {/* Badge/Check */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 relative">
                  {latestMsg && (
                    <span className="text-[10px] text-muted-foreground group-hover:opacity-0 transition-opacity">
                      {new Date(latestMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {unread > 0 && (
                    <div className="bg-[#C9A227] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                      {unread}
                    </div>
                  )}
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteModal({ id: g.id, title });
                    }}
                    className="absolute top-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                    title="Delete Conversation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#5A2D82] rounded-r-full" />
                )}
              </Link>
            )
          })}

          {filteredGroups.length === 0 && (
            <div className="p-10 text-center space-y-3">
              <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals - Same premium style */}
      {modal !== 'NONE' && (
        <div className="fixed inset-0 bg-[#4A5568]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setModal('NONE')} 
              className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-[#5A2D82]">
              {modal === 'DM' ? 'New Direct Message' : 'Create Enterprise Group'}
            </h3>
            
            {modal === 'DM' ? (
              <form action={(data) => { createDirectMessage(data); setModal('NONE'); }} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#4A5568] ml-1">Recipient</label>
                  <select name="targetId" required className="w-full border border-border rounded-2xl px-5 py-3.5 bg-background focus:ring-4 focus:ring-[#5A2D82]/10 transition-all outline-none appearance-none">
                    <option value="">Choose a staff member...</option>
                    {availableUsers.filter((u:any) => u.id !== currentUserId).map((u:any) => (
                      <option value={u.id} key={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#5A2D82] text-white font-bold py-4 rounded-2xl hover:bg-[#5A2D82]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#5A2D82]/20">
                  Proceed to Chat
                </button>
              </form>
            ) : (
              <form action={(data) => { createGroupChat(data); setModal('NONE'); }} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#4A5568] ml-1">Group Name</label>
                  <input type="text" name="name" required className="w-full border border-border rounded-2xl px-5 py-3.5 bg-background focus:ring-4 focus:ring-[#5A2D82]/10 transition-all outline-none" placeholder="e.g. Science Faculty" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#4A5568] ml-1">Audit Category</label>
                  <select name="categoryId" className="w-full border border-border rounded-2xl px-5 py-3.5 bg-background focus:ring-4 focus:ring-[#5A2D82]/10 transition-all outline-none">
                    <option value="">General Group</option>
                    {categories.map((cat: any) => (
                      <option value={cat.id} key={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#4A5568] ml-1">Group Icon (Optional)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0">
                      {groupIconUrl ? (
                        <img src={groupIconUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : isUploadingIcon ? (
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <div className="py-2 px-4 bg-secondary hover:bg-secondary/80 rounded-xl text-xs font-bold text-center transition-all border border-border">
                        {groupIconUrl ? 'Change Icon' : 'Upload Icon'}
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleIconUpload} disabled={isUploadingIcon} />
                    </label>
                  </div>
                  <input type="hidden" name="iconUrl" value={groupIconUrl || ''} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#4A5568] ml-1">Participants</label>
                  <select name="members" multiple required className="w-full border border-border rounded-2xl px-5 py-3 bg-background h-40 focus:ring-4 focus:ring-[#5A2D82]/10 transition-all outline-none text-sm scrollbar-thin">
                    {availableUsers.filter((u:any) => u.id !== currentUserId).map((u:any) => (
                      <option value={u.id} key={u.id} className="py-2.5 px-2 hover:bg-[#5A2D82]/5 rounded-lg mb-1">{u.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={isUploadingIcon}
                  className="w-full bg-[#5A2D82] text-white font-bold py-4 rounded-2xl hover:bg-[#5A2D82]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#5A2D82]/20 disabled:opacity-50"
                >
                  {isUploadingIcon ? 'Finalizing Assets...' : 'Initialize Group'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {deleteModal && (
        <DeleteConversationModal 
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          onConfirm={async () => {
             const result = await deleteChatGroup(deleteModal.id);
             if (result?.success) {
               // If we are currently in the chat being deleted, redirect
               if (pathname === `/chat/${deleteModal.id}`) {
                 router.push('/chat');
               }
               setDeleteModal(null);
             }
          }}
          title={deleteModal.title}
        />
      )}
    </>
  )
}
