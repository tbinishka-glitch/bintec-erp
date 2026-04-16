'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logAdminAction } from '@/lib/audit'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

async function assertIntranetAdmin() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  })
  
  const roleName = user?.role?.name ?? ''
  // Allow Super Admin, Corporate Admin, and Compliance Admin as per user instruction.
  // Note: IT Admin / Network Admin etc can be adjusted. We'll allow the main ones.
  if (!['Super Admin', 'Corporate Admin', 'Compliance Admin'].includes(roleName)) {
    throw new Error('Unauthorized Access to Intranet Admin Hub. Only Super, Corporate, or Compliance Admins are allowed.')
  }
  
  return { userId: session.user.id, roleName, organizationId: user?.organizationId || 'leeds' }
}

export async function uploadSopPolicy(formData: FormData) {
  const { userId, organizationId } = await assertIntranetAdmin()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const subCategory = formData.get('subCategory') as string
  const documentType = formData.get('documentType') as string || 'SOP'
  
  const effectiveDate = formData.get('effectiveDate') as string
  const reviewDate = formData.get('reviewDate') as string
  const expiryDate = formData.get('expiryDate') as string
  
  const versionNumber = formData.get('versionNumber') as string
  const issuedBy = formData.get('issuedBy') as string
  const file = formData.get('file') as File

  if (!file || !title || !category) {
    throw new Error('Missing required fields for SOP/Policy upload.')
  }

  // Handle local temporary upload
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sops')
  await fs.mkdir(uploadDir, { recursive: true })

  const uniqueId = uuidv4()
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const finalFilename = `${uniqueId}_${safeFilename}`
  const filePath = path.join(uploadDir, finalFilename)

  await fs.writeFile(filePath, buffer)
  const pdfUrl = `/uploads/sops/${finalFilename}`

  const newDoc = await prisma.article.create({
    data: {
      title,
      content: description || '',
      category,
      subCategory,
      documentType,
      pdfUrl,
      versionNumber,
      issuedBy,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
      reviewDate: reviewDate ? new Date(reviewDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      authorId: userId,
      organizationId,
      status: 'APPROVED', // Direct to approved for admins by default, or could be PENDING
      visibility: 'ALL'
    }
  })

  await logAdminAction(userId, 'PUBLISH', 'SOP', newDoc.id, `Uploaded SOP/Policy: ${title}`)
  
  revalidatePath('/admin/intranet')
  revalidatePath('/intranet')
  return { success: true }
}

export async function createCelebration(formData: FormData) {
  const { userId, organizationId } = await assertIntranetAdmin()
  
  const type = formData.get('type') as string
  const title = formData.get('title') as string
  const message = formData.get('message') as string
  const targetUserId = formData.get('userId') as string
  const branchId = formData.get('branchId') as string
  const isFeatured = formData.get('isFeatured') === 'on'
  const showAsPopup = formData.get('showAsPopup') === 'on'
  const priority = formData.get('priority') as string || 'NORMAL'
  const file = formData.get('imageFile') as File | null

  let imageUrl = formData.get('imageUrl') as string || null

  // Handle Image Upload if file exists
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'celebrations')
    await fs.mkdir(uploadDir, { recursive: true })

    const uniqueId = uuidv4()
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const finalFilename = `${uniqueId}_${safeFilename}`
    const filePath = path.join(uploadDir, finalFilename)

    await fs.writeFile(filePath, buffer)
    imageUrl = `/uploads/celebrations/${finalFilename}`
  }
  
  const newCelebration = await prisma.celebration.create({
    data: {
      type,
      title,
      message,
      imageUrl,
      userId: targetUserId || null,
      branchId: branchId || null,
      organizationId,
      publishDate: new Date(),
      isFeatured,
      showAsPopup,
      priority,
      status: 'APPROVED'
    }
  })
  
  await logAdminAction(userId, 'CREATE', 'CELEBRATION', newCelebration.id, `Created Celebration: ${title}`)
  revalidatePath('/admin/intranet')
  revalidatePath('/intranet')
  return { success: true }
}

export async function toggleIntranetSetting(settingKey: string, value: boolean) {
  const { userId, organizationId } = await assertIntranetAdmin()
  
  let settings = await prisma.intranetSetting.findUnique({
    where: { organizationId }
  })
  
  if (!settings) {
    settings = await prisma.intranetSetting.create({
      data: { organizationId }
    })
  }
  
  await prisma.intranetSetting.update({
    where: { organizationId },
    data: { [settingKey]: value }
  })
  
  revalidatePath('/admin/intranet')
  return { success: true }
}

export async function createAnnouncement(formData: FormData) {
  const { userId, organizationId } = await assertIntranetAdmin()
  
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const branchId = formData.get('branchId') as string
  const isPinned = formData.get('isPinned') === 'on'
  const popupDisplay = formData.get('popupDisplay') === 'on'
  const pushNotification = formData.get('pushNotification') === 'on'
  const priority = formData.get('priority') as string || 'NORMAL'
  
  const newAnnouncement = await prisma.announcement.create({
    data: {
      title,
      content,
      isPinned,
      popupDisplay,
      pushNotification,
      priority,
      authorId: userId,
      branchId: branchId || null,
      organizationId,
    }
  })
  
  await logAdminAction(userId, 'CREATE', 'ANNOUNCEMENT', newAnnouncement.id, `Created Announcement: ${title}`)
  revalidatePath('/admin/intranet')
  revalidatePath('/')
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  const { userId } = await assertIntranetAdmin()
  
  await prisma.announcement.delete({
    where: { id }
  })
  
  await logAdminAction(userId, 'DELETE', 'ANNOUNCEMENT', id, `Deleted Announcement ID: ${id}`)
  revalidatePath('/admin/intranet')
  revalidatePath('/')
  return { success: true }
}

export async function deleteArticle(id: string) {
  const { userId } = await assertIntranetAdmin()
  
  await prisma.article.delete({
    where: { id }
  })
  
  await logAdminAction(userId, 'DELETE', 'ARTICLE', id, `Deleted Article/SOP ID: ${id}`)
  revalidatePath('/admin/intranet')
  revalidatePath('/intranet')
  return { success: true }
}

export async function deleteCelebration(id: string) {
  const { userId } = await assertIntranetAdmin()
  
  await prisma.celebration.delete({
    where: { id }
  })
  
  await logAdminAction(userId, 'DELETE', 'CELEBRATION', id, `Deleted Celebration ID: ${id}`)
  revalidatePath('/admin/intranet')
  revalidatePath('/intranet')
  return { success: true }
}

export async function registerEntityToIntranet(entityId: string) {
  const { userId, organizationId, roleName } = await assertIntranetAdmin()
  
  // Find user by ENT- ID
  // Format is LIS-ENT-xxxxxxx as per user
  const targetUser = await prisma.user.findFirst({
    where: { 
      entityId,
      organizationId 
    },
    include: { role: true, branch: true }
  })

  if (!targetUser) {
    throw new Error(`Entity with ID ${entityId} not found in your organization.`)
  }

  // Branch isolation check: Branch Admins only see their branch
  if (roleName === 'Branch Admin') {
    const adminUser = await prisma.user.findUnique({ where: { id: userId } })
    if (targetUser.branchId !== adminUser?.branchId) {
      throw new Error('Unauthorized: You can only add entities from your own branch.')
    }
  }

  await prisma.user.update({
    where: { id: targetUser.id },
    data: { isInIntranet: true }
  })

  await logAdminAction(userId, 'UPDATE', 'USER_INTRANET', targetUser.id, `Registered Entity ${entityId} to Intranet Hub`)
  revalidatePath('/admin/intranet')
  return { success: true, name: targetUser.name }
}

export async function bulkRegisterEntitiesToIntranet(entityIds: string[]) {
  const { userId, organizationId, roleName } = await assertIntranetAdmin()
  const adminUser = await prisma.user.findUnique({ where: { id: userId } })

  const results = { success: 0, failed: 0, errors: [] as string[] }

  for (const eid of entityIds) {
    try {
      const targetUser = await prisma.user.findFirst({
        where: { entityId: eid, organizationId }
      })

      if (!targetUser) {
        results.failed++
        results.errors.push(`${eid}: Not found`)
        continue
      }

      if (roleName === 'Branch Admin' && targetUser.branchId !== adminUser?.branchId) {
        results.failed++
        results.errors.push(`${eid}: Outside branch range`)
        continue
      }

      await prisma.user.update({
        where: { id: targetUser.id },
        data: { isInIntranet: true }
      })
      results.success++
    } catch (e: any) {
      results.failed++
      results.errors.push(`${eid}: ${e.message}`)
    }
  }

  revalidatePath('/admin/intranet')
  return results
}

export async function getIntranetDashboardData() {
  const session = await auth()
  if (!session?.user?.id) return null
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true }
  })
  
  if (!user?.organizationId) return null
  const isAdmin = ['Super Admin', 'Corporate Admin', 'Compliance Admin'].includes(user.role?.name || '')
  const isBranchAdmin = user.role?.name === 'Branch Admin'
  
  // Scope queries by branch if not super admin
  const branchFilter = isBranchAdmin ? { branchId: user.branchId } : {}

  const [
    pendingArticles,
    totalSOPs,
    celebrations,
    settings,
    announcements,
    registeredEntities
  ] = await Promise.all([
    prisma.article.count({ where: { status: 'PENDING', organizationId: user.organizationId, ...branchFilter } }),
    prisma.article.count({ where: { documentType: { in: ['SOP', 'Policy'] }, organizationId: user.organizationId, ...branchFilter } }),
    prisma.celebration.findMany({ 
      where: { organizationId: user.organizationId, ...branchFilter },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true, image: true } } }
    }),
    prisma.intranetSetting.findUnique({ where: { organizationId: user.organizationId } }),
    prisma.announcement.findMany({
      where: { organizationId: user.organizationId, ...branchFilter },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.user.findMany({
      where: { isInIntranet: true, organizationId: user.organizationId, ...branchFilter },
      select: { id: true, name: true, entityId: true, dateOfBirth: true, joinedDate: true, image: true, branch: { select: { name: true } } }
    })
  ])
  
  return {
    pendingArticles,
    totalSOPs,
    celebrations,
    settings,
    announcements,
    registeredEntities
  }
}
