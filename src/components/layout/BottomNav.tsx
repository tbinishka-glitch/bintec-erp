"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Megaphone, Users, Bell, MessageSquare, Video, MoreHorizontal } from 'lucide-react';
import { cn } from './Sidebar';

const mobileNavItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'News', href: '/announcements', icon: Megaphone },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Meetings', href: '/meetings', icon: Video },
  { name: 'More', href: '/menu', icon: MoreHorizontal },
];

interface BottomNavProps {
  className?: string
  unreadCount?: number
}

export function BottomNav({ className, unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("fixed bottom-0 w-full bg-white border-t border-gray-50 flex justify-around items-center px-4 py-3 z-50 safe-area-pb shadow-[0_-10px_40px_rgba(0,0,0,0.03)]", className)}>
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all min-w-[60px]",
              isActive ? "text-primary bg-primary/5" : "text-gray-400"
            )}
          >
            <item.icon className={cn("h-5 w-5 transition-all", isActive ? "scale-110" : "opacity-60")} />
            {item.name}
          </Link>
        );
      })}

      {/* Notification bell with live badge */}
      <Link href="/notifications"
        className={cn(
          "flex flex-col items-center gap-1 p-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all relative min-w-[60px]",
          pathname === '/notifications' ? "text-amber-400 bg-amber-400/10" : "text-slate-500"
        )}
      >
        <div className="relative">
          <Bell className={cn("h-5 w-5 transition-all", pathname === '/notifications' ? "scale-110" : "opacity-60")} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-4.5 bg-amber-400 text-slate-950 text-[8px] font-black rounded-full flex items-center justify-center border-2 border-slate-950 shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        Alerts
      </Link>
    </nav>
  );
}
