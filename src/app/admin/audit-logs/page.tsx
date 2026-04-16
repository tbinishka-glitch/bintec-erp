import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Activity, User, FileText, Clock } from 'lucide-react'

export default async function AdminAuditLogsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  
  const me = await prisma.user.findUnique({ 
    where: { email: session.user.email as string }, 
    select: {
      id: true,
      branchId: true,
      role: { select: { name: true } }
    }
  })
  
  // Only Super Admin and Network Admin can see full audit logs
  const normalized = (me?.role?.name || '').toUpperCase().replace(/\s+/g, '_')
  const allowedRoles = ['SUPER_ADMIN', 'CORPORATE_ADMIN', 'IT_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN']
  if (!allowedRoles.includes(normalized)) redirect('/')

  const isBranchAdmin = normalized === 'BRANCH_ADMIN'
  const myBranchId = me?.branchId
  const filter = isBranchAdmin ? { user: { branchId: myBranchId } } : {}

  const logs = await prisma.auditLog.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
          branch: { select: { name: true } }
        }
      }
    },
    take: 100
  })

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-sm font-black uppercase text-primary/50 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> System Control
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Audit <span className="text-primary">Transmissions</span></h1>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed">Cryptographic Action History & Governance Telemetry</p>
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-soft flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-primary">{logs.length}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logged Events</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <p className="text-2xl font-black text-gold-leeds">LIVE</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
            </div>
          </div>
        </header>

        {/* Log Table */}
        <div className="bg-white rounded-[2.5rem] shadow-premium border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">Timestamp</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">Administrator</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">Action Type</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">Target Entity</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">Trace Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-xs font-bold text-gray-600">
                          {new Date(log.createdAt).toLocaleDateString()} 
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 italic">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                          {log.user.image ? (
                            <img src={log.user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900 leading-none">{log.user.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                            {log.user.branch?.name || 'Network'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm
                        ${log.action === 'CREATE' ? 'bg-emerald-500 text-white' : 
                          log.action === 'DELETE' ? 'bg-rose-500 text-white' : 
                          log.action === 'UPDATE' ? 'bg-amber-500 text-white' : 
                          'bg-primary text-white'}
                      `}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                         <FileText className="w-3.5 h-3.5 text-primary/40" />
                         <span className="text-xs font-black text-gray-700 uppercase tracking-tighter italic">
                           {log.entity}
                         </span>
                         <span className="text-[10px] font-bold text-gray-300">
                           #{log.entityId.slice(-6)}
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-xs text-gray-500 font-medium line-clamp-1 max-w-xs group-hover:line-clamp-none transition-all">
                         {log.details || '—'}
                       </p>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <Activity className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-loose">
                        No governance transmissions captured in history buffer
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
