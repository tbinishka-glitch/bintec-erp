import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/lib/audit'

async function saveUserEdit(formData: FormData) {
  'use server'
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } })
  const myRole = me?.role?.name || ''
  const myBranchId = me?.branchId

  if (!['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(myRole)) redirect('/')

  const id = formData.get('id') as string
  const existingUser = await prisma.user.findUnique({ where: { id } })
  if (!existingUser) throw new Error('User not found')

  // Branch Isolation check for Server Action
  if (myRole === 'Branch Admin' && existingUser.branchId !== myBranchId) {
    throw new Error('Security Breach: You are not authorized to edit personnel outside your branch.')
  }

  const firstName = (formData.get('firstName') as string)?.trim() || undefined
  const lastName = (formData.get('lastName') as string)?.trim() || undefined
  const name = (formData.get('name') as string)?.trim() || undefined
  const email = (formData.get('email') as string)?.trim() || undefined
  const mobileNumber = (formData.get('mobileNumber') as string)?.trim() || undefined
  const telephoneNumber = (formData.get('telephoneNumber') as string)?.trim() || undefined
  const address = (formData.get('address') as string)?.trim() || undefined
  const staffId = (formData.get('staffId') as string)?.trim() || undefined
  const epfNo = (formData.get('epfNo') as string)?.trim() || undefined
  const employeeCategoryId = (formData.get('employeeCategoryId') as string)?.trim() || undefined
  const roleId = (formData.get('roleId') as string)?.trim() || undefined
  const targetBranchId = (formData.get('branchId') as string)?.trim() || undefined
  const dateOfBirthRaw = (formData.get('dateOfBirth') as string)?.trim()
  const emergencyContactName = (formData.get('emergencyContactName') as string)?.trim() || undefined
  const emergencyContactNumber = (formData.get('emergencyContactNumber') as string)?.trim() || undefined

  const image = (formData.get('image') as string)?.trim() || undefined
  const leadershipTitle = (formData.get('leadershipTitle') as string)?.trim() || undefined
  const leadershipTier = (formData.get('leadershipTier') as string)?.trim() || undefined
  const bio = (formData.get('bio') as string)?.trim() || undefined
  const qualifications = (formData.get('qualifications') as string)?.trim() || undefined
  const leadershipQuote = (formData.get('leadershipQuote') as string)?.trim() || undefined

  // Enforcement: Branch Admin cannot change branchId
  const finalBranchId = myRole === 'Branch Admin' ? existingUser.branchId : (targetBranchId || null)

  const targetRole = roleId ? await prisma.role.findUnique({ where: { id: roleId } }) : null

  // HR_ADMIN cannot assign SUPER_ADMIN role
  if (myRole === 'Corporate Admin' && targetRole?.name === 'Super Admin') {
    throw new Error('HR Admins are not permitted to assign the Super Admin role.')
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      firstName, lastName, name, email, mobileNumber, telephoneNumber,
      address, staffId, epfNo, 
      employeeCategoryId: employeeCategoryId || null,
      roleId: roleId || undefined,
      branchId: finalBranchId,
      dateOfBirth: dateOfBirthRaw ? new Date(dateOfBirthRaw) : undefined,
      emergencyContactName, emergencyContactNumber,
      image,
      leadershipTitle,
      leadershipTier,
      bio,
      qualifications,
      leadershipQuote,
    }
  })

  await logAdminAction(session.user.id, 'UPDATE', 'USER', updatedUser.id, `Manual profile update by ${myRole} (${session.user.name})`)

  revalidatePath('/admin/users')
  revalidatePath('/directory')
  redirect('/admin/users')
}

export default async function AdminEditUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true }
  })
  const myRole = me?.role?.name || ''
  const isSuperAdmin = myRole === 'Super Admin'
  const isBranchAdmin = myRole === 'Branch Admin'

  const { userId } = await params
  const [user, roles, branches, categories] = await Promise.all([
    prisma.user.findUnique({ 
      where: { id: userId }, 
      include: { 
        role: true, 
        branch: true, 
        department: { select: { id: true, name: true } } 
      } 
    }),
    prisma.role.findMany({ orderBy: { name: 'asc' } }),
    prisma.branch.findMany({ orderBy: { name: 'asc' } }),
    prisma.employeeCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!user) redirect('/admin/users')

  // Branch Isolation check
  if (isBranchAdmin && user.branchId !== (session.user as any)?.branchId) {
    console.warn(`[GOVERNANCE] Unauthorized profile access attempt by BRANCH_ADMIN ${session.user.id} on user ${userId}`)
    redirect('/admin/users')
  }

  // HR Admin cannot edit Super Admin users
  if (myRole === 'Corporate Admin' && user.role?.name === 'Super Admin') redirect('/admin/users')

  const Field = ({ label, id, type = 'text', defaultValue, readOnly = false, placeholder = '' }: any) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      <input
        id={id} name={id} type={type}
        defaultValue={defaultValue ?? ''}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${readOnly ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-background text-foreground'}`}
      />
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Link href="/admin/users" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Staff Profile</h2>
          <p className="text-sm text-muted-foreground">{user.name} · {user.email}</p>
        </div>
      </header>

      <form action={saveUserEdit} className="space-y-6">
        <input type="hidden" name="id" value={user.id} />

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" id="firstName" defaultValue={user.firstName} />
            <Field label="Last Name" id="lastName" defaultValue={user.lastName} />
            <Field label="Display Name" id="name" defaultValue={user.name} />
            <Field label="Email Address" id="email" type="email" defaultValue={user.email} />
            <Field label="Date of Birth" id="dateOfBirth" type="date" defaultValue={user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : ''} />
            <Field label="Mobile Number" id="mobileNumber" defaultValue={user.mobileNumber} />
            <Field label="Telephone Number" id="telephoneNumber" defaultValue={user.telephoneNumber} />
          </div>
          <Field label="Address" id="address" defaultValue={user.address} />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Emergency Contact Name" id="emergencyContactName" defaultValue={user.emergencyContactName} />
            <Field label="Emergency Contact Number" id="emergencyContactNumber" defaultValue={user.emergencyContactNumber} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold">Leadership & Profile Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Profile Image URL" id="image" defaultValue={user.image}  placeholder="e.g. /founder.png" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Leadership Title" id="leadershipTitle" defaultValue={user.leadershipTitle} placeholder="e.g. Founder Chairman" />
              <div className="space-y-1.5">
                <label htmlFor="leadershipTier" className="text-sm font-medium text-foreground">Leadership Tier</label>
                <select id="leadershipTier" name="leadershipTier" defaultValue={user.leadershipTier ?? ''}
                  className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Not in Leadership Grid</option>
                  <option value="EXECUTIVE">EXECUTIVE (Top Hero Section)</option>
                  <option value="DIRECTOR">DIRECTOR (Executive Directors)</option>
                  <option value="COORDINATOR">COORDINATOR (Max 9)</option>
                  <option value="NETWORK">NETWORK LEADERSHIP (Max 8)</option>
                  <option value="BRANCH">BRANCH LEADERSHIP (Max 20)</option>
                </select>
              </div>
            </div>

            <Field label="Qualifications" id="qualifications" defaultValue={user.qualifications} placeholder="e.g. MBA, PhD" />
            
            <div className="space-y-1.5">
              <label htmlFor="bio" className="text-sm font-medium text-foreground">Professional Biography</label>
              <textarea
                id="bio" name="bio"
                defaultValue={user.bio ?? ''}
                rows={4}
                className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary h-32"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="leadershipQuote" className="text-sm font-medium text-foreground">Executive Quote / Message</label>
              <textarea
                id="leadershipQuote" name="leadershipQuote"
                defaultValue={user.leadershipQuote ?? ''}
                rows={6}
                className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary h-48"
                placeholder="For Founder/Chairperson messages..."
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold">Organisation & Classification</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Staff ID" id="staffId" defaultValue={user.staffId} />
            <Field label="EPF No" id="epfNo" defaultValue={user.epfNo} />

            <div className="space-y-1.5">
              <label htmlFor="employeeCategoryId" className="text-sm font-medium text-foreground">Employee Category</label>
              <select id="employeeCategoryId" name="employeeCategoryId" defaultValue={user.employeeCategoryId ?? ''}
                className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="roleId" className="text-sm font-medium text-foreground">Role</label>
              <select id="roleId" name="roleId" defaultValue={user.roleId ?? ''}
                className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">No role</option>
                {roles
                  .filter(r => isSuperAdmin || r.name !== 'Super Admin')
                  .map(r => <option key={r.id} value={r.id}>{r.name.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="branchId" className="text-sm font-medium text-foreground">Branch</label>
              <select id="branchId" name="branchId" defaultValue={user.branchId ?? ''}
                className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Network-wide</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-4">
          <Link href="/admin/users" className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </Link>
          <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
