'use client'

import { useTransition, useOptimistic } from 'react'
import { toggleReaction } from '@/lib/reactions'
import { CustomHeart } from './CustomHeart'

const EMOJIS = ['❤️', '👍', '🎉', '👏']

type ReactionSummary = Record<string, { count: number; reacted: boolean }>

interface ReactionBarProps {
  entityType: string
  entityId: string
  initialReactions: ReactionSummary
  revalidatePath: string
}

export default function ReactionBar({
  entityType,
  entityId,
  initialReactions,
  revalidatePath,
}: ReactionBarProps) {
  const [pending, startTransition] = useTransition()

  const [optimistic, addOptimistic] = useOptimistic(
    initialReactions,
    (state: ReactionSummary, emoji: string) => {
      const prev = state[emoji] ?? { count: 0, reacted: false }
      return {
        ...state,
        [emoji]: {
          count: prev.reacted ? prev.count - 1 : prev.count + 1,
          reacted: !prev.reacted,
        },
      }
    }
  )

  function handleReact(emoji: string) {
    startTransition(async () => {
      addOptimistic(emoji)
      await toggleReaction(entityType, entityId, emoji, revalidatePath)
    })
  }

  const renderEmoji = (emoji: string) => {
    if (emoji === '❤️') {
      return <CustomHeart size={16} animate={false} className="cursor-pointer" />
    }
    return <span>{emoji}</span>
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {EMOJIS.map((emoji) => {
        const data = optimistic[emoji] ?? { count: 0, reacted: false }
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            disabled={pending}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              data.reacted
                ? 'bg-primary/15 text-primary border border-primary/30 scale-105'
                : 'bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground border border-transparent'
            }`}
          >
            {renderEmoji(emoji)}
            {data.count > 0 && (
              <span className={`text-[11px] font-bold ${data.reacted ? 'text-primary' : ''}`}>
                {data.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
