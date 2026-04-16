import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SessionProvider } from 'next-auth/react'
import { prisma } from '@/lib/prisma'
import { SeasonalEngine } from '@/components/seasonal/SeasonalEngine'
import { Toaster } from 'sonner'
import { ClientOnly } from '@/components/providers/ClientOnly'
import { NavServer } from '@/components/layout/NavServer'

export const metadata: Metadata = {
  title: 'Leeds Connect — Employee Intranet',
  description: 'The central hub for the Leeds multi-branch school network in Sri Lanka.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  
  // Safe-boot fetching for global settings
  let organizationSetting = null
  try {
    organizationSetting = await prisma.organizationSetting.findUnique({ 
      where: { organizationId: 'leeds' } 
    }).catch(() => null)
  } catch (error) {
    console.error('Critical Layout Error: Organization settings could not be loaded.', error)
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-black antialiased selection:bg-primary/10" suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider>
            <NavServer>
              {children}
            </NavServer>

            {/* Global Seasonal Overlays */}
            <ClientOnly>
              <div suppressHydrationWarning>
                <SeasonalEngine settings={organizationSetting} />
              </div>
            </ClientOnly>

            <ClientOnly>
              <Toaster position="bottom-right" theme="light" richColors />
            </ClientOnly>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
