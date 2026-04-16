import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const hasAccess = await can('finance', 'view')
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const suppliers = await prisma.supplierProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: { companyName: 'asc' }
  })

  return NextResponse.json(suppliers)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hasAccess = await can('finance', 'create')
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { companyName, brNumber, category, paymentTerms, contactEmail, contactName } = body

    if (!companyName || !contactEmail) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // Suppliers are also Entities. We create a User entry + SupplierProfile.
    // In a real system, we'd check for existing entity.
    const newSupplier = await prisma.user.create({
      data: {
        name: contactName || companyName,
        email: contactEmail,
        isSupplier: true,
        // Default organization for now
        organizationId: 'leeds', 
        supplierProfile: {
          create: {
            companyName,
            brNumber,
            category,
            paymentTerms,
          }
        }
      }
    })

    return NextResponse.json({ success: true, supplierId: newSupplier.id })
  } catch (err: any) {
    console.error('[SupplierCreate]', err)
    return NextResponse.json({ error: 'Failed to register vendor.' }, { status: 500 })
  }
}
