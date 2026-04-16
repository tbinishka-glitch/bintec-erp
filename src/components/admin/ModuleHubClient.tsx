'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, Gauge, Activity, 
  Settings, Users, BookOpen, UserSquare2, 
  Wallet, GraduationCap, Clock, ShieldCheck,
  ChevronRight, Database, Megaphone, FileCheck,
  LayoutGrid, Zap, LayoutDashboard, CheckSquare,
  PartyPopper, FileCheck2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICON_MAP: Record<string, any> = {
  Megaphone: Megaphone,
  UserSquare2: UserSquare2,
  Wallet: Wallet,
  GraduationCap: GraduationCap,
  Users: Users,
  BookOpen: BookOpen,
  Clock: Clock,
  Database: Database,
  FileCheck: FileCheck,
  ShieldCheck: ShieldCheck
};

interface ModuleTool {
  title: string;
  desc: string;
  href: string;
  icon: any;
  badge?: string | number;
}

export function ModuleHubClient({ 
  module, 
  telemetry, 
  roleName 
}: { 
  module: any, 
  telemetry: any, 
  roleName: string 
}) {
  
  // Dynamic Tool Mapping based on Module Slug
  const getTools = (): ModuleTool[] => {
    switch (module.slug) {
      case 'hr':
        return [
          { title: 'Entity Registry', desc: 'Manage institutional employees and roles.', href: '/admin/users', icon: Users, badge: telemetry.staffCount },
          { title: 'Probation Center', desc: 'Governance of permanency transitions.', href: '/admin/probation', icon: Clock, badge: telemetry.probationCount },
          { title: 'Organizational Map', desc: 'Blueprint categories and sub-categories.', href: '/admin/categories', icon: Database, badge: telemetry.catCount },
          { title: 'Leave Policy', desc: 'Configure institutional leave structures.', href: '#', icon: FileCheck },
        ];
      case 'intranet':
        return [
          { title: 'Operational Dashboard', desc: 'Monitor recent activity, pending approvals, and engagement.', href: '/admin/intranet?tab=dashboard&standalone=true', icon: LayoutDashboard },
          { title: 'SOPs & Policies', desc: 'Official institutional structural documentation governance.', href: '/admin/intranet?tab=sops&standalone=true', icon: FileCheck2, badge: telemetry.sopCount },
          { title: 'Approval Queue', desc: 'Review and moderate pending intranet submissions.', href: '/admin/intranet?tab=approvals&standalone=true', icon: CheckSquare, badge: telemetry.pendingApprovals },
          { title: 'Announcement Center', desc: 'Broadcast news, system updates, and official notices.', href: '/admin/intranet?tab=announcements&standalone=true', icon: Megaphone, badge: telemetry.announceCount },
          { title: 'Celebration Manager', desc: 'Manage birthdays, anniversaries, and engagement posts.', href: '/admin/intranet?tab=celebrations&standalone=true', icon: PartyPopper, badge: telemetry.celebrationCount },
          { title: 'Intranet Citizenry', desc: 'Manage staff entities registered for intranet engagement.', href: '/admin/intranet?tab=citizenry&standalone=true', icon: Users, badge: telemetry.citizenCount },
          { title: 'Global Settings', desc: 'Configure intranet behavior, automation, and rules.', href: '/admin/intranet?tab=settings&standalone=true', icon: Settings },
        ];
      case 'finance':
        return [
          { title: 'Supplier Registry', desc: 'Manage institutional vendors and terms.', href: '#', icon: UserSquare2, badge: telemetry.supplierCount },
          { title: 'Transaction Stream', desc: 'Real-time BI financial telemetry.', href: '#', icon: Wallet, badge: telemetry.transactionCount },
          { title: 'Budget Control', desc: 'Define and monitor departmental caps.', href: '#', icon: Gauge },
        ];
      case 'school':
        return [
          { title: 'Student Governance', desc: 'Manage learner profiles and records.', href: '#', icon: GraduationCap, badge: telemetry.studentCount },
          { title: 'Parent Linker', desc: 'Associate students with verified parents.', href: '#', icon: Users, badge: telemetry.parentCount },
          { title: 'Grade Registry', desc: 'Manage grade levels and sections.', href: '#', icon: Database, badge: telemetry.gradeCount },
        ];
      default:
        return [];
    }
  };

  const tools = getTools();
  const Icon = ICON_MAP[module.icon] || LayoutGrid;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-12 pb-32">
      
      {/* ── BREADCRUMBS ── */}
      <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <Link href="/admin" className="hover:text-primary transition-colors">Elite Command</Link>
        <ChevronRight size={12} className="opacity-40" />
        <span className="text-slate-800">Functional Hubs</span>
        <ChevronRight size={12} className="opacity-40" />
        <span className="text-primary">{module.name}</span>
      </nav>

      {/* ── MODULE HEADER ── */}
      {module.slug === 'intranet' ? (
        <Link href="/admin/intranet" className="group block">
          <motion.header 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[4rem] bg-slate-900 shadow-2xl border border-white/5 p-12 md:p-16"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
               <Icon size={200} className="text-white" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
               {/* Icon & Title */}
               <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-blue-600 shadow-2xl shadow-blue-600/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                     <LayoutGrid size={48} />
                  </div>
                  <div className="text-center md:text-left space-y-3">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">
                        <Zap size={11} className="fill-blue-300" /> Administrative Priority
                     </div>
                     <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Intranet <span className="text-blue-400">Master Hub</span>
                     </h1>
                     <p className="text-sm md:text-base text-slate-400 font-medium max-w-xl leading-relaxed">
                        The centralized nerve center for institutional publishing, SOP governance, content moderation, and engagement analytics.
                     </p>
                  </div>
               </div>

               {/* Integrated Telemetry & Action */}
               <div className="flex flex-wrap items-center justify-center gap-4 lg:ml-auto">
                 {Object.entries(telemetry).map(([key, val]: any) => (
                   <div key={key} className="bg-white/5 border border-white/10 backdrop-blur-md px-6 py-4 rounded-3xl text-center min-w-[110px]">
                      <p className="text-2xl font-black text-blue-400 leading-none mb-1">{val}</p>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{key.replace('Count', '')}</p>
                   </div>
                 ))}
                 <div className="bg-blue-600 text-white p-6 rounded-full group-hover:translate-x-2 transition-transform duration-500 shadow-lg ml-6 hidden xl:flex">
                    <ArrowRight size={24} />
                 </div>
               </div>
            </div>
          </motion.header>
        </Link>
      ) : (
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2.5rem] bg-white border border-slate-200 shadow-premium flex items-center justify-center text-primary transform -rotate-3">
               <Icon size={36} />
            </div>
            <div className="space-y-1">
               <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
                 {module.name.replace(' Hub', '')} <span className="text-primary">Hub</span>
               </h1>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{module.description}</p>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="flex gap-6">
             {Object.entries(telemetry).map(([key, val]: any) => (
               <div key={key} className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-soft text-center min-w-[140px]">
                  <p className="text-2xl font-black text-primary leading-none mb-1">{val}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{key.replace('Count', '')}</p>
               </div>
             ))}
          </div>
        </header>
      )}

      {/* ── COMMAND GRID ── */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-[0.1em]">
            {module.slug === 'intranet' ? (
              <>Intranet <span className="text-primary">Master Hub</span></>
            ) : (
              <>Administrative <span className="text-primary">Ordnance</span></>
            )}
          </h3>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Authorized Personal Only</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link key={tool.title} href={tool.href} className="group">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[3rem] shadow-premium border border-slate-100 flex flex-col gap-8 group-hover:shadow-2xl group-hover:border-primary/20 transition-all h-full relative overflow-hidden"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                    <tool.icon size={20} />
                  </div>
                  {tool.badge !== undefined && (
                    <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full shadow-lg">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-2 relative z-10">
                   <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{tool.title}</h4>
                   <p className="text-xs text-slate-400 font-semibold leading-relaxed line-clamp-2">{tool.desc}</p>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary transition-colors relative z-10">
                   Activate Control <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}

          {/* ADD MORE FUTURE PLACEHOLDER */}
          {module.slug !== 'intranet' && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help select-none">
               <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                 <Settings size={20} />
               </div>
               <div className="space-y-1">
                 <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Future Capacity</p>
                 <p className="text-[10px] font-bold text-slate-400 leading-tight">Modular framework ready for functional expansion.</p>
               </div>
            </div>
          )}
        </div>
      </section>

      {/* ── MODULE POLICIES (FOOTER) ── */}
      <footer className="pt-20 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
         <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-slate-200" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Hub Policy Governance V3</p>
         </div>
         <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest underline cursor-help">Technical Documentation</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest underline cursor-help">Access Log Archive</span>
         </div>
      </footer>

    </div>
  );
}
