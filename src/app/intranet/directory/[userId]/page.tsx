import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { Mail, Phone, Building, Calendar, ArrowLeft, Briefcase, Shield, MessageSquare } from 'lucide-react'

export default async function StaffProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { userId } = await params
  const me = await prisma.user.findUnique({ where: { id: session.user.id } })
  const roleName = (session.user as any)?.roleName || ''
  const isAdmin = roleName === 'Super Admin' || roleName === 'Corporate Admin'

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      role: true, 
      branch: true, 
      department: {
        select: { id: true, name: true }
      }, 
      employeeCategory: true, 
      employeeSubCategory: true 
    }
  })

  if (!profile) redirect('/directory')

  // Branch isolation — staff can only see profiles in their own branch
  if (!isAdmin && me?.branchId && profile.branchId !== me.branchId) {
    redirect('/directory')
  }

  const isOwnProfile = session.user.id === userId

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Link href="/directory" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Directory
        </Link>
      </header>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-primary/80 to-purple-900 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <p className="text-white/80 mt-1 font-medium">{profile.employeeSubCategory?.name || profile.designation || profile.role?.name?.replace('_', ' ') || 'Staff Member'}</p>
            {profile.employeeCategory && (
              <span className="inline-block mt-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {profile.employeeCategory.name}
              </span>
            )}
          </div>
          <div className="sm:ml-auto flex gap-2">
            {!isOwnProfile && (
              <Link href="/chat" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <MessageSquare className="w-4 h-4" /> Message
              </Link>
            )}
            {isOwnProfile && (
              <Link href="/profile/edit" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Organisation */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Organisation</h3>
            <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Department" value={profile.employeeSubCategory?.name || profile.designation || '—'} />
            <InfoRow icon={<Building className="w-4 h-4" />} label="Branch" value={profile.branch?.name || 'Network-wide'} />
            {profile.department && <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Department" value={profile.department.name} />}
            <InfoRow icon={<Shield className="w-4 h-4" />} label="Role" value={profile.role?.name?.replace('_', ' ') || '—'} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined" value={format(new Date(profile.joinedDate), 'MMMM yyyy')} />
            {profile.staffId && <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Staff ID" value={profile.staffId} />}
            {profile.epfNo && <InfoRow icon={<Briefcase className="w-4 h-4" />} label="EPF No" value={profile.epfNo} />}
            {profile.nicPassport && <InfoRow icon={<Fingerprint className="w-4 h-4" />} label="NIC" value={profile.nicPassport} />}
            {profile.dateOfBirth && <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={format(new Date(profile.dateOfBirth), 'MMMM d, yyyy')} />}
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</h3>
            {profile.email && <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} />}
            {profile.mobileNumber && <InfoRow icon={<Phone className="w-4 h-4" />} label="Mobile" value={profile.mobileNumber} />}
            {profile.telephoneNumber && <InfoRow icon={<Phone className="w-4 h-4" />} label="Telephone" value={profile.telephoneNumber} />}
            {profile.emergencyContactName && (
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Emergency Contact" value={`${profile.emergencyContactName} (${profile.emergencyContactNumber || '—'})`} />
            )}
          </div>

           {/* Professional Notes */}
          {(profile.notes || profile.bio) && (
            <div className="sm:col-span-2 space-y-3 bg-muted/50 p-6 rounded-2xl">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" /> Professional Notes
              </h3>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {profile.notes || profile.bio}
              </p>
            </div>
          )}

          {/* Admin-only sensitive fields */}
          {isAdmin && (
            <div className="sm:col-span-2 border-t border-border pt-4 space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" /> Admin View (Restricted Intelligence)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* NIC added above in identical block but ensuring consistency here */}
              </div>
              <div className="flex gap-3 pt-2">
                <Link href="/admin/users"
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm rounded-xl transition-colors">
                  Open Staff Gateway
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
