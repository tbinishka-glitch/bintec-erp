'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, Building, Megaphone, ShieldCheck, 
  ChevronRight, ArrowUpRight, Activity, Clock,
  TrendingUp, Wallet, ArrowRight, BookOpen,
  UserCheck, AlertCircle, BarChart3, LineChart as LucideLineChart
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend
} from 'recharts';
import Image from 'next/image';

const COLORS = ['#7C3AED', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const ICON_MAP: Record<string, any> = {
  Users: Users,
  Building: Building,
  Megaphone: Megaphone,
  Briefcase: require('lucide-react').Briefcase,
  ShieldCheck: ShieldCheck,
  Wallet: Wallet,
  Activity: Activity
};

interface IntelligenceData {
  stats: any[];
  financeReports: any[];
  categoryReports: any[];
  branchReports: any[];
  attendanceReports: any[];
  user: {
    name: string;
    role: string;
  };
}

export function IntelligenceCenterClient({ data }: { data: IntelligenceData }) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen animate-pulse bg-slate-50" />;

  const { stats, financeReports, categoryReports, branchReports, attendanceReports, user } = data;

  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin'].includes(user.role);

  return (
    <div className="flex-1 space-y-10 p-10 pb-24 bg-[#F8F9FC] min-h-screen overflow-y-auto no-scrollbar">
      
      {/* ── CINEMATIC INTEL HERO ── */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary via-indigo-900 to-black p-12 text-white shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 transform translate-x-20">
          <Image src="/logo.png" alt="Leeds" width={500} height={500} className="object-cover grayscale" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-end justify-between gap-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
              <Activity size={14} className="text-primary animate-pulse" />
              <span>Institutional Intelligence Hub</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-5xl font-black tracking-tight leading-tight">
                System <span className="text-white/80">Snapshot</span>
              </h1>
              <p className="text-lg text-white/60 font-medium max-w-xl">
                Real-time operational telemetry across the Leeds International network.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Link 
                href="/intranet" 
                className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-xl flex items-center gap-3"
              >
                Access Intranet
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Actionable Alerts Bar */}
          {isAdmin && (
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md space-y-4 min-w-[300px]">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Sovereignty Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">System Health</span>
                  <span className="text-xs text-emerald-400 font-bold">OPTIMUM</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[98%] h-full bg-emerald-500 rounded-full" />
                </div>
                <p className="text-[9px] text-white/40 italic">Aggregated data from {stats[1]?.value || 0} branches.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DYNAMIC METRICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = ICON_MAP[stat.icon] || BookOpen;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={stat.label} 
              className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-gray-50 flex items-center justify-between group hover:border-primary/20 transition-all"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-black">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                <Icon size={24} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── INTELLIGENCE ANALYTICS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Financial Pulse (Restricted) */}
        {isAdmin && (
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-premium border border-gray-50 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <Wallet className="text-primary" /> Financial <span className="text-primary">Pulse</span>
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed mt-1">Income vs Expenditure Trends (Sample Hub Data)</p>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                   <TrendingUp size={14} /> Healthy
                 </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financeReports} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <ReTooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '1.5rem' }}
                  />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="income" stroke="#7C3AED" strokeWidth={4} dot={{ r: 6, fill: '#7C3AED', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={4} strokeDasharray="8 8" dot={{ r: 6, fill: '#EF4444', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Branch Presence (Donut) */}
        <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-gray-50 flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight text-center">Regional <span className="text-gold-leeds">Presence</span></h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mt-1 text-balance">Personnel concentration by branch</p>
          </div>

          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branchReports}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {branchReports.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-black leading-none">{stats[1]?.value || 0}</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Branches</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {branchReports.slice(0, 6).map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[9px] font-black uppercase text-gray-500 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Telemetry (Bar) */}
        <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-gray-50 flex flex-col gap-8">
           <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Staff <span className="text-emerald-500">Presence</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed mt-1">Average Attendance (Last 7 Days)</p>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceReports} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 800 }} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} />
                  <ReTooltip />
                  <Bar dataKey="rate" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                   <UserCheck size={20} />
                 </div>
                 <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Stability</p>
                   <p className="text-sm font-black text-black">94.8% <span className="text-[10px] text-emerald-500 ml-1">↑ 2.1%</span></p>
                 </div>
               </div>
            </div>
        </div>

        {/* Category Intelligence (Bar) */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-premium border border-gray-50 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Category <span className="text-indigo-500">Intelligence</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed mt-1">Staff distribution by professional segment</p>
            </div>
            <Link href="/admin/categories" className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-all">
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryReports} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 800 }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} />
                <ReTooltip />
                <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── BROADCAST GATEWAY ── */}
      <div className="bg-white rounded-[3rem] shadow-premium border border-gray-50 p-12 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="lg:w-1/3 space-y-4">
          <div className="w-16 h-16 rounded-[2rem] bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
            <Megaphone size={32} />
          </div>
          <h2 className="text-3xl font-black text-black tracking-tight leading-none uppercase">Institutional <br /><span className="text-primary">Briefings</span></h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">Access the latest corporate announcements and strategic transmissions from Global HQ.</p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Link href="/intranet/announcements" className="group p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-premium transition-all">
            <div className="flex items-center justify-between mb-4">
               <span className="px-3 py-1 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full">Urgent</span>
               <ArrowUpRight size={16} className="text-slate-300 group-hover:text-primary transition-all" />
            </div>
            <h4 className="text-base font-black text-black mb-2 leading-tight">Annual Intelligence Review 2026</h4>
            <p className="text-xs text-slate-400 line-clamp-2">Scheduled for next month. Please ensure all regional leads prepare their departmental audits.</p>
          </Link>
          
          <Link href="/intranet/announcements" className="group p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-premium transition-all">
            <div className="flex items-center justify-between mb-4">
               <span className="px-3 py-1 bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full">Broadcast</span>
               <ArrowUpRight size={16} className="text-slate-300 group-hover:text-primary transition-all" />
            </div>
            <h4 className="text-base font-black text-black mb-2 leading-tight">New Leadership Portal Live</h4>
            <p className="text-xs text-slate-400 line-clamp-2">The Leadership Hub is now operational. All verified executives can access the scorecard module.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
