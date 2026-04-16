'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createGroupChat(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const uiMemberIds = formData.getAll('members') as string[]
  const name = formData.get('name') as string

  if (!name || uiMemberIds.length === 0) throw new Error("Group needs a name and at least one member.")

  // ensure the creator is inside the group
  const memberIds = Array.from(new Set([...uiMemberIds, session.user.id]))

  const me = await prisma.user.findUnique({ where: { id: session.user.id } })
  const roleName = (session.user as any)?.roleName
  const isAdmin = roleName === 'Super Admin' || roleName === 'Corporate Admin'

  // Validate constraints
  if (!isAdmin) {
    const targets = await prisma.user.findMany({ where: { id: { in: memberIds } } })
    for (const t of targets) {
      if (t.branchId !== me?.branchId) {
        throw new Error(`Staff constraint breach: You can only create groups with members from your own branch. User ${t.name} is in a different branch.`)
      }
    }
  }

  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const iconUrl = formData.get('iconUrl') as string

  const group = await prisma.chatGroup.create({
    data: {
      name,
      type: 'GROUP',
      branchId: isAdmin ? null : me?.branchId,
      description,
      iconUrl,
      categoryId: categoryId || null,
      adminId: session.user.id,
      members: {
        create: memberIds.map(id => ({ userId: id }))
      }
    }
  })

  revalidatePath('/chat')
  redirect(`/chat/${group.id}`)
}

export async function createDirectMessage(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const targetId = formData.get('targetId') as string
  const initialMessage = formData.get('initialMessage') as string
  if (!targetId || targetId === session.user.id) throw new Error("Invalid target user")

  // Check if DM exists
  const existing = await prisma.chatGroup.findFirst({
    where: {
      type: 'DIRECT',
      members: {
        every: {
          userId: { in: [session.user.id, targetId] }
        }
      }
    }
  })

  let url = `/chat/${existing?.id}`
  if (!existing) {
    const group = await prisma.chatGroup.create({
      data: {
        name: null,
        type: 'DIRECT',
        members: {
          create: [{ userId: session.user.id }, { userId: targetId }]
        }
      }
    })
    url = `/chat/${group.id}`
  }

  revalidatePath('/chat')
  if (initialMessage) {
    url += `?initialMessage=${encodeURIComponent(initialMessage)}`
  }
  redirect(url)
}

export async function sendMessage(data: { 
  groupId: string, 
  content: string, 
  type?: string,
  fileUrl?: string,
  fileName?: string,
  fileSize?: number
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const { groupId, content, type = 'TEXT', fileUrl, fileName, fileSize } = data

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  })
  if (!membership) throw new Error("Not a member of this chat")

  const message = await prisma.message.create({
    data: {
      content,
      senderId: session.user.id,
      groupId,
      type,
      fileUrl,
      fileName,
      fileSize
    },
    include: {
      sender: {
        select: { id: true, name: true, image: true }
      }
    }
  })

  revalidatePath(`/chat/${groupId}`)
  return message
}

export async function deleteMessage(messageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { group: { include: { members: true } } }
  })

  if (!message) throw new Error("Message not found")
  
  const roleName = (session.user as any)?.roleName
  const isSender = message.senderId === session.user.id
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(roleName)

  // Only sender or admin can delete
  if (!isSender && !isAdmin) throw new Error("Permission denied")

  await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById: session.user.id
    }
  })

  // Log administrative deletion
  if (!isSender && isAdmin) {
    await logAdminAction(
      session.user.id, 
      'DELETE', 
      'CHAT_MESSAGE', 
      messageId, 
      `Administrative deletion of message by ${session.user.name}`
    )
  }

  revalidatePath(`/chat/${message.groupId}`)
}

export async function deleteChatGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const group = await prisma.chatGroup.findUnique({
    where: { id: groupId },
    include: { members: true }
  })

  if (!group) throw new Error("Chat not found")

  const roleName = (session.user as any)?.roleName
  const isAdminRole = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(roleName)
  const isGroupAdmin = group.adminId === session.user.id
  const isDirect = group.type === 'DIRECT'

  // For DMs, either user can delete. For Groups, only Admin or Role Admin.
  if (!isDirect && !isGroupAdmin && !isAdminRole) {
    throw new Error("Only group admins or platform admins can delete this chat")
  }

  await prisma.chatGroup.delete({
    where: { id: groupId }
  })

  // Audit trail
  await logAdminAction(
    session.user.id, 
    'DELETE', 
    'CHAT_GROUP', 
    groupId, 
    `Deleted ${isDirect ? 'Direct Transmission' : 'Group Hub'}: ${group.name || 'Private DM'}`
  )

  revalidatePath('/chat')
  return { success: true }
}

export async function forwardMessages(messageIds: string[], targetGroupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const messages = await prisma.message.findMany({
    where: { id: { in: messageIds } },
    orderBy: { createdAt: 'asc' }
  })

  if (messages.length === 0) return

  const forwardedMessages = await Promise.all(messages.map(m => {
    return prisma.message.create({
      data: {
        content: m.content,
        type: m.type,
        fileUrl: m.fileUrl,
        fileName: m.fileName,
        fileSize: m.fileSize,
        senderId: session.user.id,
        groupId: targetGroupId
      },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      }
    })
  }))

  revalidatePath(`/chat/${targetGroupId}`)
  return forwardedMessages
}

export async function getChatCategories() {
  return await prisma.chatGroupCategory.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function markAsRead(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.groupMember.update({
    where: { userId_groupId: { userId: session.user.id, groupId } },
    data: { lastReadAt: new Date() }
  })
}
