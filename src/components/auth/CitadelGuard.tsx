'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Lock, ShieldCheck, ArrowRight } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import Image from 'next/image'

interface CitadelGuardProps {
  children: React.ReactNode
  moduleSlug: string
  moduleName: string
}

export function CitadelGuard({ children, moduleSlug, moduleName }: CitadelGuardProps) {
  const { data: session, status } = useSession()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    // 1. Master Super Admin Bypass
    const role = (session?.user as any)?.roleName?.toUpperCase().replace(/\s+/g, '_') || ''
    if (role === 'SUPER_ADMIN') {
      setIsUnlocked(true)
      setIsLoading(false)
      return
    }

    // 2. Check for existing Module Unlock in this session (LocalStorage or Cookie)
    const unlockKey = `leeds_citadel_unlock_${moduleSlug}`
    const sessionUnlock = localStorage.getItem(unlockKey)
    
    if (sessionUnlock === 'true') {
      setIsUnlocked(true)
    }
    
    setIsLoading(false)
  }, [status, session, moduleSlug])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)

    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        const unlockKey = `leeds_citadel_unlock_${moduleSlug}`
        localStorage.setItem(unlockKey, 'true')
        setIsUnlocked(true)
        toast.success(`Access granted to ${moduleName}`)
      } else {
        toast.error('Invalid credentials for this Citadel.')
      }
    } catch (error) {
      toast.error('Security verification failed. Please try again.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Verifying Sovereignty...</p>
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium p-10 border border-gray-100 relative overflow-hidden">
          {/* Branded Header */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-xl border border-gray-50">
              <Image src="/logo.png" alt="Leeds" width={48} height={48} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-black uppercase">
                Access <span className="text-primary">Citadel</span>
              </h2>
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                Module: <span className="text-primary">{moduleName}</span>
              </p>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            
            <p className="text-xs text-gray-500 font-medium px-4">
              This is a secured region of the Leeds ERP. Please re-enter your password to proceed.
            </p>
          </div>

          {/* Re-Auth Form */}
          <form onSubmit={handleUnlock} className="mt-8 space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter ERP Password"
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isAuthenticating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Unlock Module</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="absolute top-6 right-6 opacity-10">
            <ShieldCheck size={80} className="text-primary" />
          </div>
        </div>

        <button 
          onClick={() => window.location.href = '/'}
          className="mt-8 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
        >
          Return to ERP Dashboard
        </button>
      </div>
    )
  }

  return (
    <>
      <Toaster richColors position="bottom-right" />
      {children}
    </>
  )
}
