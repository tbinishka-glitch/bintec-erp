'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { IntranetSidebar } from '@/components/layout/IntranetSidebar'
import { ModuleSwitcher } from '@/components/layout/ModuleSwitcher'

interface NavigationShellProps {
  unreadCount: number
  userName: string
  userRole: string
}

export function NavigationShell({ unreadCount, userName, userRole }: NavigationShellProps) {
  const pathname = usePathname()
  
  // Detect if we are inside the Intranet Citadel
  const isIntranet = pathname.startsWith('/intranet')
  
  return (
    <>
      {/* 
        High-Density ERP Switcher 
        Persistent minimalist bar for parallel module access as requested.
      */}
      {isIntranet && (
        <ModuleSwitcher className="hidden md:flex" />
      )}

      {/* 
        Contextual Sidebar Handoff
        Dynamically swaps sovereignty between the Shell (Sidebar) 
        and the Citadel (IntranetSidebar).
      */}
      {isIntranet ? (
        <IntranetSidebar className="hidden md:flex" />
      ) : (
        <Sidebar 
          className="hidden md:flex" 
          userName={userName} 
          userRole={userRole} 
        />
      )}
    </>
  )
}
