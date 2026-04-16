import { prisma } from './prisma'

export async function createNotification({
  userIds,
  message,
  link,
}: {
  userIds: string[]
  message: string
  link?: string
}) {
  if (!userIds.length) return
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, message, link: link ?? null })),
  })
}

export async function notifyTargetedUsers({
  message,
  link,
  branchId,
  categoryIds,
  excludeUserId
}: {
  message: string,
  link?: string,
  branchId?: string | null,
  categoryIds?: string[],
  excludeUserId?: string
}) {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        excludeUserId ? { id: { not: excludeUserId } } : {},
        branchId ? { branchId } : {},
        categoryIds && categoryIds.length > 0 ? { employeeCategoryId: { in: categoryIds } } : {}
      ]
    },
    select: { id: true }
  })

  if (users.length > 0) {
    await createNotification({ userIds: users.map(u => u.id), message, link })
  }
}

export async function notifyAllUsers(message: string, link?: string, excludeUserId?: string) {
  await notifyTargetedUsers({ message, link, excludeUserId })
}
