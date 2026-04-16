'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logAdminAction } from '@/lib/audit'
import { notifyTargetedUsers } from '@/lib/createNotification'

export async function createAnnouncement(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const branchId = formData.get('branchId') as string || null
  const isPinned = formData.get('isPinned') === 'on'
  const categoryIds = formData.getAll('categoryIds') as string[]

  if (!title?.trim() || !content?.trim()) throw new Error('Title and content are required.')

  const announcement = await prisma.announcement.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      authorId: session.user.id,
      branchId: branchId || null,
      isPinned,
      targetCategories: categoryIds.length > 0 ? {
        connect: categoryIds.map(id => ({ id }))
      } : undefined
    },
  })

  // Audit trail
  await logAdminAction(
    session.user.id, 
    'CREATE', 
    'ANNOUNCEMENT', 
    announcement.id, 
    `Posted announcement: ${title.trim()} (Target: ${branchId || 'Global'})`
  )

  // Precision Notification
  await notifyTargetedUsers({
    message: `📢 New announcement: "${title.trim()}"`,
    link: '/announcements',
    branchId: branchId || null,
    categoryIds: categoryIds,
    excludeUserId: session.user.id
  })

  revalidatePath('/announcements')
  revalidatePath('/')
  redirect('/announcements')
}
