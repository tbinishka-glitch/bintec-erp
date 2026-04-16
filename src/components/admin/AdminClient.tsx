'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, ArrowUpRight, Clock, AlertCircle, BookOpen,
  Crown, Lock, Building2, Users, ShieldAlert, BarChart3,
  TrendingUp, Settings, BellRing, Globe2, HardDrive, Paintbrush,
  Zap, ChevronRight, Layers, Database, Trash2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICON_MAP: Record<string, any> = {
  Users: require('lucide-react').Users,
  Building: require('lucide-react').Building,
  Megaphone: require('lucide-react').Megaphone,
  BookOpen: require('lucide-react').BookOpen,
  ShieldCheck: require('lucide-react').ShieldCheck,
  ShieldAlert: require('lucide-react').ShieldAlert,
  MessageSquare: require('lucide-react').MessageSquare,
  Video: require('lucide-react').Video,
  FileCheck: require('lucide-react').FileCheck,
  UserSquare2: require('lucide-react').UserSquare2,
  Wallet: require('lucide-react').Wallet,
  GraduationCap: require('lucide-react').GraduationCap,
  Truck: require('lucide-react').Truck,
  Palette: require('lucide-react').Palette,
  Clock: require('lucide-react').Clock,
  Database: require('lucide-react').Database,
  LayoutDashboard: require('lucide-react').LayoutDashboard,
  AlertCircle: require('lucide-react').AlertCircle,
};

// ── SUPER ADMIN CONTROL DEFINITIONS ──
const SUPER_ADMIN_CONTROLS = [
  {
    title: 'Company Management',
    desc: 'Multi-tenant company provisioning and organizational hierarchy.',
    href: '/admin/super/companies',
    icon: Building2,
    tag: 'Organizations',
  },
  {
    title: 'Advanced Branch Mgmt',
    desc: 'Global branch configuration, network topology, and sovereignty rules.',
    href: '/admin/super/branches',
    icon: Layers,
    tag: 'Infrastructure',
  },
  {
    title: 'Full User Controls',
    desc: 'Deep personnel administration: mass operations, entity merging, force resets.',
    href: '/admin/super/users',
    icon: Users,
    tag: 'Personnel',
  },
  {
    title: 'RBAC Engine',
    desc: 'Full 6-factor permission matrix editor across all roles and modules.',
    href: '/admin/super/rbac',
    icon: ShieldAlert,
    tag: 'Security',
  },
  {
    title: 'Admin Promotion/Demotion',
    desc: 'Grant or revoke elevated admin roles with a full governance audit trail.',
    href: '/admin/super/promotions',
    icon: TrendingUp,
    tag: 'Governance',
  },
  {
    title: 'Module Activation',
    desc: 'Activate, suspend, or configure all functional ERP modules globally.',
    href: '/admin/super/modules',
    icon: Zap,
    tag: 'ERP',
  },
  {
    title: 'Subscription & Packages',
    desc: 'Manage licensing tiers, feature entitlements, and billing cycles.',
    href: '/admin/super/subscriptions',
    icon: BarChart3,
    tag: 'Billing',
  },
  {
    title: 'Full Audit & Telemetry',
    desc: 'Complete system-wide action logs, anomaly detection, and compliance exports.',
    href: '/admin/super/telemetry',
    icon: ShieldCheck,
    tag: 'Compliance',
  },
  {
    title: 'Workflow Engine',
    desc: 'Design approval chains, auto-escalations, and SLA-enforced workflows.',
    href: '/admin/super/workflows',
    icon: Globe2,
    tag: 'Automation',
  },
  {
    title: 'System-Wide Settings',
    desc: 'Global configuration: localization, security policies, feature flags.',
    href: '/admin/super/settings',
    icon: Settings,
    tag: 'Config',
  },
  {
    title: 'Notification Rules',
    desc: 'Craft rule-based notification engines with multi-channel delivery control.',
    href: '/admin/super/notifications',
    icon: BellRing,
    tag: 'Comms',
  },
  {
    title: 'API & Integrations',
    desc: 'Manage API keys, webhooks, and third-party integration credentials.',
    href: '/admin/super/api',
    icon: Database,
    tag: 'Integrations',
  },
  {
    title: 'Backup & Restore',
    desc: 'Schedule snapshots, restore from checkpoints, and manage disaster recovery.',
    href: '/admin/super/backups',
    icon: HardDrive,
    tag: 'Recovery',
  },
  {
    title: 'Branding & White-label',
    desc: 'Custom logos, color palettes, domains, and per-tenant UI theming.',
    href: '/admin/super/branding',
    icon: Paintbrush,
    tag: 'Identity',
  },
  {
    title: 'System Trash Bin',
    desc: 'Secure recovery and permanent deletion of system identity entities.',
    href: '/admin/super/trash',
    icon: Trash2,
    tag: 'Data',
  },
];

const containerVariants: import('framer-motion').Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const cardVariants: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function AdminClient({
  coreModules,
  functionalModules,
  roleName,
  alertCount,
  auditLogs = [],
  isSuperAdmin = false,
}: {
  coreModules: any[];
  functionalModules: any[];
  roleName: string;
  alertCount: number;
  auditLogs?: any[];
  isSuperAdmin?: boolean;
}) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto px-6 pb-24 space-y-16">

      {/* ── CENTRAL HUD: SYSTEM TELEMETRY ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[3rem] bg-slate-900 text-white overflow-hidden shadow-2xl border border-white/5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,45,130,0.3),transparent)]" />
        {isSuperAdmin && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.12),transparent)]" />
        )}

        <div className="relative py-12 md:py-16 px-10 md:px-14 z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-2xl text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 group">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase italic">Elite <span className="text-primary-400">Command</span></h1>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">ERP Control Tower · Master Governance</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary-300">
                {roleName} Authorization
              </span>
              <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">
                System Online
              </span>
              {isSuperAdmin && (
                <span className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                  <Crown size={11} /> Sovereign Access
                </span>
              )}
              {alertCount > 0 && (
                <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <AlertCircle size={12} /> {alertCount} Alerts
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-8 w-full lg:w-auto">
            {[
              { label: 'Latency', val: '12ms', color: 'text-emerald-400' },
              { label: 'Modules', val: functionalModules.length, color: 'text-primary-300' },
              { label: 'Uptime', val: '100%', color: 'text-emerald-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
                <p className={cn('text-2xl font-black tracking-tight', stat.color)}>{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── SUPER ADMIN CONTROL CENTER (SOVEREIGN LAYER) ── */}
      <AnimatePresence>
        {isSuperAdmin && (
          <motion.section
            key="super-admin-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-10"
          >
            {/* Section Header */}
            <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 border border-red-900/40 shadow-2xl shadow-red-950/30 px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(239,68,68,0.18),transparent_60%)]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwaDM2djM2aC0xOGMwLTkuOTQgOC4wNi0xOCAxOC0xOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
              <div className="relative flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-800 flex items-center justify-center shadow-2xl shadow-red-900/60">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                      Super Admin <span className="text-red-400">Control Center</span>
                    </h2>
                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-[9px] font-black uppercase tracking-widest text-red-300 flex items-center gap-1.5">
                      <Lock size={9} /> Sovereign Only
                    </span>
                  </div>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">
                    Absolute Governance Layer — Full System Sovereignty
                  </p>
                </div>
              </div>
              <div className="relative text-[10px] font-black uppercase tracking-widest text-red-400/60 text-right hidden md:block">
                14 Power Controls<br />
                <span className="text-white/20">Active</span>
              </div>
            </div>

            {/* Super Admin Cards Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {SUPER_ADMIN_CONTROLS.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.href} variants={cardVariants}>
                    <Link href={item.href} className="group block h-full">
                      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-[2rem] border border-red-900/20 hover:border-red-600/50 flex flex-col gap-5 h-full shadow-xl hover:shadow-red-900/20 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        {/* Subtle glow on hover */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.06),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Tag pill */}
                        <div className="relative flex items-center justify-between">
                          <div className="w-11 h-11 rounded-xl bg-red-950/60 border border-red-900/30 flex items-center justify-center text-red-400 group-hover:bg-red-700 group-hover:text-white group-hover:border-red-600 transition-all duration-400 shadow-inner">
                            <Icon size={18} />
                          </div>
                          <span className="px-2.5 py-1 bg-red-950/50 border border-red-900/30 rounded-full text-[8px] font-black uppercase tracking-widest text-red-400/80">
                            {item.tag}
                          </span>
                        </div>

                        <div className="relative space-y-1.5 flex-1">
                          <h4 className="text-sm font-black text-white leading-tight tracking-tight group-hover:text-red-300 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                            {item.desc}
                          </p>
                        </div>

                        <div className="relative mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-red-500 transition-colors">
                          Enter Control
                          <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* ── LEFT COLUMN: CONTROL STACK ── */}
        <div className="xl:col-span-12 space-y-16">

          {/* LAYER 1: CORE SYSTEM ADMINISTRATION */}
          <section className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  Core <span className="text-primary italic">System</span> Control
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Institutional Infrastructure Governance (Layer 1)</p>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {coreModules.map((item) => {
                const Icon = ICON_MAP[item.icon] || BookOpen;
                return (
                  <motion.div key={item.title} variants={cardVariants} className="flex flex-col">
                    <Link href={item.href} className="group flex-1">
                      <div className="bg-white p-7 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col gap-6 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] group-hover:border-primary/20 transition-all h-full relative">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                          <Icon size={20} />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-black text-slate-900 leading-tight">{item.title}</h4>
                            {item.badge !== undefined && (
                              <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-semibold">{item.desc}</p>
                        </div>

                        <div className="mt-auto pt-5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary transition-colors">
                          Authorized Entry <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>

                    {/* Advanced Controls redirect button — Super Admin only */}
                    {item.advancedHref && (
                      <Link
                        href={item.advancedHref}
                        className="mt-2 group flex items-center justify-between px-5 py-3 bg-gradient-to-r from-red-950/80 to-slate-900/90 border border-red-900/30 hover:border-red-600/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400/70 hover:text-red-300 transition-all duration-300 shadow-md"
                      >
                        <span className="flex items-center gap-2">
                          <Crown size={10} />
                          Advanced Controls
                        </span>
                        <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* LAYER 2: MODULAR ERP HUB */}
          <section className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  Modular <span className="text-primary italic">ERP Hub</span>
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Functional Business Verticals (Layer 2)</p>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {functionalModules.map((item) => {
                const Icon = ICON_MAP[item.icon] || BookOpen;
                return (
                  <motion.div key={item.slug} variants={cardVariants}>
                    <Link href={`/admin/modules/${item.slug}`} className="group block h-full">
                      <div className="bg-white p-7 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col gap-6 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] group-hover:border-primary/20 transition-all h-full relative">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                            <Icon size={20} />
                          </div>
                          <div className={cn(
                            'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5',
                            item.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          )}>
                            <div className={cn('w-1 h-1 rounded-full', item.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400')} />
                            {item.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-lg font-black text-slate-900 leading-tight">{item.name}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-semibold line-clamp-2">{item.description}</p>
                        </div>

                        <div className="mt-auto pt-5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary transition-colors">
                          Module Config <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* LAYER 3: GLOBAL ACTIVITY STREAM */}
          <section className="space-y-10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                Institutional <span className="text-primary italic">Audit</span> Stream
              </h3>
              <Link href="/admin/audit-logs" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                View Historical Logs
              </Link>
            </div>

            <div className="bg-white rounded-[3rem] shadow-premium border border-slate-50 overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-slate-50">
                {auditLogs.slice(0, 8).map((log: any) => (
                  <div key={log.id} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Clock size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wide">{log.user.name}</span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0 tracking-tighter">— {new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium truncate">
                        Performed <span className="text-primary font-bold italic uppercase mx-1">{log.action}</span> on {log.entity}
                      </p>
                    </div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">
                      TELEMETRY RECORDED
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>

    </div>
  );
}
