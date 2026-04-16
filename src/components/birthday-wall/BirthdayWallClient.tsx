'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Cake, Gift, MessageCircle, Plus, Star, User } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { createDirectMessage } from '@/app/chat/actions';

export function BirthdayWallClient({ 
  todayBirthdays, 
  upcomingBirthdays 
}: { 
  todayBirthdays: any[], 
  upcomingBirthdays: any[] 
}) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-24 space-y-12">
      
      {/* ── HEADER SECTION ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[2.5rem] bg-gradient-to-r from-[#5A2D82] via-[#5A2D82] to-[#7c4da6] text-white overflow-hidden shadow-premium shadow-primary/20"
      >
        <div className="relative py-10 md:py-16 px-10 md:px-14 z-10 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
              <Cake className="w-7 h-7 text-gold-leeds" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Birthday <span className="text-gold-leeds">Wall</span></h1>
              <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mt-2">Celebrate our Leeds Family</p>
            </div>
          </div>
          <p className="text-base md:text-lg text-white/80 font-medium leading-relaxed max-w-lg">
            A dedicated space to honor and celebrate the special days of our dedicated team members across all branches.
          </p>
        </div>
      </motion.div>

      {/* ── TODAY'S CELEBRATIONS ── */}
      {todayBirthdays.length > 0 && (
        <section className="space-y-8">
           <div className="px-1 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Today&apos;s <span className="text-primary">Stars</span></h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Sending warm wishes across the network</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {todayBirthdays.map(u => (
              <motion.div 
                key={u.id}
                whileHover={{ y: -5 }}
                className="relative bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-50 flex flex-col items-center text-center group hover:shadow-premium transition-all"
              >
                <div className="absolute top-6 right-6">
                   <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <Star className="w-5 h-5 fill-current" />
                   </div>
                </div>
                
                <div className="relative mb-6">
                  <UserAvatar imageUrl={u.image} name={u.name} size="xl" className="ring-8 ring-primary/5" />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gold-leeds rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg">
                    <Cake className="w-5 h-5" />
                  </div>
                </div>
                
                <h4 className="text-xl font-black text-gray-900 mb-1">{u.name}</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{u.branch?.name || 'Network-wide'}</p>
                
                <form action={createDirectMessage} className="w-full">
                  <input type="hidden" name="targetId" value={u.id} />
                  <input type="hidden" name="initialMessage" value={`Happy Birthday ${u.name}! 🎉\n\nWishing you a day filled with happiness, laughter, and all the things you love most. You’ve always been such a great friend, and I’m truly grateful for all the memories we’ve shared together.\n\nMay this year bring you new opportunities, good health, success, and countless moments of joy. Keep smiling, keep shining, and never stop being the amazing person you are.\n\nHave a fantastic birthday and an even more wonderful year ahead!`} />
                  <button type="submit" className="w-full py-4 bg-primary hover:bg-primary/95 text-white font-black rounded-[1.25rem] shadow-premium shadow-primary/20 transition-all text-sm flex items-center justify-center gap-3">
                    <MessageCircle className="w-5 h-5" /> Send Premium Wish
                  </button>
                </form>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── UPCOMING BIRTHDAYS ── */}
      <section className="space-y-8">
         <div className="px-1 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Upcoming <span className="text-primary">Celebrations</span></h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Save the dates for our Leeds family</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {upcomingBirthdays.length > 0 ? upcomingBirthdays.map(u => (
            <div key={u.id} className="group bg-white p-6 rounded-[2rem] shadow-soft border border-gray-50 flex items-center gap-5 hover:shadow-premium transition-all">
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(u.nextBirthday, 'MMM')}</span>
                <span className="text-xl font-black text-gray-900 leading-none group-hover:text-primary transition-colors">{format(u.nextBirthday, 'dd')}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <UserAvatar imageUrl={u.image} name={u.name} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">{u.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase truncate">
                      {u.daysLeft === 1 ? 'Tomorrow!' : `in ${u.daysLeft} days`}
                    </p>
                  </div>
                </div>
              </div>

              <form action={createDirectMessage}>
                <input type="hidden" name="targetId" value={u.id} />
                <input type="hidden" name="initialMessage" value={`Happy Birthday ${u.name}! 🎉\n\nWishing you a day filled with happiness, laughter, and all the things you love most. You’ve always been such a great friend, and I’m truly grateful for all the memories we’ve shared together.\n\nMay this year bring you new opportunities, good health, success, and countless moments of joy. Keep smiling, keep shining, and never stop being the amazing person you are.\n\nHave a fantastic birthday and an even more wonderful year ahead!`} />
                <button type="submit" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/5">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </form>
            </div>
          )) : (
            <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
               <User className="w-12 h-12 text-gray-100 mb-4" />
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No upcoming celebrations recorded</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
