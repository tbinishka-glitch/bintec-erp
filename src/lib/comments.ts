'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addComment(
  entityType: string,
  entityId: string,
  content: string,
  revalidate: string
) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!content?.trim()) return

  await prisma.comment.create({
    data: {
      userId: session.user.id,
      entityType,
      entityId,
      content: content.trim(),
    },
  })

  revalidatePath(revalidate)
}

export async function deleteComment(commentId: string, revalidate: string) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) return
  if (comment.userId !== session.user.id) return // only own comments

  await prisma.comment.delete({ where: { id: commentId } })
  revalidatePath(revalidate)
}
