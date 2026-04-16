import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ChatWindow } from './ChatWindow'

export default async function ChatConversationPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const group = await prisma.chatGroup.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: true } },
      messages: { orderBy: { createdAt: 'asc' }, include: { sender: true } }
    }
  })

  if (!group) redirect('/chat')

  // Enforce security
  const isMember = group.members.some(m => m.userId === session.user?.id)
  if (!isMember) redirect('/chat')

  const isDirect = group.type === 'DIRECT'
  const peer = isDirect ? group.members.find(m => m.userId !== session.user?.id)?.user : null
  const title = isDirect ? (peer?.name || 'Unknown Staff') : group.name

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      id: true, 
      name: true, 
      image: true,
      role: { select: { name: true } }
    }
  })

  // Fetch all other groups for forwarding
  const allGroups = await prisma.chatGroup.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { members: { include: { user: true } } },
    orderBy: { updatedAt: 'desc' }
  })

  const avatarUrl = isDirect ? peer?.image : group.iconUrl

  return (
    <ChatWindow 
      title={title || ''} 
      avatarUrl={avatarUrl}
      messages={group.messages} 
      currentUserId={session.user.id} 
      groupId={group.id} 
      currentUser={currentUser}
      allGroups={allGroups}
    />
  )
}
