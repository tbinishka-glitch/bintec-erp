import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { CelebrationsClient } from '@/components/celebrations/CelebrationsClient'

async function addMilestone(formData: FormData) {
  'use server'
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  if (roleName !== 'Corporate Admin' && roleName !== 'Super Admin') redirect('/')

  const userId = (formData.get('userId') as string)?.trim()
  const type = (formData.get('type') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!userId || !type) throw new Error('User and milestone type are required.')

  await prisma.milestone.create({
    data: { userId, type, description: description || null }
  })

  await prisma.notification.create({
    data: {
      userId,
      message: `🏆 Congratulations! You have been recognized with a "${type}" milestone!`,
      link: '/celebrations'
    }
  })

  revalidatePath('/celebrations')
}

export default async function CelebrationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const roleName = (session.user as any)?.roleName
  const isAdmin = roleName === 'Corporate Admin' || roleName === 'Super Admin'

  const [milestones, staffList] = await Promise.all([
    prisma.milestone.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { user: { include: { branch: true } } }
    }),
    isAdmin ? prisma.user.findMany({ orderBy: { name: 'asc' } }) : Promise.resolve([])
  ])

  return (
    <CelebrationsClient
      milestones={milestones}
      staffList={staffList}
      isAdmin={isAdmin}
      addMilestoneAction={addMilestone}
    />
  )
}
