'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import { authenticate } from './actions'
import { Mail, Lock, IdCard, Eye, EyeOff, ChevronRight, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  )
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#f8f9fa] overflow-hidden">
      {/* ── Left Side: Branding ── */}
      <div className="hidden md:flex flex-1 relative items-center justify-center p-8 overflow-hidden bg-white">
        {/* Decorative subtle background pattern/gradient */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#5A2D82 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full flex flex-col items-center text-center">
          {/* Logo container */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="flex items-center justify-center w-[400px]">
              <Image
                src="/leeds_school_logo.png"
                alt="Leeds International School"
                width={380}
                height={200}
                className="object-contain"
              />
            </div>
            <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institutional Enterprise Hub</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 flex flex-col items-center pt-4"
          >
            <h2 className="text-5xl font-black leading-[1.1] tracking-tight text-gray-900">
              Institutional <span className="text-[#a98b44]">Intelligence</span> <br />
              & Administrative <span className="text-primary">Mastery.</span>
            </h2>
            
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#a98b44] to-primary rounded-full shadow-sm" />
            
            <p className="text-base text-gray-400 max-w-sm leading-relaxed font-medium">
              Access the unified modular hub designed for the elite management of Leeds International educational networks.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Right Side: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50/50 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="md:hidden flex flex-col items-center mb-8 text-center bg-white p-8 rounded-[2rem] shadow-sm">
            <div className="flex items-center justify-center w-full mb-4">
              <Image src="/leeds_school_logo.png" alt="Logo" width={200} height={100} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Enterprise Hub</p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-premium p-6 sm:p-10 border border-white">
            <div className="mb-8 text-center sm:text-left">
              <h3 className="text-3xl font-black text-gray-900 mb-2">Gateway Entry</h3>
              <p className="text-sm text-gray-400 font-medium leading-tight">Verify your operational credentials to enter the hub.</p>
            </div>

            <form action={formAction} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-12 pr-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-gray-400 text-gray-900"
                    placeholder="Enter your email"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* EMP No Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1" htmlFor="employeeNo">
                  EMP No
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <IdCard size={16} />
                  </div>
                  <input
                    id="employeeNo"
                    name="employeeNo"
                    type="text"
                    required
                    className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-12 pr-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-gray-400 text-gray-900"
                    placeholder="Employee Number"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-end ml-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-[9px] font-bold text-[#a98b44] hover:underline uppercase tracking-tighter">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-12 pr-12 py-3 text-sm font-medium outline-none transition-all placeholder:text-gray-400 text-gray-900"
                    placeholder="••••••••"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 ml-1">
                <div className="relative flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="peer appearance-none w-4 h-4 border-2 border-gray-200 checked:bg-primary checked:border-primary rounded-lg transition-all cursor-pointer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
                <label htmlFor="remember" className="text-[10px] font-semibold text-gray-500 cursor-pointer">
                  Remember me
                </label>
              </div>

              {/* Error message */}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-medium rounded-xl px-3 py-2 flex items-center gap-2"
                >
                  <HelpCircle size={12} className="shrink-0" />
                  <p>{errorMessage}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  "w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 mt-2 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(90,45,130,0.2)] hover:shadow-[0_15px_35px_rgba(90,45,130,0.3)]",
                  isPending && "opacity-70 cursor-not-allowed"
                )}
              >
                {isPending ? (
                  <>
                    <span className="inline-block w-4 h-4 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Authorizing...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">Secure Sign In</span>
                    <ChevronRight size={16} className="translate-y-[1px]" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-medium text-gray-400">
                Trouble logging in?{' '}
                <a href="mailto:admin@leeds.lk?subject=Intranet Login Assistance" className="text-primary hover:underline font-bold">
                  Contact IT Hub
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
