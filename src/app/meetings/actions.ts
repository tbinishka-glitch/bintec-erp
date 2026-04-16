'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { logAdminAction } from '@/lib/audit'
import { notifyTargetedUsers } from '@/lib/createNotification'

export async function createMeeting(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const title = formData.get('title') as string
  const scheduledForRaw = formData.get('scheduledFor') as string
  const branchId = formData.get('branchId') as string || null
  const categoryIds = formData.getAll('categoryIds') as string[]
  
  if (!title) throw new Error("Title is required.")

  const myId = session.user.id
  const me = await prisma.user.findUnique({ where: { id: myId }, include: { role: true } })
  const roleName = me?.role?.name || ''
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin'].includes(roleName)
  const isBranchAdmin = roleName === 'Branch Admin'

  // Security: Branch admins can only target their own branch
  const effectiveBranchId = isBranchAdmin ? me?.branchId : branchId

  const meeting = await prisma.virtualMeeting.create({
    data: {
      title,
      scheduledFor: scheduledForRaw ? new Date(scheduledForRaw) : null,
      hostId: myId,
      branchId: effectiveBranchId || null,
      targetCategories: categoryIds.length > 0 ? {
        connect: categoryIds.map(id => ({ id }))
      } : undefined
    }
  })

  await logAdminAction(
    myId, 
    'CREATE', 
    'MEETING', 
    meeting.id, 
    `Scheduled meeting: ${title} (Target: ${effectiveBranchId || 'Global'})`
  )

  // Notify Targeted Audience
  await notifyTargetedUsers({
    message: `🎥 New Virtual Meeting: "${title}"`,
    link: '/meetings',
    branchId: effectiveBranchId || null,
    categoryIds: categoryIds,
    excludeUserId: myId
  })

  revalidatePath('/meetings')
}

export async function deleteMeeting(formData: FormData) {
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(roleName)
  
  if (!isAdmin) throw new Error("Unauthorized")

  const id = formData.get('id') as string
  await prisma.virtualMeeting.delete({ where: { id } })
  
  await logAdminAction(session?.user?.id || '', 'DELETE', 'MEETING', id, `Deleted meeting transmission ID: ${id}`)
  
  revalidatePath('/meetings')
}
