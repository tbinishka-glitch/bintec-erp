'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthenticated')
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true, organization: { select: { name: true } } },
  })
  if (!['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(user?.role?.name ?? '')) {
    throw new Error('Unauthorized')
  }
  return { userId: session.user.id, orgName: user?.organization?.name ?? '', roleName: user?.role?.name ?? '' }
}

// ── Derive org prefix from org name (first 3 letters, uppercase) ─────────────
// e.g. "Leeds International School" → "LIS"
//      "Royal Academy"              → "ROY"
//      If the org name has multiple words, take the first letter of each word (up to 3).
//      If single word, take first 3 characters.
function deriveOrgPrefix(orgName: string): string {
  if (!orgName) return 'ENT'
  const words = orgName.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    // Acronym from words (up to 3)
    return words.slice(0, 3).map(w => w[0].toUpperCase()).join('')
  }
  // Single word — take first 3 chars
  return words[0].slice(0, 3).toUpperCase()
}

// ── Generate unique Entity ID: {PREFIX}-ENT-0000001 ──────────────────────────
async function generateEntityId(orgName: string): Promise<string> {
  const prefix = deriveOrgPrefix(orgName)
  const count = await prisma.user.count({ where: { entityId: { not: null } } })
  const seq = String(count + 1).padStart(7, '0')
  const candidate = `${prefix}-ENT-${seq}`
  // Collision guard
  const existing = await prisma.user.findUnique({ where: { entityId: candidate } })
  if (existing) {
    const ts = Date.now().toString().slice(-5)
    return `${prefix}-ENT-${ts}${String(count + 1).padStart(2, '0')}`
  }
  return candidate
}

// ── Auto-create module profile shells for selected roles ────────────────────
async function syncRoleProfiles(userId: string, roles: { isEmployee: boolean; isParent: boolean; isSupplier: boolean; isStudent: boolean }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true, parentProfile: true, supplierProfile: true }
  })
  if (!user) return

  // Employee — uses staffId (no separate profile model yet, just the flag)
  // Parent Profile
  if (roles.isParent && !user.parentProfile) {
    await prisma.parentProfile.create({ data: { userId } })
  }
  // Supplier Profile
  if (roles.isSupplier && !user.supplierProfile) {
    await prisma.supplierProfile.create({
      data: { userId, companyName: user.name || 'Unnamed Supplier' }
    })
  }
  // Student Profile
  if (roles.isStudent && !user.studentProfile) {
    const seq = String(Math.floor(Math.random() * 90000) + 10000)
    await prisma.studentProfile.create({
      data: { userId, studentId: `STU-${seq}` }
    })
  }
}

// ── CHECK DUPLICATES ────────────────────────────────────────────────────────
export async function checkEntityDuplicates(formData: FormData) {
  await assertAdmin().catch(() => { throw new Error('Unauthorized') })
  const nic = formData.get('nicPassport') as string
  const passport = formData.get('passportNo') as string
  const mobile = formData.get('mobileNumber') as string
  const email = formData.get('email') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const dob = formData.get('dateOfBirth') as string
  const excludeId = formData.get('excludeId') as string

  const conditions: any[] = []
  if (nic) conditions.push({ nicPassport: nic })
  if (passport) conditions.push({ passportNo: passport })
  if (mobile) conditions.push({ mobileNumber: mobile })
  if (email) conditions.push({ email })
  if (firstName && lastName && dob) {
    conditions.push({ firstName, lastName, dateOfBirth: new Date(dob) })
  }

  if (conditions.length === 0) return { duplicates: [] }

  const results = await prisma.user.findMany({
    where: {
      OR: conditions,
      NOT: excludeId ? { id: excludeId } : undefined
    },
    select: {
      id: true, entityId: true, firstName: true, lastName: true,
      email: true, mobileNumber: true, nicPassport: true, image: true,
      isEmployee: true, isParent: true, isStudent: true, isSupplier: true
    },
    take: 5
  })

  return { duplicates: results }
}

// ── CREATE ENTITY ───────────────────────────────────────────────────────────
export async function createEntity(formData: FormData) {
  const { userId: adminId, orgName } = await assertAdmin()

  const entityId = await generateEntityId(orgName)

  // Section A — Personal
  const title = formData.get('title') as string
  const firstName = formData.get('firstName') as string
  const middleName = formData.get('middleName') as string
  const lastName = formData.get('lastName') as string
  const preferredName = formData.get('preferredName') as string
  const gender = formData.get('gender') as string
  const dob = formData.get('dateOfBirth') as string
  const maritalStatus = formData.get('maritalStatus') as string
  const nationality = formData.get('nationality') as string
  const religion = formData.get('religion') as string

  const fullName = [title, firstName, middleName, lastName].filter(Boolean).join(' ')

  // Section B — Identity
  const nic = formData.get('nicPassport') as string
  const passportNo = formData.get('passportNo') as string
  const birthCertNo = formData.get('birthCertNo') as string
  const taxId = formData.get('taxId') as string
  const epfNo = formData.get('epfNo') as string
  const etfNo = formData.get('etfNo') as string
  const staffId = formData.get('staffId') as string

  // Section C — Contact
  const mobile = formData.get('mobileNumber') as string
  const secondaryMobile = formData.get('secondaryMobile') as string
  const landPhone = formData.get('landPhone') as string
  const email = formData.get('email') as string
  const officialEmail = formData.get('officialEmail') as string
  const emergencyContactName = formData.get('emergencyContactName') as string
  const emergencyContactRel = formData.get('emergencyContactRel') as string
  const emergencyContactNumber = formData.get('emergencyContactNumber') as string
  const emergencyContactLand = formData.get('emergencyContactLand') as string

  // Section D — Permanent Address
  const permLine1 = formData.get('permanentAddressLine1') as string
  const permLine2 = formData.get('permanentAddressLine2') as string
  const permLine3 = formData.get('permanentAddressLine3') as string
  const permCity = formData.get('permanentCity') as string
  const permDistrict = formData.get('permanentDistrict') as string
  const permProvince = formData.get('permanentProvince') as string
  const permPostal = formData.get('permanentPostalCode') as string
  const permCountry = formData.get('permanentCountry') as string

  // Section E — Current Address
  const sameAsPerm = formData.get('sameAsPermanent') === 'on'
  const currLine1 = sameAsPerm ? permLine1 : formData.get('currentAddressLine1') as string
  const currLine2 = sameAsPerm ? permLine2 : formData.get('currentAddressLine2') as string
  const currLine3 = sameAsPerm ? permLine3 : formData.get('currentAddressLine3') as string
  const currCity = sameAsPerm ? permCity : formData.get('currentCity') as string
  const currDistrict = sameAsPerm ? permDistrict : formData.get('currentDistrict') as string
  const currProvince = sameAsPerm ? permProvince : formData.get('currentProvince') as string
  const currPostal = sameAsPerm ? permPostal : formData.get('currentPostalCode') as string
  const currCountry = sameAsPerm ? permCountry : formData.get('currentCountry') as string

  // Section F — Institutional
  const branchId = formData.get('branchId') as string
  const departmentId = formData.get('departmentId') as string
  const employeeCategoryId = formData.get('employeeCategoryId') as string
  const employeeSubCategoryId = formData.get('employeeSubCategoryId') as string
  const entitySource = formData.get('entitySource') as string
  const firstRegisteredDate = formData.get('firstRegisteredDate') as string
  const roleId = formData.get('roleId') as string

  // Section G — Roles
  const isEmployee = formData.get('isEmployee') === 'on'
  const isParent = formData.get('isParent') === 'on'
  const isSupplier = formData.get('isSupplier') === 'on'
  const isStudent = formData.get('isStudent') === 'on'

  // Password
  const password = formData.get('password') as string || 'password123'
  const hashed = await bcrypt.hash(password, 10)

  const newUser = await prisma.user.create({
    data: {
      entityId,
      title: title || null,
      firstName: firstName || null,
      middleName: middleName || null,
      lastName: lastName || null,
      name: fullName,
      preferredName: preferredName || null,
      gender: gender || null,
      dateOfBirth: dob ? new Date(dob) : null,
      maritalStatus: maritalStatus || null,
      nationality: nationality || null,
      religion: religion || null,
      nicPassport: nic || null,
      passportNo: passportNo || null,
      birthCertNo: birthCertNo || null,
      taxId: taxId || null,
      epfNo: epfNo || null,
      etfNo: etfNo || null,
      staffId: staffId || null,
      email: email || null,
      officialEmail: officialEmail || null,
      password: hashed,
      mobileNumber: mobile || null,
      secondaryMobile: secondaryMobile || null,
      landPhone: landPhone || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactRel: emergencyContactRel || null,
      emergencyContactNumber: emergencyContactNumber || null,
      emergencyContactLand: emergencyContactLand || null,
      permanentAddressLine1: permLine1 || null,
      permanentAddressLine2: permLine2 || null,
      permanentAddressLine3: permLine3 || null,
      permanentCity: permCity || null,
      permanentDistrict: permDistrict || null,
      permanentProvince: permProvince || null,
      permanentPostalCode: permPostal || null,
      permanentCountry: permCountry || null,
      currentAddressLine1: currLine1 || null,
      currentAddressLine2: currLine2 || null,
      currentAddressLine3: currLine3 || null,
      currentCity: currCity || null,
      currentDistrict: currDistrict || null,
      currentProvince: currProvince || null,
      currentPostalCode: currPostal || null,
      currentCountry: currCountry || null,
      branchId: branchId || null,
      departmentId: departmentId || null,
      employeeCategoryId: employeeCategoryId || null,
      employeeSubCategoryId: employeeSubCategoryId || null,
      roleId: roleId || null,
      entitySource: entitySource || null,
      firstRegisteredDate: firstRegisteredDate ? new Date(firstRegisteredDate) : new Date(),
      isEmployee,
      isParent,
      isSupplier,
      isStudent,
      entityStatus: 'ACTIVE',
      forcePasswordChange: true,
    }
  })

  // Auto-create module profile shells
  await syncRoleProfiles(newUser.id, { isEmployee, isParent, isSupplier, isStudent })

  revalidatePath('/admin/users')
  return { success: true, entityId, userId: newUser.id }
}

// ── UPDATE ENTITY ───────────────────────────────────────────────────────────
export async function updateEntity(formData: FormData) {
  const { userId: adminId } = await assertAdmin()
  const id = formData.get('id') as string
  if (!id) throw new Error('Entity ID required')

  // ── Section A: Personal ──
  const title = formData.get('title') as string
  const firstName = formData.get('firstName') as string
  const middleName = formData.get('middleName') as string
  const lastName = formData.get('lastName') as string
  const preferredName = formData.get('preferredName') as string
  const gender = formData.get('gender') as string
  const dob = formData.get('dateOfBirth') as string
  const maritalStatus = formData.get('maritalStatus') as string
  const nationality = formData.get('nationality') as string
  const religion = formData.get('religion') as string

  // ── Section B: Identity ──
  const nic = formData.get('nicPassport') as string
  const passportNo = formData.get('passportNo') as string
  const birthCertNo = formData.get('birthCertNo') as string
  const taxId = formData.get('taxId') as string
  const epfNo = formData.get('epfNo') as string
  const etfNo = formData.get('etfNo') as string
  const staffId = formData.get('staffId') as string

  // ── Section C: Contact ──
  const mobile = formData.get('mobileNumber') as string
  const secondaryMobile = formData.get('secondaryMobile') as string
  const landPhone = formData.get('landPhone') as string
  const email = formData.get('email') as string
  const officialEmail = formData.get('officialEmail') as string
  const emergencyContactName = formData.get('emergencyContactName') as string
  const emergencyContactRel = formData.get('emergencyContactRel') as string
  const emergencyContactNumber = formData.get('emergencyContactNumber') as string
  const emergencyContactLand = formData.get('emergencyContactLand') as string

  // ── Section D: Permanent Address ──
  const permLine1 = formData.get('permanentAddressLine1') as string
  const permLine2 = formData.get('permanentAddressLine2') as string
  const permLine3 = formData.get('permanentAddressLine3') as string
  const permCity = formData.get('permanentCity') as string
  const permDistrict = formData.get('permanentDistrict') as string
  const permProvince = formData.get('permanentProvince') as string
  const permPostal = formData.get('permanentPostalCode') as string
  const permCountry = formData.get('permanentCountry') as string

  // ── Section E: Current Address ──
  const sameAsPerm = formData.get('sameAsPermanent') === 'on'
  const currLine1 = sameAsPerm ? permLine1 : formData.get('currentAddressLine1') as string
  const currLine2 = sameAsPerm ? permLine2 : formData.get('currentAddressLine2') as string
  const currLine3 = sameAsPerm ? permLine3 : formData.get('currentAddressLine3') as string
  const currCity = sameAsPerm ? permCity : formData.get('currentCity') as string
  const currDistrict = sameAsPerm ? permDistrict : formData.get('currentDistrict') as string
  const currProvince = sameAsPerm ? permProvince : formData.get('currentProvince') as string
  const currPostal = sameAsPerm ? permPostal : formData.get('currentPostalCode') as string
  const currCountry = sameAsPerm ? permCountry : formData.get('currentCountry') as string

  // ── Section F: Institutional ──
  const branchId = formData.get('branchId') as string
  const departmentId = formData.get('departmentId') as string
  const employeeCategoryId = formData.get('employeeCategoryId') as string
  const employeeSubCategoryId = formData.get('employeeSubCategoryId') as string
  const roleId = formData.get('roleId') as string
  const entityStatus = formData.get('entityStatus') as string
  const entitySource = formData.get('entitySource') as string
  const firstRegisteredDate = formData.get('firstRegisteredDate') as string
  const notes = formData.get('notes') as string

  // ── Section G: Roles ──
  const isEmployee = formData.get('isEmployee') === 'on'
  const isParent = formData.get('isParent') === 'on'
  const isSupplier = formData.get('isSupplier') === 'on'
  const isStudent = formData.get('isStudent') === 'on'

  const firstName_ = firstName || ''
  const lastName_ = lastName || ''
  const fullName = [title, firstName_, middleName, lastName_].filter(Boolean).join(' ')

  await prisma.user.update({
    where: { id },
    data: {
      // Personal
      title: title || null, firstName: firstName_, middleName: middleName || null,
      lastName: lastName_, name: fullName, preferredName: preferredName || null,
      gender: gender || null, dateOfBirth: dob ? new Date(dob) : undefined,
      maritalStatus: maritalStatus || null, nationality: nationality || null,
      religion: religion || null,
      // Identity
      nicPassport: nic || null, passportNo: passportNo || null,
      birthCertNo: birthCertNo || null, taxId: taxId || null,
      epfNo: epfNo || null, etfNo: etfNo || null, staffId: staffId || null,
      // Contact
      email: email || null, officialEmail: officialEmail || null,
      mobileNumber: mobile || null, secondaryMobile: secondaryMobile || null,
      landPhone: landPhone || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactRel: emergencyContactRel || null,
      emergencyContactNumber: emergencyContactNumber || null,
      emergencyContactLand: emergencyContactLand || null,
      // Permanent Address
      permanentAddressLine1: permLine1 || null, permanentAddressLine2: permLine2 || null,
      permanentAddressLine3: permLine3 || null, permanentCity: permCity || null,
      permanentDistrict: permDistrict || null, permanentProvince: permProvince || null,
      permanentPostalCode: permPostal || null, permanentCountry: permCountry || null,
      // Current Address
      currentAddressLine1: currLine1 || null, currentAddressLine2: currLine2 || null,
      currentAddressLine3: currLine3 || null, currentCity: currCity || null,
      currentDistrict: currDistrict || null, currentProvince: currProvince || null,
      currentPostalCode: currPostal || null, currentCountry: currCountry || null,
      // Institutional
      branchId: branchId || null, departmentId: departmentId || null,
      employeeCategoryId: employeeCategoryId || null,
      employeeSubCategoryId: employeeSubCategoryId || null,
      roleId: roleId || null, entityStatus: entityStatus || 'ACTIVE',
      entitySource: entitySource || null,
      firstRegisteredDate: firstRegisteredDate ? new Date(firstRegisteredDate) : undefined,
      notes: notes || null,
      // Roles
      isEmployee, isParent, isSupplier, isStudent,
    }
  })

  await syncRoleProfiles(id, { isEmployee, isParent, isSupplier, isStudent })

  revalidatePath('/admin/users')
  return { success: true }
}

// ── TOGGLE ENTITY STATUS ────────────────────────────────────────────────────
export async function toggleEntityStatus(id: string, isActive: boolean) {
  await assertAdmin().catch(() => { throw new Error('Unauthorized') })
  await prisma.user.update({
    where: { id },
    data: { isActive, entityStatus: isActive ? 'ACTIVE' : 'INACTIVE' }
  })
  revalidatePath('/admin/users')
  return { success: true }
}

// ── FLAG DUPLICATE ──────────────────────────────────────────────────────────
export async function flagEntityDuplicate(id: string, flagged: boolean) {
  await assertAdmin().catch(() => { throw new Error('Unauthorized') })
  await prisma.user.update({ where: { id }, data: { isDuplicateFlagged: flagged } })
  revalidatePath('/admin/users')
  return { success: true }
}

// ── GET ENTITY AUDIT LOGS ────────────────────────────────────────────────────
// Returns the last 50 audit log entries related to a specific entity (user).
// Includes actions performed ON the entity (entityId = userId) and sys events.
export async function getEntityAuditLogs(userId: string) {
  await assertAdmin().catch(() => { throw new Error('Unauthorized') })
  const logs = await prisma.auditLog.findMany({
    where: { entityId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: { name: true, firstName: true, lastName: true, entityId: true } }
    }
  })
  return logs.map(l => ({
    id: l.id,
    action: l.action,
    entity: l.entity,
    details: l.details,
    createdAt: l.createdAt.toISOString(),
    performedBy: l.user?.name || [l.user?.firstName, l.user?.lastName].filter(Boolean).join(' ') || 'System',
    performedByEntityId: l.user?.entityId || null,
  }))
}

// ── EXPORT ENTITIES CSV ──────────────────────────────────────────────────────
// Returns a plain CSV string for all visible entities (for client-side download).
export async function exportEntitiesCSV(): Promise<string> {
  await assertAdmin().catch(() => { throw new Error('Unauthorized') })
  const users = await prisma.user.findMany({
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    select: {
      entityId: true, name: true, firstName: true, lastName: true,
      email: true, mobileNumber: true, nicPassport: true, passportNo: true,
      gender: true, nationality: true, isActive: true, entityStatus: true,
      isEmployee: true, isParent: true, isStudent: true, isSupplier: true,
      branch: { select: { name: true } },
      employeeCategory: { select: { name: true } },
      createdAt: true,
    }
  })

  const header = [
    'Entity ID', 'Full Name', 'First Name', 'Last Name', 'Email', 'Mobile',
    'NIC', 'Passport', 'Gender', 'Nationality', 'Status', 'Entity Status',
    'Employee', 'Parent', 'Student', 'Supplier', 'Branch', 'Category', 'Created'
  ].join(',')

  const rows = users.map(u => [
    u.entityId || '', u.name || '', u.firstName || '', u.lastName || '',
    u.email || '', u.mobileNumber || '', u.nicPassport || '', u.passportNo || '',
    u.gender || '', u.nationality || '',
    u.isActive ? 'Active' : 'Inactive', u.entityStatus || '',
    u.isEmployee ? 'Yes' : 'No', u.isParent ? 'Yes' : 'No',
    u.isStudent ? 'Yes' : 'No', u.isSupplier ? 'Yes' : 'No',
    u.branch?.name || '', u.employeeCategory?.name || '',
    u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  return [header, ...rows].join('\n')
}

// ── TRASH BIN MANAGEMENT ─────────────────────────────────────────────────────

export async function moveToTrash(id: string) {
  await assertAdmin().catch(() => { throw new Error('Unauthorized') })
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() }
  })
  revalidatePath('/admin/users')
  return { success: true }
}

export async function restoreEntity(id: string) {
  await assertAdmin().catch(() => { throw new Error('Unauthorized') })
  await prisma.user.update({
    where: { id },
    data: { deletedAt: null }
  })
  revalidatePath('/admin/users')
  revalidatePath('/admin/super/trash')
  return { success: true }
}

export async function permanentlyDeleteEntity(id: string) {
  const admin = await assertAdmin().catch(() => { throw new Error('Unauthorized') })
  if (admin.roleName !== 'Super Admin') throw new Error('Super Admin access required for permanent deletion.')
  
  await performSafeUserHardDelete([id])
  revalidatePath('/admin/users')
  revalidatePath('/admin/super/trash')
  return { success: true }
}

export async function emptyTrashBin() {
  const admin = await assertAdmin().catch(() => { throw new Error('Unauthorized') })
  if (admin.roleName !== 'Super Admin') throw new Error('Super Admin access required for permanent deletion.')
  
  const trashed = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
    select: { id: true }
  })
  
  const ids = trashed.map(t => t.id)
  await performSafeUserHardDelete(ids)

  revalidatePath('/admin/super/trash')
  return { success: true }
}

// ── INTERNAL HELPER FOR SQLITE SAFE CASCADING DELETION ────────
async function performSafeUserHardDelete(userIds: string[]) {
  if (!userIds || userIds.length === 0) return

  // 1. Sever any managerial dependencies (e.g. subordinates pointing to these users)
  await prisma.user.updateMany({
    where: { reportingManagerId: { in: userIds } },
    data: { reportingManagerId: null }
  })

  // 2. Wipe heavy associated content lacking native DB-level cascades
  await prisma.announcement.deleteMany({ where: { authorId: { in: userIds } } })
  await prisma.article.deleteMany({ where: { authorId: { in: userIds } } })
  await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } })

  // 3. Purge the base entity registry directly
  await prisma.user.deleteMany({
    where: { id: { in: userIds } }
  })
}
