'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  })
  if (!['Super Admin', 'Corporate Admin'].includes(user?.role?.name ?? '')) {
    throw new Error('Unauthorized')
  }
}

export async function updateRolePermissions(formData: FormData) {
  await assertAdmin()
  const roleId = formData.get('roleId') as string
  const permissions = formData.get('permissions') as string

  await prisma.role.update({
    where: { id: roleId },
    data: { permissions },
  })

  revalidatePath('/admin/roles')
}
