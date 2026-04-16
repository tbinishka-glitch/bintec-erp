'use client';

import { motion } from 'framer-motion';
import { Bell, CheckCheck, ArrowRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export function NotificationsClient({ 
  notifications, 
  unreadCount,
  markAllReadAction,
  markReadAction
}: { 
  notifications: any[], 
  unreadCount: number,
  markAllReadAction: () => void,
  markReadAction: (id: string) => void
}) {
  return (
    <div className="max-w-[800px] mx-auto px-6 pb-24 space-y-12">
      
      {/* ── HEADER SECTION ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[2.5rem] bg-gradient-to-r from-primary to-primary-900 text-white overflow-hidden shadow-premium"
      >
        <div className="relative py-10 md:py-14 px-10 md:px-12 z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
               <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                 <Bell className="w-7 h-7 text-gold-leeds" />
               </div>
               {unreadCount > 0 && (
                 <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#5A2D82] shadow-lg">
                   {unreadCount > 9 ? '9+' : unreadCount}
                 </span>
               )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight uppercase">Activity <span className="text-gold-leeds">Stream</span></h1>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                {unreadCount > 0 ? `${unreadCount} Unread Alerts` : 'All Systems Nominal'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <form action={markAllReadAction}>
              <button type="submit" className="px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/20 hover:border-white shadow-xl">
                 Clear Notifications
              </button>
            </form>
          )}
        </div>
      </motion.div>

      {/* ── NOTIFICATION LIST ── */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <Bell className="w-8 h-8 text-gray-200" />
             </div>
             <p className="text-xl font-black text-gray-900 uppercase tracking-widest">Inbox Empty</p>
             <p className="text-xs font-bold text-gray-300 mt-2 uppercase tracking-widest leading-relaxed">We&apos;ll notify you when things move</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <motion.div 
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative bg-white p-6 md:p-8 rounded-[2rem] shadow-soft border group transition-all flex items-start gap-6 ${
                n.isRead ? 'opacity-80 grayscale-[0.5] border-transparent' : 'border-primary/10 shadow-premium'
              }`}
            >
              {/* Status Indicator */}
              {!n.isRead && (
                 <div className="absolute top-8 left-0 w-1 h-8 bg-primary rounded-r-full" />
              )}
              
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                     {format(new Date(n.createdAt), 'MMM d, yyyy · H:mm')}
                   </p>
                   {!n.isRead && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary px-2 py-1 rounded-md">New</span>
                   )}
                </div>
                
                <p className={`text-sm leading-relaxed ${n.isRead ? 'text-slate-400 font-medium' : 'text-black font-black'}`}>
                  {n.message}
                </p>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                 {n.link && (
                   <Link 
                     href={n.link}
                     onClick={() => !n.isRead && markReadAction(n.id)}
                     className="p-3 bg-gray-50 text-gray-400 hover:bg-primary hover:text-white rounded-xl transition-all border border-transparent shadow-sm"
                   >
                     <ArrowRight className="w-4 h-4" />
                   </Link>
                 )}
                 {!n.isRead && (
                   <form action={() => markReadAction(n.id)}>
                      <button type="submit" className="p-3 text-gray-300 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </form>
                 )}
              </div>
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}
