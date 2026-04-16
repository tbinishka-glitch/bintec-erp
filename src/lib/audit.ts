import { prisma } from './prisma'

export async function logAdminAction(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  details?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
      } as any
    })
  } catch (error) {
    console.error('[AuditLog Error]', error)
    // Don't throw - audit logging should not break the main operation
  }
}
