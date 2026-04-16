'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { notifyAllUsers } from '@/lib/createNotification'

export async function createMilestone(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const targetUserId = formData.get('targetUserId') as string

  if (!type || !targetUserId) return

  await prisma.milestone.create({
    data: {
      type,
      description,
      userId: targetUserId,
    }
  })

  // notify everyone
  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }})
  await notifyAllUsers(`🎉 New ${type} milestone for ${targetUser?.name}! Go celebrate!`, '/celebrations')

  revalidatePath('/celebrations')
}
