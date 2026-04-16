'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { notifyTargetedUsers } from '@/lib/createNotification'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { logAdminAction } from '@/lib/audit'

// Helper to save files locally
async function saveFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
  const savePath = join(process.cwd(), 'public', 'uploads', folder, filename)
  await writeFile(savePath, buffer)
  return `/uploads/${folder}/${filename}`
}

function normalizeVisibility(v: string) {
  if (v === 'Academic Staff Only') return 'ACADEMIC'
  if (v === 'Operations Staff Only') return 'OPERATIONS'
  return v
}

// Helper to split content into parts (max 250 words)
function splitContent(content: string, maxWords: number = 250): string[] {
  const words = content.split(/\s+/)
  if (words.length <= maxWords) return [content]

  const parts: string[] = []
  let currentPart: string[] = []

  for (const word of words) {
    currentPart.push(word)
    if (currentPart.length >= maxWords) {
      parts.push(currentPart.join(' '))
      currentPart = []
    }
  }
  if (currentPart.length > 0) parts.push(currentPart.join(' '))
  return parts
}

export async function createArticle(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const documentType = formData.get('documentType') as string
  const branchId = formData.get('branchId') as string || null
  const targetCategoryIds = formData.getAll('targetCategoryIds') as string[]
  const tags = formData.get('tags') as string
  
  const imageFile = formData.get('image') as File | null
  const pdfFile = formData.get('pdf') as File | null

  // Validation
  if (!title?.trim() || !content?.trim() || !documentType) {
    throw new Error('Title, content, and type are mandatory.')
  }

  // Word count check
  const wordCount = content.trim().split(/\s+/).length
  const isMultipartEnabled = wordCount > 250

  // File Uploads
  let imageUrl = null
  if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
    imageUrl = await saveFile(imageFile, 'knowledge')
  }

  let pdfUrl = null
  if (pdfFile && pdfFile.size > 0 && pdfFile.name !== 'undefined') {
    pdfUrl = await saveFile(pdfFile, 'knowledge')
  }

  const roleName = (session.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin'].includes(roleName)
  const status = isAdmin ? 'APPROVED' : 'PENDING'

  // Processing Parts
  const contentParts = isMultipartEnabled ? splitContent(content, 250) : [content]
  let parentArticleId: string | null = null

  for (let i = 0; i < contentParts.length; i++) {
    const partNum = i + 1
    const partTitle = contentParts.length > 1 ? `${title} - Part ${partNum}` : title
    
    const article = await prisma.article.create({
      data: {
        title: partTitle,
        content: contentParts[i],
        category: documentType,
        documentType,
        branchId,
        imageUrl,
        pdfUrl,
        isMultipart: contentParts.length > 1,
        partNumber: partNum,
        parentId: parentArticleId,
        status,
        tags: tags?.trim() || null,
        authorId: session.user.id,
        targetCategories: targetCategoryIds.length > 0 ? {
          connect: targetCategoryIds.map(id => ({ id }))
        } : undefined
      }
    })

    if (i === 0) {
      parentArticleId = article.id
      // Log only the parent (or the single article)
      await logAdminAction(
        session.user.id, 
        'CREATE', 
        'ARTICLE', 
        article.id, 
        `Drafted article: ${title} (Status: ${status})`
      )
    }
  }

  if (status === 'APPROVED') {
    await notifyTargetedUsers({
      message: `📚 New ${documentType}: "${title}"`,
      link: '/knowledge',
      branchId,
      categoryIds: targetCategoryIds,
      excludeUserId: session.user.id
    })
  }

  revalidatePath('/knowledge')
  revalidatePath('/')
  redirect('/knowledge')
}

export async function updateArticleStatus(id: string, status: 'APPROVED' | 'REJECTED') {
  const session = await auth()
  const roleName = (session.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin'].includes(roleName)

  if (!isAdmin) throw new Error('Not authorized')

  const article = await prisma.article.update({
    where: { id },
    data: { status },
    include: { targetCategories: true }
  })

  await logAdminAction(session.user.id, 'STATUS_UPDATE', 'ARTICLE', id, `Changed article status to ${status}`)

  if (status === 'APPROVED') {
    await notifyTargetedUsers({
      message: `📚 Document Approved: "${article.title}"`,
      link: '/knowledge',
      branchId: article.branchId,
      categoryIds: article.targetCategories.map(c => c.id),
      excludeUserId: session.user.id
    })
  }

  revalidatePath('/knowledge')
  revalidatePath('/')
  return { success: true }
}

export async function addComment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const articleId = formData.get('articleId') as string
  const content = formData.get('content') as string

  if (!content?.trim()) throw new Error('Comment cannot be empty')

  await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      entityId: articleId,
      entityType: 'ARTICLE'
    }
  })

  revalidatePath('/knowledge')
  revalidatePath('/')
}

export async function updateArticle(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const documentType = formData.get('documentType') as string
  const branchId = formData.get('branchId') as string || null
  const targetCategoryIds = formData.getAll('targetCategoryIds') as string[]
  const tags = formData.get('tags') as string
  
  const imageFile = formData.get('image') as File | null
  const pdfFile = formData.get('pdf') as File | null

  if (!id || !title || !content) throw new Error('Missing required fields')

  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) throw new Error('Article not found')

  const roleName = (session.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(roleName)
  if (!isAdmin && existing.authorId !== session.user.id) throw new Error('Unauthorized')

  let imageUrl = existing.imageUrl
  if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
    imageUrl = await saveFile(imageFile, 'knowledge')
  }

  let pdfUrl = existing.pdfUrl
  if (pdfFile && pdfFile.size > 0 && pdfFile.name !== 'undefined') {
    pdfUrl = await saveFile(pdfFile, 'knowledge')
  }

  await prisma.article.update({
    where: { id },
    data: {
      title,
      content,
      documentType,
      category: documentType,
      branchId,
      imageUrl,
      pdfUrl,
      tags: tags?.trim() || null,
      targetCategories: {
        set: targetCategoryIds.map(id => ({ id }))
      }
    }
  })

  await logAdminAction(session.user.id, 'UPDATE', 'ARTICLE', id, `Updated article: ${title}`)

  revalidatePath('/knowledge')
  revalidatePath(`/intranet/knowledge/${id}`)
  revalidatePath('/admin/knowledge-manager')
  revalidatePath('/')
}
