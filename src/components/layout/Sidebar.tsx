'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Megaphone, Users, BookOpen, Heart,
  Settings, Star, Crown, LogOut, ShieldCheck,
  MessageCircle, Video, FileCheck, ChevronRight,
  Building, Palette, GraduationCap, ClipboardCheck, 
  Truck, ShoppingCart, Briefcase, BarChart3, 
  Database, FileText, UserSquare2, Wallet
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CustomHeart } from '@/components/ui/CustomHeart'
import { signOut, useSession } from 'next-auth/react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navGroups = [
  {
    label: 'GENERAL',
    items: [
      { name: 'Dashboard',           href: '/',              icon: LayoutDashboard },
    ]
  },
  {
    label: 'PEOPLE & CULTURE',
    items: [
      { name: 'Leeds Connect',       href: '/intranet', icon: Megaphone, orgSpecific: 'leeds', fallback: 'Intranet' },
      { name: 'HRM',                href: '/hr',            icon: UserSquare2 },
    ]

  },
  {
    label: 'SCHOOL MANAGEMENT',
    items: [
      { name: 'Student Hub',        href: '/school-management', icon: GraduationCap },
      { name: 'Examination',        href: '/examination',   icon: FileText },
      { name: 'Attendance',         href: '/attendance',    icon: ClipboardCheck },
    ]
  },

  {
    label: 'OPERATIONS',
    items: [
      { name: 'Transport',          href: '/transport',     icon: Truck },
      { name: 'Procurement',        href: '/procurement',   icon: ShoppingCart },
      { name: 'Asset Registry',     href: '/assets',        icon: Briefcase },
    ]
  },
  {
    label: 'FINANCIALS & CUSTOMERS',
    items: [
      { name: 'Finance Controller', href: '/finance',       icon: Wallet },
      { name: 'CRM Hub',            href: '/crm',           icon: Star },
    ]
  },
  {
    label: 'ANALYTICS & DATA',
    items: [
      { name: 'Data Management',    href: '/data-management', icon: Database },
      { name: 'Intelligence Reports', href: '/reports',     icon: BarChart3 },
    ]
  },
  {
    label: 'ADMINISTRATION',
    adminOnly: true,
    items: [
      { name: 'Admin Panel',         href: '/admin',             icon: ShieldCheck },
      { name: 'System Settings',     href: '/settings',          icon: Settings },
    ]
  }
]

export function Sidebar({ 
  className,
  userName = '',
  userRole = '',
}: { 
  className?: string,
  userName?: string,
  userRole?: string
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const sessionRoleName = (session?.user as any)?.roleName || ''
  // Prioritize userRole (fresh from DB) over sessionRoleName (potentially stale)
  const effectiveRole = userRole || sessionRoleName || ''
  
  // Robust normalized check: Support both new taxonomy and legacy upper-case formats
  const normalized = effectiveRole.toUpperCase().replace(/\s+/g, '_')
  const isAdmin = [
    'SUPER_ADMIN', 'IT_ADMIN', 'CORPORATE_ADMIN', 'HR_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN', 'BRANCH_HEAD'
  ].includes(normalized)

  return (
    <aside className={cn(
      'w-64 flex flex-col h-[calc(100vh-2rem)] sticky top-4 left-4 z-40 bg-white rounded-[2.5rem] shadow-premium border border-gray-50 m-4 mr-0 overflow-y-auto pb-12 transition-all duration-300',
      className
    )}>
      {/* Logo Section */}
      <div className="px-10 py-10">
        <div className="flex flex-col items-start gap-4">
          <div className="w-full flex items-center justify-center">
            <Image
              src="/leeds_school_logo.png"
              alt="Leeds International School"
              width={200}
              height={100}
              className="object-contain"
            />
          </div>
          <div className="w-full text-center space-y-1">
            <h1 className="text-xl font-black tracking-tight text-gray-900 leading-none uppercase">
              Modular <span className="text-primary ml-1">Enterprise Hub</span>
            </h1>
            <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">
              Elite <span className="text-gold-leeds">Institutional</span> Management
            </p>
          </div>
        </div>
      </div>
 
      {/* Navigation Groups */}
      <nav className="flex-1 px-4 py-2 space-y-7">
        {navGroups.map((group) => {
          if (group.adminOnly && !isAdmin) return null

          const visibleItems = group.items.filter(item => {
            if ((item as any).adminOnly && !isAdmin) return false
            return true
          })

          if (visibleItems.length === 0) return null

          return (
            <div key={group.label} className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 pb-1">
                {group.label}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  
                  // Handle Org-specific naming
                  let displayName = item.name
                  if ((item as any).orgSpecific && (session?.user as any)?.organizationId !== (item as any).orgSpecific) {
                    displayName = (item as any).fallback
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all group relative',
                        isActive
                          ? 'nav-active text-white shadow-premium'
                          : 'text-gray-400 hover:text-primary hover:bg-primary/5'
                      )}
                    >
                      <item.icon className={cn(
                        'shrink-0 transition-transform duration-300',
                        isActive ? 'text-white' : 'text-gray-300 group-hover:text-primary group-hover:scale-110'
                      )} size={20} />
                      <span className="flex-1 whitespace-nowrap">{displayName}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60 animate-pulse" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Sign out section */}
      <div className="px-6 pb-8 mt-auto border-t border-gray-50 pt-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all group mt-2"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:translate-x-1" />
          <span>Secure Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
