import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ShieldAlert, Lock, CheckCircle2, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default async function ForceChangePasswordPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-premium p-12 border border-gray-100 relative overflow-hidden">
        {/* Cinematic Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary shadow-inner border border-primary/10">
            <ShieldAlert size={40} className="animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-black uppercase tracking-tight leading-tight">Identity <span className="text-primary">Update</span> Required</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Security Policy Enforcement</p>
          </div>
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
          
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            The Leeds Command Center requires a mandatory credential update for your identity. This ensures all mission-critical citadels remain secure.
          </p>
        </div>

        {/* Action Form Placeholder */}
        <form className="mt-10 space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="New Access Password"
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                <CheckCircle2 size={18} />
              </div>
              <input
                type="password"
                placeholder="Confirm Access Password"
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            Update Identity Credentials
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Security watermark */}
        <div className="absolute -top-10 -right-10 opacity-[0.03] text-primary rotate-12 pointer-events-none">
          <ShieldAlert size={280} />
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-6 opacity-40">
        <Image src="/logo.png" alt="Leeds" width={32} height={32} className="grayscale" />
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Authorized Access Only</p>
      </div>
    </div>
  )
}
