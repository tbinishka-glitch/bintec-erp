'use client'

import { useTransition, useState, useOptimistic } from 'react'
import { addComment, deleteComment } from '@/lib/comments'
import { format } from 'date-fns'
import { MessageSquare, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

type Comment = {
  id: string
  content: string
  createdAt: Date
  userId: string
  user: { name: string | null; firstName: string | null; lastName: string | null }
}

interface CommentSectionProps {
  entityType: string
  entityId: string
  initialComments: Comment[]
  currentUserId: string
  revalidatePath: string
}

export default function CommentSection({
  entityType,
  entityId,
  initialComments,
  currentUserId,
  revalidatePath,
}: CommentSectionProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [pending, startTransition] = useTransition()

  const [comments, addOptimistic] = useOptimistic(
    initialComments,
    (state: Comment[], newComment: Comment) => [...state, newComment]
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    const optimisticComment: Comment = {
      id: `opt-${Date.now()}`,
      content: text.trim(),
      createdAt: new Date(),
      userId: currentUserId,
      user: { name: 'You', firstName: null, lastName: null },
    }
    const content = text.trim()
    setText('')
    startTransition(async () => {
      addOptimistic(optimisticComment)
      await addComment(entityType, entityId, content, revalidatePath)
    })
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      await deleteComment(commentId, revalidatePath)
    })
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium py-1"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}` : 'Comment'}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {/* Comment list */}
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 group">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {c.user.name?.[0] ?? '?'}
              </div>
              <div className="flex-1 bg-muted rounded-xl px-3 py-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground">{c.user.name ?? 'Unknown'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{format(new Date(c.createdAt), 'MMM d, HH:mm')}</span>
                    {c.userId === currentUserId && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}

          {/* Add comment form */}
          <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment…"
              maxLength={500}
              className="flex-1 px-3 py-2 text-xs border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
            <button
              type="submit"
              disabled={pending || !text.trim()}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
