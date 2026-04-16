'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Megaphone, Users, BookOpen, Heart,
  Settings, GraduationCap, ClipboardCheck, 
  Truck, ShoppingCart, Briefcase, BarChart3, 
  Database, FileText, UserSquare2, Wallet, 
  ChevronRight, ArrowLeftRight
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const erpModules = [
  { name: 'Dashboard',   href: '/',              icon: LayoutDashboard, color: 'text-primary' },
  { name: 'Intranet',    href: '/intranet/announcements', icon: Megaphone,   color: 'text-purple-600' },
  { name: 'HRM',         href: '/hr',            icon: UserSquare2,   color: 'text-rose-600' },
  { name: 'Students',    href: '/school-management', icon: GraduationCap, color: 'text-amber-600' },
  { name: 'Exams',       href: '/examination',   icon: FileText,      color: 'text-indigo-600' },
  { name: 'Attendance',  href: '/attendance',    icon: ClipboardCheck, color: 'text-emerald-600' },
  { name: 'Finance',     href: '/finance',       icon: Wallet,        color: 'text-cyan-600' },
  { name: 'Procurement', href: '/procurement',   icon: ShoppingCart,  color: 'text-orange-600' },
  { name: 'Assets',      href: '/assets',        icon: Briefcase,     color: 'text-slate-600' },
  { name: 'Transport',   href: '/transport',     icon: Truck,         color: 'text-blue-600' },
  { name: 'CRM',         href: '/crm',           icon: Users,          color: 'text-pink-600' },
  { name: 'Data',        href: '/data-management', icon: Database,      color: 'text-violet-600' },
  { name: 'Reports',     href: '/reports',       icon: BarChart3,     color: 'text-teal-600' },
  { name: 'Settings',    href: '/settings',      icon: Settings,      color: 'text-gray-500' },
]

export function ModuleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn(
      'w-16 flex flex-col items-center py-6 bg-white/80 backdrop-blur-md rounded-[2rem] shadow-premium border border-gray-100 transition-all duration-300 hover:w-20 group',
      className
    )}>

      {/* Switcher Indicator */}
      <div className="mb-6 p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:text-primary transition-colors">
        <ArrowLeftRight size={18} className="animate-pulse" />
      </div>

      <div className="flex-1 flex flex-col gap-3 items-center w-full px-2 overflow-y-auto no-scrollbar">
        {erpModules.map((module) => {
          const isActive = pathname === module.href || (module.href !== '/' && pathname.startsWith(module.href))
          
          return (
            <Link
              key={module.name}
              href={module.href}
              title={module.name}
              className={cn(
                'p-3 rounded-2xl transition-all duration-300 relative group/icon flex items-center justify-center',
                isActive 
                  ? 'bg-primary shadow-lg shadow-primary/20 text-white scale-110' 
                  : 'text-gray-400 hover:bg-gray-100/50 hover:text-primary'
              )}
            >
              <module.icon 
                size={22} 
                className={cn(
                  'transition-transform duration-300 group-hover/icon:scale-110',
                  isActive ? 'text-white' : module.color
                )} 
              />
              
              {/* Tooltip on Expand */}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover/icon:opacity-100 transition-all z-50 whitespace-nowrap shadow-xl">
                {module.name}
              </div>
              
              {isActive && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-full" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Admin Bridge */}
      <div className="mt-auto border-t border-gray-100 pt-4 w-full flex justify-center">
        <Link 
          href="/admin"
          className="p-3 text-gray-400 hover:text-primary hover:rotate-45 transition-all duration-500"
        >
          <Settings size={20} />
        </Link>
      </div>
    </div>
  )
}
