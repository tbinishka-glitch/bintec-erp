'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from '@/lib/createNotification'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } })
  if (!['Super Admin', 'Corporate Admin'].includes(user?.role?.name ?? '')) redirect('/')
}

export async function approveProfileRequest(id: string) {
  await checkAdmin()
  const req = await prisma.profileUpdateRequest.findUnique({ 
    where: { id }, 
    include: { user: true } 
  })
  if (!req || req.status !== 'PENDING') return

  const changes = JSON.parse(req.changes)
  
  // 1. Check for email collision if email is being changed
  if (changes.email && changes.email !== req.user.email) {
    const existing = await prisma.user.findUnique({
      where: { email: changes.email }
    })
    if (existing) {
      throw new Error(`Email address "${changes.email}" is already in use by another staff member.`)
    }
  }

  // 2. Apply changes
  await prisma.user.update({
    where: { id: req.userId },
    data: changes,
  })

  // 3. Update request status
  await prisma.profileUpdateRequest.update({
    where: { id },
    data: { status: 'APPROVED' },
  })

  // 4. Notify user
  await createNotification({
    userIds: [req.userId],
    message: '✅ Your profile update request has been approved.',
    link: '/profile',
  })

  revalidatePath('/admin/approvals')
  revalidatePath('/admin')
  revalidatePath('/directory')
  revalidatePath(`/directory/${req.userId}`)
}

export async function rejectProfileRequest(id: string) {
  await checkAdmin()
  const req = await prisma.profileUpdateRequest.findUnique({ where: { id } })
  if (!req || req.status !== 'PENDING') return

  await prisma.profileUpdateRequest.update({
    where: { id },
    data: { status: 'REJECTED' },
  })

  await createNotification({
    userIds: [req.userId],
    message: '❌ Your profile update request was not approved. Please contact HR.',
    link: '/profile/edit',
  })

  revalidatePath('/admin/approvals')
  revalidatePath('/admin')
}
