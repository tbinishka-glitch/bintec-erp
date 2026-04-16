'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function toggleReaction(
  entityType: string,
  entityId: string,
  emoji: string,
  revalidate: string
) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const existing = await prisma.reaction.findUnique({
    where: { userId_entityType_entityId_emoji: { userId, entityType, entityId, emoji } },
  })

  // Enforce single reaction by deleting any existing reactions from this user on this entity
  await prisma.reaction.deleteMany({
    where: { userId, entityType, entityId }
  })

  // If the user wasn't just toggling their current reaction off, create the new one
  if (!existing) {
    await prisma.reaction.create({ data: { userId, entityType, entityId, emoji } })
  }

  revalidatePath(revalidate)
}

export async function getReactionSummary(entityType: string, entityId: string, currentUserId: string) {
  const reactions = await prisma.reaction.findMany({
    where: { entityType, entityId },
    select: { emoji: true, userId: true },
  })

  const summary: Record<string, { count: number; reacted: boolean }> = {}
  for (const r of reactions) {
    if (!summary[r.emoji]) summary[r.emoji] = { count: 0, reacted: false }
    summary[r.emoji].count++
    if (r.userId === currentUserId) summary[r.emoji].reacted = true
  }
  return summary
}
