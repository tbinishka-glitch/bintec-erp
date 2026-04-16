import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NavigationShell } from './NavigationShell'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'

/**
 * Isolated Navigation & Shell Wrapper
 * Refactored to a 'Natural Scroll' model to resolve persistent scroll lock issues. 
 * Sidebar and Header use sticky positioning while the body handles vertical movement.
 */
export async function NavServer({ children }: { children?: React.ReactNode }) {
  try {
    const session = await auth()
    
    // Non-authenticated users: Pure full-screen view
    if (!session?.user) {
      return (
        <main className="min-h-screen w-full bg-white">
          {children}
        </main>
      )
    }

    let unreadCount = 0
    let userName = session.user.name || ''
    let userRole = (session.user as any)?.roleName || ''
    let userImage = session.user.image || ''

    try {
      const dbUser = await prisma.user.findUnique({ 
        where: { id: session.user.id },
        include: { role: true }
      })
      
      if (dbUser) {
        userName = dbUser.name || userName
        userRole = dbUser.role?.name || userRole
        userImage = dbUser.image || userImage
      }

      unreadCount = await prisma.notification.count({
        where: { userId: session.user.id, isRead: false }
      })
    } catch (dbError) {
      console.warn('[NavServer] Data enrichment failed:', dbError)
    }

    return (
      <div className="flex min-h-screen w-full bg-[#f8f9fa] relative">
        {/* 
            Persistent Sidebar Hub 
            Uses sticky + h-screen to stay fixed relative to the viewport 
            while the content flows naturally.
        */}
        <div className="hidden md:flex sticky top-0 h-screen overflow-hidden z-40 p-4 pr-0 gap-4">


          <NavigationShell 
            unreadCount={unreadCount} 
            userName={userName} 
            userRole={userRole} 
          />
        </div>
        
        {/* 
            Main Content Viewport
            Natural scrolling enabled by removing 'overflow-hidden' and 'h-screen'
            from the parent containers.
        */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
          <div className="sticky top-0 z-30">
            <TopNav 
              unreadCount={unreadCount} 
              userName={userName} 
              userRole={userRole} 
              userImage={userImage} 
            />
          </div>
          
          <main className="flex-1 p-0 relative">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav className="md:hidden sticky bottom-0 z-30" unreadCount={unreadCount} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('[NavServer] Critical Shell Failure:', error)
    return <main className="flex-1">{children}</main>
  }
}
