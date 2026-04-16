import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Shield, ArrowLeft, Trash2, FileIcon, ImageIcon, Mic } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default async function AdminChatAuditPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const session = await auth()
  const adminId = session?.user?.id
  const me = await prisma.user.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      role: { select: { name: true } }
    }
  })
  const roleName = me?.role?.name
  if (roleName !== 'Super Admin') redirect('/')

  const group = await prisma.chatGroup.findUnique({
    where: { id: groupId },
    include: { 
      members: { 
        include: { 
          user: { select: { id: true, name: true, image: true } } 
        } 
      },
      messages: { 
        orderBy: { createdAt: 'asc' }, 
        include: { 
          sender: { select: { id: true, name: true, image: true } }, 
          deletedBy: { select: { id: true, name: true } } 
        } 
      }
    }
  })

  if (!group) redirect('/admin/chat-logs')

  const isDirect = group.type === 'DIRECT'
  const title = isDirect 
    ? group.members.map(m => m.user.name).join(' ↔ ') 
    : group.name

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/chat-logs" className="p-2.5 hover:bg-secondary rounded-xl border border-border transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Shield className="w-6 h-6 text-primary" /> Audit: {title}
            </h2>
            <p className="text-sm text-muted-foreground">Compliance review of message history and media exchanges.</p>
          </div>
        </div>
      </header>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-secondary/5">
          {group.messages.map((m) => (
            <div key={m.id} className="flex flex-col items-start max-w-4xl">
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <span className="text-sm font-bold text-foreground">{m.sender.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(m.createdAt), 'MMM d, h:mm a')}</span>
                {m.isDeleted && (
                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Deleted by {m.deletedBy?.name || 'Staff'}</span>
                )}
              </div>
              
              <div className={`px-5 py-4 rounded-2xl border bg-white shadow-sm w-full max-w-2xl ${m.isDeleted ? 'border-red-200 opacity-80' : 'border-border'}`}>
                {m.type === 'IMAGE' && m.fileUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-border">
                    <img src={m.fileUrl} alt="Audit attachment" className="max-h-80 w-auto" />
                  </div>
                )}
                
                {m.type === 'VOICE' && m.fileUrl && (
                  <div className="mb-3 p-3 bg-secondary/20 rounded-xl flex items-center gap-3 border border-border/50">
                    <Mic className="w-5 h-5 text-primary" />
                    <audio src={m.fileUrl} controls className="h-8" />
                  </div>
                )}

                {(m.type === 'FILE' || m.type === 'VIDEO') && m.fileUrl && (
                  <a href={m.fileUrl} target="_blank" className="mb-3 flex items-center gap-3 p-3 bg-secondary/20 rounded-xl border border-border/50 hover:bg-secondary/30 transition-colors">
                    <FileIcon className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold truncate flex-1">{m.fileName || 'Attachment'}</span>
                  </a>
                )}

                <div className="prose prose-sm max-w-none text-foreground break-words">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {group.messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground italic">
              No messages recorded in this conversation.
            </div>
          )}
        </div>
        
        <footer className="p-4 bg-muted border-t border-border text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          End of Audit Log - Confidential Compliance Record
        </footer>
      </div>
    </div>
  )
}
