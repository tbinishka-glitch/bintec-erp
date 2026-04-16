import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Shield } from 'lucide-react'

export default async function AdminChatLogsPage() {
  const session = await auth()
  const adminId = session!.user!.id as string
  const me = await prisma.user.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      role: { select: { name: true } }
    }
  })
  const roleName = me?.role?.name
  if (roleName !== 'Super Admin') redirect('/')

  // Pull all active chats across the company
  const chatGroups = await prisma.chatGroup.findMany({
    include: {
      messages: { 
        orderBy: { createdAt: 'desc' }, 
        take: 1, 
        include: { 
          sender: { select: { id: true, name: true, image: true } } 
        } 
      },
      members: { 
        include: { 
          user: { select: { id: true, name: true, image: true, email: true } } 
        } 
      },
      category: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const categories = await prisma.chatGroupCategory.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="bg-card border border-border p-8 rounded-3xl flex items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-[#5A2D82]">
            <Shield className="w-8 h-8 text-primary" /> Corporate Chat Oversight
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Centralized command for compliance monitoring and group classification.</p>
        </div>
      </header>

      {/* Categories Management */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="font-bold text-[#4A5568]">Group Classification Categories</h3>
        </div>
        <div className="p-6 space-y-6">
          <form action={async (fd) => {
            'use server'
            const name = fd.get('name') as string
            if (!name) return
            await prisma.chatGroupCategory.create({ data: { name } })
            revalidatePath('/admin/chat-logs')
          }} className="flex gap-4">
            <input 
              name="name" 
              required 
              placeholder="New Category Name (e.g. Grade-wise)" 
              className="flex-1 bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#5A2D82]/10 transition-all"
            />
            <button className="bg-[#5A2D82] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5A2D82]/90 transition-all shadow-md shadow-[#5A2D82]/10">
              Add Category
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full border border-border group">
                <span className="text-sm font-medium text-[#4A5568]">{cat.name}</span>
                <form action={async () => {
                   'use server'
                   await prisma.chatGroupCategory.delete({ where: { id: cat.id } })
                   revalidatePath('/admin/chat-logs')
                }}>
                   <button className="text-muted-foreground hover:text-red-500 transition-colors">
                     <Shield className="w-3.5 h-3.5 rotate-45" />
                   </button>
                </form>
              </div>
            ))}
            {categories.length === 0 && <p className="text-xs text-muted-foreground italic">No custom categories defined.</p>}
          </div>
        </div>
      </section>

      {/* Main Audit Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="font-bold text-[#4A5568]">Conversation Audit Logs</h3>
        </div>
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-[#F9FAFB] text-[#4A5568]/70 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Classification</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Identity</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Recent Activity</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Participants</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Monitoring</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {chatGroups.map(group => {
              const latestMsg = group.messages[0]
              
              let title = group.name
              if (group.type === 'DIRECT') {
                title = group.members.map(m => m.user.name).join(' ↔ ')
              }

              return (
                <tr key={group.id} className="hover:bg-secondary/5 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold w-fit ${group.type === 'DIRECT' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                        {group.type}
                      </span>
                      {group.category && (
                        <span className="text-[10px] text-muted-foreground mt-1 tracking-tight">
                          {group.category.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-[#4A5568]">
                    {title}
                  </td>
                  <td className="px-6 py-5 text-muted-foreground w-1/3">
                    {latestMsg ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-[#4A5568]">{latestMsg.sender.name}:</span>
                           <span className="line-clamp-1">{latestMsg.isDeleted ? '[Deleted Message]' : latestMsg.content}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground/60">{format(new Date(latestMsg.createdAt), 'MMM d, h:mm a')}</div>
                      </div>
                    ) : (
                      'Empty Thread'
                    )}
                  </td>
                  <td className="px-6 py-5 text-muted-foreground font-medium">
                    {group.members.length} members
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link 
                      href={`/admin/chat-logs/${group.id}`}
                      className="inline-flex items-center gap-2 text-[#5A2D82] bg-[#5A2D82]/5 hover:bg-[#5A2D82]/10 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      Audit History
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {chatGroups.length === 0 && (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-4">
            <Shield className="w-12 h-12 opacity-10" />
            <p className="font-medium">No active conversations recorded for auditing.</p>
          </div>
        )}
      </div>
    </div>
  )
}
