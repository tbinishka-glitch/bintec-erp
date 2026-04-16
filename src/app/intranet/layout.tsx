'use client'

import { CitadelGuard } from '@/components/auth/CitadelGuard'

export default function IntranetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CitadelGuard 
      moduleSlug="leeds-connect" 
      moduleName="Leeds Connect"
    >
      <div className="flex-1 h-full overflow-hidden">
        {children}
      </div>
    </CitadelGuard>
  )
}
