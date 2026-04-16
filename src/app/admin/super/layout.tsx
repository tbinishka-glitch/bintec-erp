import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReactNode } from 'react'

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: { select: { name: true } } },
  })
  if (me?.role?.name !== 'Super Admin') redirect('/admin')

  return <>{children}</>
}
