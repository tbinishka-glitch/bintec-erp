import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ChatSidebar } from './ChatSidebar'

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const myId = session.user.id
  const roleName = (session.user as any)?.roleName
  const isAdmin = roleName === 'Corporate Admin' || roleName === 'Super Admin'
  const myBranch = (session.user as any)?.branchId

  const categories = await prisma.chatGroupCategory.findMany({
    orderBy: { name: 'asc' }
  })

  const groupsRaw = await prisma.chatGroup.findMany({
    where: { members: { some: { userId: myId } } },
    include: { 
      members: { 
        include: { 
          user: { select: { id: true, name: true, image: true, email: true } } 
        } 
      },
      messages: { 
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' }, 
        take: 1 
      },
      category: true,
      _count: {
        select: { messages: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  // To get a real unread count, we can't easily do it in one prisma query with fields from members
  // So we'll fetch them separately or just pass lastReadAt to client
  const groups = await Promise.all(groupsRaw.map(async (g) => {
    const myMembership = g.members.find(m => m.userId === myId)
    const unreadCount = await prisma.message.count({
      where: {
        groupId: g.id,
        createdAt: { gt: myMembership?.lastReadAt || new Date(0) },
        senderId: { not: myId },
        isDeleted: false
      }
    })
    return { ...g, unreadCount }
  }))

  const availableUsers = await prisma.user.findMany({
    where: isAdmin ? undefined : { branchId: myBranch },
    orderBy: { firstName: 'asc' }
  })

  return (
    <div className="flex h-screen bg-background pt-0 md:pt-4 pb-16 md:pb-4 px-0 md:px-4 gap-4">
      <div className="w-full md:w-80 lg:w-96 bg-card border border-border shadow-sm flex flex-col md:rounded-2xl overflow-hidden shrink-0">
        <ChatSidebar 
          groups={groups} 
          availableUsers={availableUsers} 
          currentUserId={myId} 
          categories={categories}
        />
      </div>
      <div className="flex-1 bg-card border border-border shadow-sm flex flex-col md:rounded-2xl overflow-hidden relative hidden md:flex">
        {children}
      </div>
    </div>
  )
}
