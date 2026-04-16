import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { updateProfile } from './actions'
import { AvatarUploader } from '@/components/ui/AvatarUploader'

export default async function EditProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true, branch: true },
  })
  if (!user) redirect('/')

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Settings</Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Profile</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Update your personal information.</p>
        </div>
      </header>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4 bg-card border border-border rounded-2xl p-8 shadow-sm">
        <AvatarUploader
          userId={user.id}
          currentImage={user.image}
          name={user.name}
          firstName={user.firstName}
          lastName={user.lastName}
          size="2xl"
        />
        <div className="text-center">
          <p className="font-bold text-foreground">{user.name}</p>
          <p className="text-sm text-primary font-semibold">{user.role?.name ?? 'Staff'}</p>
          <p className="text-xs text-muted-foreground">{user.branch?.name ?? 'Network-wide'}</p>
        </div>
      </div>

      {/* Form */}
      <form action={updateProfile} className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { id: 'firstName', label: 'First Name', type: 'text', defaultValue: user.firstName ?? '' },
            { id: 'lastName', label: 'Last Name', type: 'text', defaultValue: user.lastName ?? '' },
            { id: 'email', label: 'Email Address', type: 'email', defaultValue: user.email ?? '' },
            { id: 'mobileNumber', label: 'Mobile Number', type: 'tel', defaultValue: user.mobileNumber ?? '' },
          ].map((f) => (
            <div key={f.id} className="space-y-1.5">
              <label htmlFor={f.id} className="text-sm font-semibold text-foreground">{f.label}</label>
              <input
                id={f.id} name={f.id} type={f.type} defaultValue={f.defaultValue}
                className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address" className="text-sm font-semibold text-foreground">Address</label>
          <input
            id="address" name="address" type="text" defaultValue={user.address ?? ''}
            className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-foreground">Display Name</label>
          <input
            id="name" name="name" type="text" defaultValue={user.name ?? ''}
            className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
          <p className="text-xs text-muted-foreground">This is the name shown across the platform. Note: All changes require Admin approval.</p>
        </div>

        {/* Read-only fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
          {[
            { label: 'Role', value: user.role?.name ?? '—' },
            { label: 'Branch', value: user.branch?.name ?? 'Network-wide' },
            { label: 'Category', value: (user as any).employeeCategoryId ?? '—' },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
              <p className="text-sm font-medium text-muted-foreground bg-muted px-3 py-2 rounded-xl">{f.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Role, branch, and category can only be changed directly by an Admin.</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/settings" className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors">
            Cancel
          </Link>
          <button type="submit"
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
