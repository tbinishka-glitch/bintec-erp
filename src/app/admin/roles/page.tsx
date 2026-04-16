import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ShieldCheck, Info } from 'lucide-react'
import { RolesManagerClient } from '@/components/admin/RolesManagerClient'

export default async function AdminRolesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({ 
    where: { email: session.user.email as string }, 
    include: { role: true } 
  })
  
  const normalized = (me?.role?.name || '').toUpperCase().replace(/\s+/g, '_')
  const allowedRoles = ['SUPER_ADMIN', 'CORPORATE_ADMIN', 'IT_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN']
  if (!allowedRoles.includes(normalized)) redirect('/')

  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
    include: { 
      users: { 
        select: { 
          id: true, 
          name: true, 
          image: true 
        } 
      } 
    },
  })

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-10">
      
      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-premium border border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">
               Role <span className="text-gold-leeds">Governance</span>
             </h2>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-12">
            System Security: Manage access control policies and permission matrices
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Defined Groups</span>
            <span className="text-xl font-black text-primary">{roles.length} Roles</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
             <Info className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* ── CONTENT AREA ── */}
      <RolesManagerClient roles={roles} />
    </div>
  )
}
