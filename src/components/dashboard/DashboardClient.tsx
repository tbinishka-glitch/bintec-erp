'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { 
  Megaphone, MessageCircle, Video, Star, BookOpen, 
  Heart, Bell, ChevronRight, Gift, User, 
  HeartIcon, MessageSquare, Share2, Plus, ArrowRight,
  ExternalLink, Calendar, Sparkles
} from 'lucide-react';
import { CustomHeart } from '@/components/ui/CustomHeart';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createDirectMessage } from '@/app/chat/actions';
import { CelebrationPopup } from '@/components/celebrations/CelebrationPopup';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function DashboardClient({
  user,
  announcements,
  upcomingBirthdays,
  upcomingAnniversaries,
  articles,
  recentAwards,
  stats,
  newTeamMembers,
  celebrationPopup = null
}: {
  user: any,
  announcements: any[],
  upcomingBirthdays: any[],
  upcomingAnniversaries: any[],
  articles: any[],
  recentAwards: any[],
  stats: any,
  newTeamMembers: any[],
  celebrationPopup?: any
}) {
  const firstName = (() => {
    if (!user?.name) return 'there';
    const parts = user.name.split(' ');
    // Skip common salutations (Mr., Ms., Mrs., Dr., Prof., etc.)
    const salutations = ['Mr.', 'Mr', 'Ms.', 'Ms', 'Mrs.', 'Mrs', 'Dr.', 'Dr', 'Prof.', 'Prof', 'Hon.', 'Rev.', 'Ven.'];
    const filteredParts = parts.filter((p: string) => !salutations.includes(p));
    return filteredParts[0] || 'there';
  })();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { label: 'Luminous Morning', color: 'text-gold-leeds' };
    if (hour < 17) return { label: 'Radiant Afternoon', color: 'text-gold-leeds' };
    return { label: 'Serene Evening', color: 'text-white' };
  };

  const greeting = getGreeting();
  
  // Grouping Birthdays
  const todayBirthdays = upcomingBirthdays.slice(0, 3);
  const nextBirthdays = upcomingBirthdays.slice(3, 5);

  return (
    <div className="max-w-[1600px] mx-auto px-8 pb-12 space-y-10">
      
      {/* ── 1. HERO SECTION (FULL WIDTH) ── */}
      <div className="bg-white p-1 rounded-[2.5rem] border border-gray-100 shadow-premium">
        <div className="relative rounded-[2.4rem] bg-gray-50 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <Image 
              src="/hero_photo.jpg" 
              alt="Team working together" 
              fill 
              className="object-cover object-[center_30%]"
            />
            {/* Neutral Dark Overlay for text readability (Removing purple grading) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          </div>

          <div className="relative py-6 md:py-10 px-10 md:px-14 z-10 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <span className={cn("inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 shadow-sm", greeting.color)}>
                {greeting.label}
              </span>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white/60">
                <Megaphone size={14} className="text-gold-leeds" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Leeds Connect Hub</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white leading-[1.1]">
              Welcome back, <br />
              <span className="text-gold-leeds">{firstName}.</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 font-medium mb-2 leading-relaxed max-w-lg">
              You have <span className="text-white font-bold">{stats.birthdayTodayCount || 0} birthday celebrations</span>, <span className="text-white font-bold">{stats.unreadNotifs || 0} notifications</span>, and <span className="text-white font-bold">{articles.length} new articles</span> to read.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. PARALLEL GRID (CENTERPIECE) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        
        {/* A. TODAY'S BIRTH DAY CELEBRATIONS */}
        <section className="space-y-6">
          <h2 className="text-xl font-black tracking-tight px-1 text-black">
            <span className="text-primary">Todays</span> <span className="text-gold-leeds">Birth Day</span> Celebrations
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {todayBirthdays.map((u, i) => (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.05, translateY: -5 }}
                className="relative bg-white rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(90,45,130,0.25)] border border-gray-100/50 flex flex-col items-center justify-center p-8 text-center group transition-all duration-400"
              >
                <div className="relative mb-6">
                  <UserAvatar imageUrl={u.image} name={u.name} size="2xl" className="ring-8 ring-gold-leeds" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white border-4 border-white shadow-md">
                    <Gift className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-1 w-full">
                  <p className="text-sm font-black text-gray-900 truncate">{u.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">HBOI Member</p>
                </div>

                <form action={createDirectMessage} className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <input type="hidden" name="targetId" value={u.id} />
                  <input type="hidden" name="initialMessage" value={`Happy Birthday ${u.name}! 🎉\n\nWishing you a day filled with happiness, laughter, and all the things you love most.`} />
                  <button type="submit" className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-premium hover:shadow-primary-premium group/btn">
                    <MessageCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </form>
              </motion.div>
            ))}
            {todayBirthdays.length === 0 && (
              <div className="p-12 border-2 border-dashed border-gray-100 rounded-[3rem] text-center text-gray-300 font-bold text-sm bg-gray-50/50">
                No celebrations today
              </div>
            )}
          </div>
        </section>

        {/* B. UPCOMING CELEBRATIONS (Birthdays & Anniversaries) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pr-2">
            <h2 className="text-xl font-black tracking-tight px-1 text-black">
              <span className="text-primary">up Coming</span> <span className="text-gold-leeds">Celebrations</span>
            </h2>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/20">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {/* Combine next birthdays and all anniversaries */}
            {[...nextBirthdays.map(u => ({ ...u, celebrType: 'BIRTHDAY' })), 
              ...upcomingAnniversaries.map(u => ({ ...u, celebrType: 'ANNIVERSARY' }))
            ].map((u, i) => (
              <motion.div 
                key={`${u.id}-${u.celebrType}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.05, translateY: -5 }}
                className="relative bg-white rounded-[3rem] shadow-[0_15px_40px_-12px_rgba(90,45,130,0.15)] border border-gray-50 flex flex-col items-center justify-center p-8 text-center group transition-all duration-400"
              >
                <div className="relative mb-6">
                  <UserAvatar imageUrl={u.image} name={u.name} size="2xl" className={u.celebrType === 'ANNIVERSARY' ? 'ring-8 ring-blue-500' : 'ring-8 ring-gold-leeds'} />
                  <div className="absolute -top-2 -left-2 bg-gray-50 px-3 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                      {format(new Date(u.celebrType === 'BIRTHDAY' ? u.dateOfBirth! : u.joinedDate!), 'MMM')}
                    </span>
                    <span className="text-sm font-black text-gray-900 leading-none">
                      {format(new Date(u.celebrType === 'BIRTHDAY' ? u.dateOfBirth! : u.joinedDate!), 'dd')}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1 w-full">
                  <p className="text-sm font-black text-gray-900 truncate">{u.name}</p>
                  <p className={cn("text-[10px] font-bold uppercase leading-none", u.celebrType === 'ANNIVERSARY' ? 'text-blue-600' : 'text-gray-400')}>
                    {u.celebrType === 'ANNIVERSARY' ? `${u.years} Year Anniversary! 🎊` : 'Team Member'}
                  </p>
                </div>
                
                <form action={createDirectMessage} className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <input type="hidden" name="targetId" value={u.id} />
                  <input type="hidden" name="initialMessage" value={u.celebrType === 'ANNIVERSARY' 
                    ? `Congratulations on your ${u.years} year anniversary at Leeds, ${u.name}! 🎉`
                    : `Happy Birthday ${u.name}! 🎉`
                  } />
                  <button type="submit" className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-premium hover:shadow-primary-premium group/btn">
                    <MessageCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </form>
              </motion.div>
            ))}
          </div>
        </section>

        {/* C. WELCOME TO LEEDS FAMILY (Interactive Grid) */}
        <section className="space-y-6">
          <h2 className="text-xl font-black tracking-tight px-1">
            <span className="text-primary">Welcome to</span> <span className="text-gold-leeds">Leeds</span> <span className="text-black">Family</span>
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {newTeamMembers.map((starter, i) => {
              const deptOrRole = [
                starter.role?.name,
                starter.department?.name,
                starter.designation
              ].filter(Boolean).join(' - ') || 'New Team Member';

              return (
                <motion.div 
                  key={starter.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.05, translateY: -5 }}
                  className="relative bg-white rounded-[3rem] shadow-[0_25px_70px_-15px_rgba(169,139,68,0.25)] border border-gray-100/50 flex flex-col items-center justify-center p-8 text-center group transition-all duration-400"
                >
                  <div className="relative mb-6">
                    <UserAvatar imageUrl={starter.image} name={starter.name} size="2xl" className="ring-8 ring-gold-leeds" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gold-leeds rounded-full flex items-center justify-center text-white border-4 border-white shadow-md">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  
                  <div className="space-y-1 w-full">
                    <p className="text-sm font-black text-gray-900 truncate">{starter.name}</p>
                    <p className="text-[10px] font-bold text-gold-leeds uppercase tracking-tight line-clamp-1 h-4">
                      {deptOrRole}
                    </p>
                  </div>

                  {/* Congratulate/Wish Button */}
                  <form action={createDirectMessage} className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <input type="hidden" name="targetId" value={starter.id} />
                    <input type="hidden" name="initialMessage" value={`Welcome to the Leeds Family, ${(() => {
                      const parts = starter.name?.split(' ') || [];
                      // If name has at least two parts (e.g. "Ms. Kinithi"), use both.
                      return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : (starter.name || 'Member');
                    })()}! 🎉\n\nWe are absolutely thrilled to have you join us. Wishing you a fantastic start and an incredible journey ahead with the team!\n\nIf you need anything while settling in, feel free to reach out.`} />
                    <button type="submit" className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-premium hover:shadow-gold-premium group/btn">
                      <MessageCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </form>
                </motion.div>
              );
            })}
          </div>
          {newTeamMembers.length === 0 && (
            <div className="p-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center text-gray-300 font-bold text-sm bg-gray-50/50">
              No new members this week
            </div>
          )}
        </section>
      </div>


      {/* ── 4. Main Grid for Articles and News ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-12 space-y-12">
          {/* RECENT ARTICLES */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">
                  <span className="text-primary">Recent</span> <span className="text-gold-leeds">Knowledge</span> <span className="text-black">Articles</span>
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Curated from the Knowledge Hub</p>
              </div>
              <Link href="/intranet/knowledge" className="text-xs font-bold text-primary hover:text-gold-leeds transition-colors flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100">
                View Repository <ExternalLink className="w-3.5 h-3.5" />
              </Link>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.map((article, idx) => (
                <motion.div 
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx }}
                  className="group flex flex-col p-6 rounded-[3rem] bg-white shadow-soft border border-gray-50 hover:shadow-premium hover:border-primary/10 transition-all duration-500"
                >
                  <div className="w-full h-44 rounded-[2.2rem] overflow-hidden relative mb-6 bg-gray-100">
                    <img 
                      src={article.imageUrl || '/images/placeholder-knowledge.jpg'} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-4 py-1.5 rounded-full backdrop-blur-md border text-[9px] font-black uppercase tracking-widest ${
                        article.documentType === 'Policy' ? 'bg-primary/20 text-primary border-primary/20' : 
                        article.documentType === 'SOP' ? 'bg-black/20 text-black border-black/20' : 
                        'bg-gold-leeds/20 text-gold-leeds border-gold-leeds/20'
                      }`}>
                        {article.documentType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-[9px] font-black text-gold-leeds uppercase tracking-[0.2em] mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      {article.mainCategory || 'Knowledge Hub'}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 line-clamp-2 mb-6 leading-relaxed flex-1 italic opacity-80">
                      {article.content}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
                          <CustomHeart size={14} /> {article.reactions?.length || 0}
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-gold-leeds transition-colors cursor-default">
                          <MessageCircle className="w-3.5 h-3.5" /> {article.comments?.length || 0}
                        </span>
                      </div>
                      <Link href={`/intranet/knowledge`} className="flex items-center gap-2 py-3 px-6 bg-primary/5 text-primary rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                        Read <ArrowRight className="w-4 h-4" />
                      </Link>

                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* NEWS FEED */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">
                  <span className="text-primary">Leeds</span> <span className="text-gold-leeds">News</span> <span className="text-black">Feed</span>
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Leeds community live</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-primary transition-all">
                <Plus className="w-4 h-4 text-gold-leeds" /> New Post
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {announcements.slice(0, 4).map((post, idx) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className="p-10 rounded-[2.5rem] bg-white shadow-[0_30px_70px_-15px_rgba(0,0,0,0.06)] flex flex-col gap-6 border border-transparent hover:border-primary/15 transition-all hover:shadow-[0_40px_90px_-20px_rgba(90,45,130,0.15)]"
                >
                  <div className="flex items-center gap-4">
                    <UserAvatar 
                      imageUrl={post.author.image} 
                      name={post.author.name} 
                      size="md" 
                      className="ring-4 ring-gray-50"
                    />
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{post.author.name}</h4>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {format(new Date(post.createdAt), 'MMMM dd')} · 
                        {post.isPinned ? ' Pinned' : ' Status'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 px-1">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                    <button className="flex items-center gap-2 text-[11px] font-black text-gray-400 hover:text-rose-500 transition-colors uppercase tracking-widest">
                      <CustomHeart size={16} /> Like
                    </button>
                    <button className="flex items-center gap-2 text-[11px] font-black text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">
                      <MessageSquare className="w-4 h-4" /> Comment
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-24 pb-12 flex flex-col items-center text-center gap-8 border-t border-gray-100 pt-16">
        <div className="flex items-center gap-4">
           <div className="w-16 h-px bg-gray-100" />
           <div className="flex items-center gap-4 font-black text-sm uppercase tracking-[0.4em]">
             <Image src="/logo.png" alt="Logo" width={32} height={32} />
             <span className="text-primary">LEEDS</span><span className="text-gold-leeds">CONNECT</span><span className="text-black">®</span>
           </div>
           <div className="w-16 h-px bg-gray-100" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-black text-primary-900 uppercase tracking-widest leading-relaxed">
            All rights reserved | IT Department Leeds International School
          </p>
          <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em]">
            Developed by BinTec Solutions
          </p>
        </div>
      </footer>
    </div>
  );
}
