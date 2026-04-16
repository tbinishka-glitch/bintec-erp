import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = [
    { name: 'Academic', slug: 'academic' },
    { name: 'Academic Operations', slug: 'academic-operations' },
    { name: 'Operations', slug: 'operations' },
    { name: 'Facilities Management', slug: 'facilities-management' },
    { name: 'Security & Surveillance', slug: 'security-surveillance' },
    { name: 'Driver', slug: 'driver' },
    { name: 'Branch Leadership', slug: 'branch-leadership' },
    { name: 'Network Leadership', slug: 'network-leadership' },
    { name: 'Senior Leadership', slug: 'senior-leadership' },
    { name: 'Corporate Leadership', slug: 'corporate-leadership' }
  ]

  console.log('--- DEEP SYNC: UPSERTING CATEGORIES ---')
  for (const cat of categories) {
    await prisma.employeeCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { 
        name: cat.name, 
        slug: cat.slug, 
        description: `Strategic segment: ${cat.name}` 
      }
    })
  }

  return NextResponse.json({ success: true, count: categories.length })
}
