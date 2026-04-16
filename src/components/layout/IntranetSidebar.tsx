'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Megaphone, Users, BookOpen, Heart,
  Star, Crown, LogOut, ChevronRight,
  Home, MessageCircle, Video, LayoutDashboard, Lock
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { signOut, useSession } from 'next-auth/react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const intranetGroups = [
  {
    label: 'LEEDS CONNECT',
    items: [
      { name: 'Intranet Home',       href: '/intranet',               icon: Home },
      { name: 'Announcements',       href: '/intranet/announcements', icon: Megaphone },
      { name: 'Employee Directory', href: '/intranet/directory',     icon: Users },
      { name: 'Leadership Hub',     href: '/intranet/leadership',    icon: Crown },
    ]

  },
  {
    label: 'RESOURCES',
    items: [
      { name: 'Knowledge Hub',       href: '/intranet/knowledge',     icon: BookOpen },
      { name: 'Welfare Hub',         icon: Heart,                   href: '/intranet/welfare' },
    ]
  },
  {
    label: 'CONNECT',
    items: [
      { name: 'Chat Hub',            href: '/chat',                 icon: MessageCircle },
      { name: 'Meeting Hub',         href: '/meetings',             icon: Video },
      { name: 'Celebrations',        href: '/intranet/birthday-wall', icon: Star },
    ]
  }
]

export function IntranetSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className={cn(
      'w-64 flex flex-col bg-white rounded-[2.5rem] shadow-premium border border-primary/10 overflow-y-auto pb-12 transition-all duration-300 h-full',
      className
    )}>

      {/* Institutional Branding */}
      <div className="px-10 py-10">
        <div className="flex flex-col items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-primary/5 border border-primary/10">
            <Image src="/logo.png" alt="Leeds Logo" width={38} height={38} className="object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-black leading-none uppercase">Leeds <span className="text-primary">Connect</span></h1>
            <p className="text-[9px] font-black tracking-[0.2em] text-gold-leeds uppercase mt-2">Institutional <span className="text-primary">Intranet</span></p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-7">
        {intranetGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 pb-1">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/intranet' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all group relative border border-transparent',
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-gray-400 hover:text-primary hover:bg-primary/5'
                    )}
                  >
                    <item.icon className={cn('shrink-0 transition-transform duration-300', isActive ? 'text-white' : 'text-gray-300 group-hover:text-primary group-hover:scale-110')} size={20} />
                    <span className="flex-1 whitespace-nowrap">{item.name}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Persistence Toggle: Return to ERP */}
      <div className="px-6 pb-4 mt-auto border-t border-gray-50 pt-4 space-y-2">
        <button
          onClick={() => {
            const unlockKey = 'leeds_citadel_unlock_leeds-connect'
            localStorage.removeItem(unlockKey)
            window.location.href = '/'
          }}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-all group border border-rose-100"
        >
          <Lock className="h-4.5 w-4.5 shrink-0" />
          <span>Lock Leeds Connect</span>
        </button>

        <Link
          href="/"
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all group border border-primary/20"
        >
          <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
          <span>Exit to ERP</span>
        </Link>
      </div>
    </aside>
  )
}
