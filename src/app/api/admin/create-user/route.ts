import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true }
  })

  const callerRole = currentUser?.role?.name
  if (!callerRole || !['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(callerRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const {
      firstName, lastName, name, email, password,
      roleId, branchId, employeeCategoryId, staffId, epfNo,
      isEmployee, isParent, isStudent, isSupplier
    } = body

    if (!firstName || !lastName || !name || !email || !password) {
      return NextResponse.json({ error: 'Missing required basics.' }, { status: 400 })
    }

    // Role Enforcement (Per User Instruction: Admin roles for Employees Only)
    let finalRoleId = roleId || null
    if (finalRoleId) {
      const targetRole = await prisma.role.findUnique({ where: { id: finalRoleId } })
      if (!isEmployee && targetRole?.name !== 'User') {
        return NextResponse.json({ error: 'Administrative roles can only be assigned to Employees.' }, { status: 403 })
      }
      
      if (targetRole?.name === 'Super Admin' && callerRole !== 'Super Admin') {
        return NextResponse.json({ 
          error: 'You have no permission to create Super Admins.',
          code: 'NO_PERMISSION_SUPER_ADMIN'
        }, { status: 403 })
      }
    }

    // Check for duplicate entity (Email / NIC / Staff ID)
    const existing = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { email },
          { staffId: staffId || undefined }
        ]
      } 
    })
    
    if (existing) {
      return NextResponse.json({ error: 'An entity with this identifier already exists in the Registry.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: {
        firstName, lastName, name, email,
        password: hashed,
        roleId: finalRoleId,
        branchId: branchId || null,
        employeeCategoryId: employeeCategoryId || null,
        staffId: staffId || null,
        epfNo: epfNo || null,
        isEmployee: !!isEmployee,
        isParent: !!isParent,
        isStudent: !!isStudent,
        isSupplier: !!isSupplier,
      }
    })

    revalidatePath('/admin/users')
    revalidatePath('/directory')

    return NextResponse.json({ userId: newUser.id, success: true })
  } catch (err: any) {
    console.error('[CreateUser]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
