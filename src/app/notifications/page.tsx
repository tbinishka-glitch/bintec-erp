import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { 
  Bell, CheckCircle2, AlertCircle, 
  Megaphone, Clock, Filter 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return (
    <div className="flex-1 space-y-10 p-10 bg-[#F8F9FC] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-black uppercase">Alert <span className="text-primary">Center</span></h1>
          <p className="text-sm font-medium text-slate-400">Manage your real-time institutional transmissions and system alerts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-gray-100 flex items-center gap-2 hover:text-primary transition-all">
            <Filter size={14} /> Filter
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            Mark all as read
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-6 bg-white rounded-[2rem] shadow-premium border ${notif.isRead ? 'border-gray-50' : 'border-primary/10 bg-primary/5'} flex items-start gap-6 transition-all hover:scale-[1.01]`}
            >
              <div className={`p-3 rounded-2xl ${notif.isRead ? 'bg-gray-50 text-gray-400' : 'bg-white text-primary shadow-sm'}`}>
                {notif.type === 'ANNOUNCEMENT' ? <Megaphone size={18} /> : 
                 notif.type === 'ALERT' ? <AlertCircle size={18} /> : 
                 <CheckCircle2 size={18} />}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-black uppercase tracking-tight ${notif.isRead ? 'text-slate-600' : 'text-black'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {formatDistanceToNow(new Date(notif.createdAt))} ago
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-premium border border-gray-50 p-20 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200">
              <Bell size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-black tracking-tight uppercase">Operational Silence</h2>
              <p className="text-sm font-medium text-slate-400">There are no new transmissions broadcasting to your identity at this time.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
