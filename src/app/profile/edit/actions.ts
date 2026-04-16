'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const firstName = (formData.get('firstName') as string)?.trim()
  const lastName = (formData.get('lastName') as string)?.trim()
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const mobileNumber = (formData.get('mobileNumber') as string)?.trim()
  const address = (formData.get('address') as string)?.trim()

  const requestedChanges = {
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(name && { name }),
    ...(email && { email }),
    ...(mobileNumber && { mobileNumber }),
    ...(address && { address }),
  }

  await prisma.profileUpdateRequest.create({
    data: {
      userId: session.user.id,
      changes: JSON.stringify(requestedChanges),
      status: 'PENDING',
    },
  })

  revalidatePath('/')
  revalidatePath('/directory')
  redirect('/settings')
}
