import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { 
  User, Mail, Building, Shield, 
  MapPin, Phone, Calendar, BadgeCheck 
} from 'lucide-react'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { 
      role: true, 
      organization: true,
      department: true,
      branch: true
    }
  })

  if (!user) redirect('/login')

  return (
    <div className="flex-1 space-y-8 p-10 bg-[#F8F9FC] min-h-screen">
      {/* Header Profile Banner */}
      <div className="bg-white rounded-[3rem] shadow-premium border border-gray-50 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-primary to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Image src="/logo.png" alt="" fill className="object-cover scale-150 rotate-12" />
          </div>
        </div>
        
        <div className="px-12 pb-12 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-8">
            <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl">
              <div className="w-full h-full rounded-[2rem] bg-gray-100 flex items-center justify-center overflow-hidden relative border-4 border-white">
                {user.image ? (
                  <Image src={user.image} alt={user.name || ''} fill className="object-cover" />
                ) : (
                  <User size={64} className="text-gray-300" />
                )}
              </div>
            </div>
            
            <div className="flex-1 pb-4 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-black">{user.name}</h1>
                <BadgeCheck size={28} className="text-primary fill-primary/10" />
              </div>
              <p className="text-lg font-medium text-slate-500">{user.role?.name} • {user.department?.name || 'Institutional Staff'}</p>
            </div>
            
            <div className="pb-4">
              <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sovereign Verified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-premium border border-gray-50 p-10 space-y-10">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">System Identity Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </p>
                <p className="text-sm font-bold text-black">{user.email}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building size={12} /> Primary Branch
                </p>
                <p className="text-sm font-bold text-black">{user.branch?.name || 'Leeds Head Office'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={12} /> Authority Level
                </p>
                <p className="text-sm font-bold text-black uppercase tracking-wider">{user.role?.name}</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} /> Work Location
                </p>
                <p className="text-sm font-bold text-black">{(user.branch as any)?.location || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] shadow-premium p-10 text-white relative overflow-hidden">
             <div className="absolute -bottom-10 -right-10 opacity-10">
               <Shield size={160} />
             </div>
             
             <div className="relative z-10 space-y-8">
               <h3 className="text-lg font-black uppercase tracking-tight">Security Access</h3>
               <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                   <span className="text-xs font-bold uppercase tracking-widest text-white/60">Biometric Unlock</span>
                   <div className="w-10 h-5 bg-primary rounded-full relative">
                     <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                   <span className="text-xs font-bold uppercase tracking-widest text-white/60">Two-Factor Auth</span>
                   <div className="w-10 h-5 bg-gray-600 rounded-full relative">
                     <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
