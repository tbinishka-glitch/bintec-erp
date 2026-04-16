import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, ExternalLink, Plus } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function addResource(formData: FormData) {
  'use server'
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  if (roleName !== 'Corporate Admin' && roleName !== 'Super Admin') redirect('/')

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const link = (formData.get('link') as string)?.trim()
  const category = (formData.get('category') as string)?.trim()

  if (!title || !category) throw new Error('Title and category are required.')

  await prisma.welfareResource.create({
    data: { title, description: description || null, link: link || null, category }
  })

  revalidatePath('/welfare')
}

const CATEGORY_COLORS: Record<string, string> = {
  'Health': 'bg-red-100 text-red-700',
  'Leave': 'bg-blue-100 text-blue-700',
  'Finance': 'bg-green-100 text-green-700',
  'Mental Wellness': 'bg-purple-100 text-purple-700',
  'Safety': 'bg-orange-100 text-orange-700',
  'Benefits': 'bg-teal-100 text-teal-700',
}

import { WelfareClient } from '@/components/welfare/WelfareClient'

export default async function WelfarePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const roleName = (session.user as any)?.roleName
  const isAdmin = roleName === 'Corporate Admin' || roleName === 'Super Admin'

  const resources = await prisma.welfareResource.findMany({ orderBy: { createdAt: 'desc' } })
  const categories = [...new Set(resources.map(r => r.category))]

  return (
    <div className="min-h-screen bg-white pt-8">
      <WelfareClient 
        className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-50 flex flex-col gap-6 group hover:shadow-premium hover:border-primary/5 transition-all"
        resources={resources}
        categories={categories}
        isAdmin={isAdmin}
        addResourceAction={addResource}
      />
    </div>
  )
}
