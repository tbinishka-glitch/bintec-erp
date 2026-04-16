import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function getUnreadCount(): Promise<number> {
  const session = await auth()
  if (!session?.user?.id) return 0
  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  })
}
