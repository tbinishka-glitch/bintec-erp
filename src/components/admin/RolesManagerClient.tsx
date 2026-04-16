'use client'

import { useState } from 'react'
import { Shield, ShieldCheck, Users, Save, Info, AlertCircle, ChevronRight, Layout, Settings, Lock, Loader2 } from 'lucide-react'
import { updateRolePermissions } from '@/app/admin/roles/actions'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { UserAvatar } from '@/components/ui/UserAvatar'
import Link from 'next/link'

export function RolesManagerClient({ roles }: { roles: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleUpdate = async (roleId: string, permissions: string) => {
    setLoadingId(roleId)
    const fd = new FormData()
    fd.append('roleId', roleId)
    fd.append('permissions', permissions)
    
    try {
      await updateRolePermissions(fd)
      toast.success('Permissions updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    } finally {
      setLoadingId(null)
    }
  }

  const ROLE_DESCRIPTIONS: Record<string, string> = {
    'Super Admin': 'Supreme authority. Absolute control over platform infrastructure, security, and global data hierarchies.',
    'Corporate Admin': 'Personnel governance. Oversight of the staff directory, onboarding, and official corporate announcements.',
    'IT Admin': 'Technical infrastructure. Management of platform systems, integrations, and server protocols.',
    'Network Admin': 'Network-wide operation management. Oversight of multi-branch data and regional communications.',
    'Branch Admin': 'Regional operational control. Managing branch-specific staff and local resource distribution workflows.',
    'Moderator': 'Hub integrity enforcement. Reviewing and moderating internal publications and discourse engagement.',
    'User': 'Standard engagement. Participating in the intranet ecosystem with full view and reaction access.',
  }

  return (
    <div className="space-y-10">
      {roles.map((role, index) => {
        const desc = ROLE_DESCRIPTIONS[role.name] || 'Custom system role focusing on specific coordination tasks within the intranet.'
        
        return (
          <motion.div 
            key={role.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[3rem] border border-gray-100 shadow-premium overflow-hidden group"
          >
            <div className="p-8 md:p-12 flex flex-col xl:flex-row gap-12">
              {/* Role Identity Card */}
              <div className="xl:w-80 shrink-0 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                       <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 leading-none">{role.name}</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-2 py-1 bg-gray-50 rounded-lg w-fit border border-gray-100 italic">Access Group</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Population</span>
                      <span className="text-xs font-black text-primary">{role.users?.length || 0} assigned</span>
                   </div>
                   <div className="flex -space-x-2">
                     {(role.users || []).slice(0, 5).map((u: any) => (
                       <div key={u.id} className="ring-2 ring-white rounded-full overflow-hidden w-8 h-8 bg-gray-100 bg-center bg-cover">
                          <UserAvatar imageUrl={u.image} name={u.name} size="xs" />
                       </div>
                     ))}
                     {(role.users?.length || 0) > 5 && (
                       <div className="w-8 h-8 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +{(role.users?.length || 0) - 5}
                       </div>
                     )}
                   </div>
                   <Link href="/admin/users" className="block text-[10px] font-black text-primary uppercase tracking-widest hover:underline pt-2">
                      Personnel Management →
                   </Link>
                </div>
              </div>

              {/* Permissions Control Interface */}
              <div className="flex-1 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-2.5 h-2.5 rounded-full bg-gold-leeds animate-pulse" />
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authority Policy Definition</h4>
                    </div>
                    {role.name === 'Super Admin' && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/20">
                         <Lock className="w-3 h-3" /> System Immutable
                      </div>
                    )}
                 </div>

                 <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleUpdate(role.id, formData.get('permissions') as string)
                  }}
                  className="space-y-6"
                 >
                    <div className="relative group/editor">
                       <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-[10px] font-mono text-gray-400 backdrop-blur-sm">
                          policy.json
                       </div>
                       <textarea 
                          name="permissions"
                          defaultValue={role.permissions || '{\n  "canPublish": false,\n  "canModerate": false\n}'}
                          disabled={role.name === 'Super Admin'}
                          className="w-full h-48 bg-gray-900 text-gold-leeds/90 p-12 pt-16 rounded-[2.5rem] font-mono text-xs focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none border-4 border-gray-100 shadow-inner scrollbar-none"
                       />
                       <div className="absolute bottom-6 right-8 flex items-center gap-4">
                          <div className="flex flex-col items-end opacity-0 group-hover/editor:opacity-100 transition-opacity">
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Integrity Check Pass</span>
                             <span className="text-[9px] font-medium text-gray-300">Governance Policy Model</span>
                          </div>
                          <button 
                            type="submit"
                            disabled={loadingId === role.id || role.name === 'Super Admin'}
                            className="bg-primary hover:bg-primary/90 text-white p-5 rounded-2xl shadow-xl shadow-primary/30 transition-all disabled:opacity-50"
                          >
                             {loadingId === role.id ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                             ) : (
                                <Save className="w-6 h-6" />
                             )}
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-4 hover:bg-primary/10 transition-colors">
                          <Settings className="w-5 h-5 text-primary" />
                          <div>
                             <p className="text-xs font-black text-gray-900 uppercase">Policy Enforcement</p>
                             <p className="text-[10px] font-medium text-gray-500">Apply strict governance rules</p>
                          </div>
                          <div className="ml-auto w-10 h-6 bg-primary rounded-full relative">
                             <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                       </div>
                       <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-4 opacity-50 grayscale cursor-not-allowed">
                          <Users className="w-5 h-5 text-gray-400" />
                          <div>
                             <p className="text-xs font-black text-gray-900 uppercase">Legacy Sync</p>
                             <p className="text-[10px] font-medium text-gray-500">Enable bulk coordination</p>
                          </div>
                          <div className="ml-auto w-10 h-6 bg-gray-200 rounded-full relative">
                             <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                       </div>
                    </div>
                 </form>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
