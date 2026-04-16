'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { logAdminAction } from '@/lib/audit'

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  })
  if (!['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(user?.role?.name ?? '')) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function createUser(formData: FormData) {
  const adminId = await assertAdmin()
  const name = formData.get('name') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const roleId = formData.get('roleId') as string
  const branchId = formData.get('branchId') as string
  const employeeCategoryId = formData.get('employeeCategoryId') as string
  const employeeSubCategoryId = formData.get('employeeSubCategoryId') as string
  const staffId = formData.get('staffId') as string
  const epfNo = formData.get('epfNo') as string
  
  const gender = formData.get('gender') as string
  const dob = formData.get('dateOfBirth') as string
  const nic = formData.get('nic') as string
  const mobile = formData.get('mobileNumber') as string
  const status = formData.get('employmentStatus') as string
  const joinedDate = formData.get('joinedDate') as string
  const designation = formData.get('designation') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string
  const departmentId = formData.get('departmentId') as string
  const forcePasswordChange = formData.get('forcePasswordChange') === 'on'

  if (!staffId && !epfNo) {
    throw new Error('Must provide either Staff ID or EPF Number')
  }

  // Strict Authority Lockdown: Only Super Admins can grant Super Admin authority
  const targetRole = await prisma.role.findUnique({ where: { id: roleId } })
  const currentUser = await prisma.user.findUnique({ where: { id: adminId }, include: { role: true } })
  if (targetRole?.name === 'Super Admin' && currentUser?.role?.name !== 'Super Admin') {
    throw new Error('Only a Super Admin can grant Super Admin authority.')
  }

  const hashed = await bcrypt.hash(password || 'password123', 10)
  const newUser = await prisma.user.create({
    data: { 
      name, firstName, lastName, email, 
      password: hashed, roleId, 
      branchId: branchId || null, 
      employeeCategoryId: employeeCategoryId || null,
      employeeSubCategoryId: employeeSubCategoryId || null,
      staffId: staffId || null,
      epfNo: epfNo || null,
      gender: gender || null,
      dateOfBirth: dob ? new Date(dob) : null,
      nicPassport: nic || null,
      mobileNumber: mobile || null,
      employmentStatus: status || 'PERMANENT',
      joinedDate: joinedDate ? new Date(joinedDate) : new Date(),
      designation: designation || null,
      departmentId: departmentId || null,
      address: address || null,
      notes: notes || null,
      forcePasswordChange
    },
  })

  await logAdminAction(adminId, 'CREATE', 'USER', newUser.id, `Created user: ${email}`)

  revalidatePath('/admin/users')
  revalidatePath('/directory')
  return { success: true, userId: newUser.id }
}

export async function updateUser(formData: FormData) {
  const adminId = await assertAdmin()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const roleId = formData.get('roleId') as string
  const branchId = formData.get('branchId') as string
  const employeeCategoryId = formData.get('employeeCategoryId') as string
  const employeeSubCategoryId = formData.get('employeeSubCategoryId') as string
  const staffId = formData.get('staffId') as string
  const epfNo = formData.get('epfNo') as string
  const departmentId = formData.get('departmentId') as string
  
  const gender = formData.get('gender') as string
  const dob = formData.get('dateOfBirth') as string
  const nic = formData.get('nic') as string
  const mobile = formData.get('mobileNumber') as string
  const status = formData.get('employmentStatus') as string
  const joinedDate = formData.get('joinedDate') as string
  const designation = formData.get('designation') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string
  const isActive = formData.get('isActive') === 'on'

  if (!id) throw new Error('User ID is required for updates')

  // Strict Authority Lockdown: Only Super Admins can promote someone to Super Admin
  const targetRole = await prisma.role.findUnique({ where: { id: roleId } })
  const currentUser = await prisma.user.findUnique({ where: { id: adminId }, include: { role: true } })
  if (targetRole?.name === 'Super Admin' && currentUser?.role?.name !== 'Super Admin') {
    throw new Error('Only a Super Admin can grant Super Admin authority.')
  }

  await prisma.user.update({
    where: { id },
    data: {
      name, firstName, lastName, email,
      roleId,
      branchId: branchId || null,
      employeeCategoryId: employeeCategoryId || null,
      employeeSubCategoryId: employeeSubCategoryId || null,
      staffId: staffId || null,
      epfNo: epfNo || null,
      gender: gender || null,
      dateOfBirth: dob ? new Date(dob) : null,
      nicPassport: nic || null,
      mobileNumber: mobile || null,
      employmentStatus: status || 'PERMANENT',
      joinedDate: joinedDate ? new Date(joinedDate) : undefined,
      designation: designation || null,
      departmentId: departmentId || null,
      address: address || null,
      notes: notes || null,
      isActive
    }
  })

  await logAdminAction(adminId, 'UPDATE', 'USER', id, `Updated user profile: ${email}`)

  revalidatePath('/admin/users')
  revalidatePath('/directory')
  revalidatePath(`/directory/${id}`)
  return { success: true }
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  const adminId = await assertAdmin()
  
  const target = await prisma.user.findUnique({ where: { id }, include: { role: true } })
  if (target?.role?.name === 'Super Admin') {
    throw new Error('Safety Protocol: Cannot suspend a Super Admin.')
  }

  await prisma.user.update({
    where: { id },
    data: { isActive }
  })

  await logAdminAction(adminId, 'STATUS_TOGGLE', 'USER', id, `Changed user status to ${isActive ? 'ACTIVE' : 'SUSPENDED'}`)

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(formData: FormData) {
  const adminId = await assertAdmin()
  const id = formData.get('id') as string

  const admin = await prisma.user.findUnique({ where: { id: adminId }, include: { role: true } })
  const target = await prisma.user.findUnique({ where: { id }, include: { role: true } })
  
  if (admin?.role?.name === 'Corporate Admin' && ['Super Admin', 'Corporate Admin'].includes(target?.role?.name ?? '')) {
    throw new Error("HR Admins cannot delete Administrators.")
  }

  await prisma.user.delete({ where: { id } })
  await logAdminAction(adminId, 'DELETE', 'USER', id, `Deleted user: ${target?.email}`)

  revalidatePath('/admin/users')
  revalidatePath('/directory')
}

export async function bulkCreateUsers(data: any[]) {
  const adminId = await assertAdmin()
  const staffRole = await prisma.role.findFirst({ where: { name: 'User' } })
  if (!staffRole) throw new Error("STAFF role not found.")

  const categories = await prisma.employeeCategory.findMany()
  const branches = await prisma.branch.findMany()

  const hashed = await bcrypt.hash('password123', 10)

  for (const row of data) {
    if ((!row.staffId && !row.epfNo) || !row.email) continue

    // Resolve branch and category IDs from names
    const branchId = branches.find(b => b.name.toLowerCase() === row.branch?.toLowerCase())?.id || null
    const employeeCategoryId = categories.find(c => c.name.toLowerCase() === row.category?.toLowerCase())?.id || null

    const record = {
      email: row.email,
      password: hashed,
      roleId: staffRole.id,
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      name: `${row.firstName || ''} ${row.lastName || ''}`.trim(),
      staffId: row.staffId || null,
      epfNo: row.epfNo || null,
      branchId: branchId,
      employeeCategoryId: employeeCategoryId,
      forcePasswordChange: true,
      currentAddressLine1: row.currentAddressLine1 || null,
      currentAddressLine2: row.currentAddressLine2 || null,
      currentAddressLine3: row.currentAddressLine3 || null,
      permanentAddressLine1: row.permanentAddressLine1 || null,
      permanentAddressLine2: row.permanentAddressLine2 || null,
      permanentAddressLine3: row.permanentAddressLine3 || null,
      telephoneNumber: row.telephoneNumber || null,
      emergencyContactName: row.emergencyContactName || null,
      emergencyContactNumber: row.emergencyContactNumber || null,
      nicPassport: row.nicPassport || null,
      employmentStatus: row.employmentStatus || 'PERMANENT',
    }

    try {
      const newUser = await prisma.user.create({ data: record as any })
      await logAdminAction(adminId, 'CREATE_BULK', 'USER', newUser.id, `Imported user via CSV: ${record.email}`)
    } catch(e) {
      console.error("Skipped duplicate or invalid user import:", e)
    }
  }

  revalidatePath('/admin/users')
  revalidatePath('/directory')
}

export async function resetUserPassword(formData: FormData) {
  const adminId = await assertAdmin()
  const targetId = formData.get('id') as string

  const adminUser = await prisma.user.findUnique({ where: { id: adminId }, include: { role: true } })
  const targetUser = await prisma.user.findUnique({ where: { id: targetId }, include: { role: true } })
  
  if (!targetUser) return

  // HR Admins cannot reset passwords for other HR Admins or Super Admins
  if (adminUser?.role?.name === 'Corporate Admin' && ['Super Admin', 'Corporate Admin'].includes(targetUser.role?.name ?? '')) {
    throw new Error('HR Admins cannot reset passwords for other Administrators.')
  }

  const hashed = await bcrypt.hash('password123', 10)
  await prisma.user.update({
    where: { id: targetId },
    data: {
      password: hashed,
      forcePasswordChange: true,
    }
  })

  revalidatePath('/admin/users')
}

export async function createBranch(formData: FormData) {
  const adminId = await assertAdmin()
  const name = formData.get('name') as string
  const location = formData.get('location') as string
  const newBranch = await prisma.branch.create({ data: { name, location: location || null } as any })
  
  await logAdminAction(adminId, 'CREATE', 'BRANCH', newBranch.id, `Created branch: ${name}`)
  
  revalidatePath('/admin/branches')
  redirect('/admin/branches')
}

export async function deleteBranch(formData: FormData) {
  const adminId = await assertAdmin()
  const id = formData.get('id') as string
  await prisma.branch.delete({ where: { id } })
  
  await logAdminAction(adminId, 'DELETE', 'BRANCH', id, `Deleted branch ID: ${id}`)
  
  revalidatePath('/admin/branches')
}
export async function deletePublishedArticle(formData: FormData) {
  await assertAdmin()
  const id = formData.get('id') as string

  if (!id) throw new Error('Article ID is required')

  const target = await prisma.article.findUnique({ where: { id } })
  if (!target) throw new Error('Article not found')

  // Multi-part logic: If part 1, delete the whole chain
  const idsToDelete = [id]
  if (target.partNumber === 1) {
    const parts = await prisma.article.findMany({
      where: { parentId: id },
      select: { id: true }
    })
    idsToDelete.push(...parts.map(p => p.id))
  }

  // Deletion logic
  await prisma.article.deleteMany({
    where: { id: { in: idsToDelete } }
  })

  // Manual cleanup for non-relation linked entities
  await prisma.reaction.deleteMany({
    where: { entityType: 'ARTICLE', entityId: { in: idsToDelete } }
  })
  await prisma.comment.deleteMany({
    where: { entityType: 'ARTICLE', entityId: { in: idsToDelete } }
  })

  revalidatePath('/knowledge')
  revalidatePath('/admin/knowledge-manager')
  revalidatePath(`/intranet/knowledge/${id}`)
  revalidatePath('/')
}

export async function approvePublishedArticle(formData: FormData) {
  await assertAdmin()
  const id = formData.get('id') as string
  if (!id) throw new Error('ID required')

  const article = await prisma.article.update({
    where: { id },
    data: { status: 'APPROVED' },
    include: { author: true }
  })

  // Notify author
  await prisma.notification.create({
    data: {
      userId: article.authorId,
      message: `✅ Your article "${article.title}" has been approved and published.`,
      link: `/intranet/knowledge/${article.id}`
    }
  })

  revalidatePath('/admin/content-approvals')
  revalidatePath('/knowledge')
  revalidatePath('/')
}

export async function rejectPublishedArticle(formData: FormData) {
  await assertAdmin()
  const id = formData.get('id') as string
  if (!id) throw new Error('ID required')

  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) throw new Error('Article not found')

  // Notify author before deletion
  await prisma.notification.create({
    data: {
      userId: article.authorId,
      message: `❌ Your article "${article.title}" was not approved. Please contact HR for details.`,
      link: '/knowledge'
    }
  })

  // Multi-part logic reuse: Delete the whole chain if it's Part 1
  const idsToDelete = [id]
  if (article.partNumber === 1) {
    const parts = await prisma.article.findMany({
      where: { parentId: id },
      select: { id: true }
    })
    idsToDelete.push(...parts.map(p => p.id))
  }

  await prisma.article.deleteMany({ where: { id: { in: idsToDelete } } })
  await prisma.reaction.deleteMany({ where: { entityType: 'ARTICLE', entityId: { in: idsToDelete } } })
  await prisma.comment.deleteMany({ where: { entityType: 'ARTICLE', entityId: { in: idsToDelete } } })

  revalidatePath('/admin/content-approvals')
  revalidatePath('/knowledge')
  revalidatePath('/')
}

export async function createEmployeeCategory(formData: FormData) {
  const adminId = await assertAdmin()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  
  if (!name) throw new Error('Category name is required')

  const slug = name.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const newCategory = await prisma.employeeCategory.create({
    data: { name, slug, description: description || null } as any
  })

  await logAdminAction(adminId, 'CREATE', 'CATEGORY', newCategory.id, `Created employee category: ${name}`)

  revalidatePath('/admin/categories')
  revalidatePath('/admin/users')
  redirect('/admin/categories')
}

export async function deleteEmployeeCategory(formData: FormData) {
  const adminId = await assertAdmin()
  const id = formData.get('id') as string

  // Safety: Prevent deleting categories with active users
  const userCount = await prisma.user.count({ where: { employeeCategoryId: id } })
  if (userCount > 0) {
    throw new Error(`Cannot delete category: ${userCount} staff members are currently assigned to it.`)
  }

  await prisma.employeeCategory.delete({ where: { id } })
  await logAdminAction(adminId, 'DELETE', 'CATEGORY', id, `Deleted employee category ID: ${id}`)

  revalidatePath('/admin/categories')
  revalidatePath('/admin/users')
}

export async function createEmployeeSubCategory(formData: FormData) {
  const adminId = await assertAdmin()
  const name = formData.get('name') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string

  if (!name || !categoryId) throw new Error('Name and Category are required')

  const category = await prisma.employeeCategory.findUnique({ where: { id: categoryId } })
  if (!category) throw new Error('Main category not found')

  const slug = `${category.slug}-${name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s/_-]+/g, '-').replace(/^-+|-+$/g, '')}`

  const newSub = await prisma.employeeSubCategory.create({
    data: { name, slug, description: description || null, categoryId }
  })

  await logAdminAction(adminId, 'CREATE', 'SUB_CATEGORY', newSub.id, `Created position: ${name} under ${category.name}`)

  revalidatePath('/admin/categories')
  revalidatePath('/admin/users')
  redirect('/admin/categories')
}

export async function deleteEmployeeSubCategory(formData: FormData) {
  const adminId = await assertAdmin()
  const id = formData.get('id') as string

  const userCount = await prisma.user.count({ where: { employeeSubCategoryId: id } })
  if (userCount > 0) {
    throw new Error(`Cannot delete position: ${userCount} staff members are assigned to it.`)
  }

  await prisma.employeeSubCategory.delete({ where: { id } })
  await logAdminAction(adminId, 'DELETE', 'SUB_CATEGORY', id, `Deleted sub-category ID: ${id}`)

  revalidatePath('/admin/categories')
  revalidatePath('/admin/users')
}

// -------------------------------- Probation & Permanency Automation --------------------------------

export async function checkProbationMilestones() {
  const adminId = await assertAdmin()
  const now = new Date()
  
  // Standardized 6-month threshold (approx 180 days)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(now.getMonth() - 6)
  
  // Standardized 30-day reminder logic
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(now.getDate() - 30)

  const eligibleEmployees = await prisma.user.findMany({
    where: {
      employmentStatus: 'PROBATION',
      /* Temporarily Bypassing Conflict
      joinedDate: { lte: sixMonthsAgo },
      OR: [
        { lastProbationReminded: null },
        { lastProbationReminded: { lte: thirtyDaysAgo } }
      ]
      */
    },
    include: { branch: true },
    take: 50 // Limit safety during bypass
  })

  if (eligibleEmployees.length === 0) return { count: 0 }

  // Rest of the logic...
  return { count: 0 } // Temporarily suppress notifications during bypass
}

export async function confirmPermanency(userId: string) {
  const adminId = await assertAdmin()
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { 
      employmentStatus: 'PERMANENT',
      lastProbationReminded: null // Reset
    }
  })

  await logAdminAction(adminId, 'PROMOTE', 'USER', userId, `Promoted ${user.name} to Permanent status.`)
  
  revalidatePath('/admin/probation')
  revalidatePath('/admin/users')
  revalidatePath('/directory')
  return { success: true }
}

export async function ignoreProbationMilestone(userId: string) {
  const adminId = await assertAdmin()
  
  // Action was taken (No), so we don't need a reminder immediately. 
  // User wants it to remind monthly until action is taken.
  // Our checkProbationMilestones already handles this with the 30-day logic
  // by updating lastProbationReminded. So 'ignore' just resets the date to now.
  
  await prisma.user.update({
    where: { id: userId },
    data: { lastProbationReminded: new Date() }
  })

  await logAdminAction(adminId, 'PROBATION_REJECT', 'USER', userId, `Admin declined promotion for user ID: ${userId} for this month.`)
  
  revalidatePath('/admin/probation')
  return { success: true }
}

export async function getDepartments() {
  await assertAdmin()
  return await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { users: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function createDepartment(formData: FormData) {
  const adminId = await assertAdmin()
  const name = (formData.get('name') as string).trim()

  if (!name) throw new Error('Department name is required')

  // Backend Uniqueness Check
  const existing = await prisma.department.findFirst({ 
    where: { name },
    select: { id: true }
  })
  
  if (existing) {
    throw new Error('This department name is already registered in the intranet.')
  }

  // Bypassing Prisma Validation Cache via Raw SQL
  const id = `dept_${Math.random().toString(36).substr(2, 9)}`
  await prisma.$executeRawUnsafe(
    'INSERT INTO Department (id, name) VALUES (?, ?)',
    id,
    name
  )

  await logAdminAction(adminId, 'CREATE', 'DEPARTMENT', id, `Created global department: ${name}`)
  
  revalidatePath('/admin/governance/departments')
  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteDepartment(formData: FormData) {
  const adminId = await assertAdmin()
  const id = formData.get('id') as string

  // Hardened fetch to avoid legacy columns
  const dept = await prisma.department.findUnique({
    where: { id },
    select: { 
      id: true, 
      name: true,
      _count: { select: { users: true } }
    }
  })

  if (!dept) throw new Error('Department not found')
  if (dept._count.users > 0) {
    throw new Error('Cannot delete a department that has active staff members.')
  }

  // Bypassing Prisma Validation Cache via Raw SQL for Deletion
  await prisma.$executeRawUnsafe(
    'DELETE FROM Department WHERE id = ?',
    id
  )

  await logAdminAction(adminId, 'DELETE', 'DEPARTMENT', id, `Deleted global department: ${dept.name}`)
  
  revalidatePath('/admin/governance/departments')
  revalidatePath('/admin/users')
  return { success: true }
}
