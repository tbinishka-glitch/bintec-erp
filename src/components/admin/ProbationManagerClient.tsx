'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, X, Calendar, User, Briefcase, ChevronRight, Info } from 'lucide-react'
import { confirmPermanency, ignoreProbationMilestone } from '@/app/admin/actions'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ProbationUser {
  id: string
  name: string
  firstName: string | null
  lastName: string | null
  email: string | null
  joinedDate: Date
  gender: string | null
  designation: string | null
  branch: { name: string } | null
}

export default function ProbationManagerClient({ 
  eligibleUsers 
}: { 
  eligibleUsers: ProbationUser[] 
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetId = searchParams.get('target')
  const [submitting, setSubmitting] = useState<string | null>(null)

  const handlePromote = async (userId: string) => {
    setSubmitting(userId)
    try {
      await confirmPermanency(userId)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(null)
    }
  }

  const handleIgnore = async (userId: string) => {
    setSubmitting(userId + '_ignore')
    try {
      await ignoreProbationMilestone(userId)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Probation Review Center</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Reviewing staff members who have completed 6 months of probation.</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
            {eligibleUsers.length} Eligible for Permanency
          </span>
        </div>
      </div>

      {eligibleUsers.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md border border-white/60 p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
            <Check className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">All Clear</h3>
          <p className="text-slate-500 text-sm font-medium mt-2 max-w-sm">
            No employees currently require a probation review. The system will alert you as soon as the next milestone is reached.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {eligibleUsers.map((user) => {
            const isTarget = user.id === targetId
            const himHer = user.gender === 'Female' ? 'her' : 'him'
            
            return (
              <div 
                key={user.id}
                className={cn(
                  "group relative bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5",
                  isTarget ? "border-primary/40 ring-4 ring-primary/5" : "border-white/80"
                )}
              >
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[1.5rem] flex items-center justify-center shadow-inner border border-white/50 relative overflow-hidden shrink-0">
                    <User className="w-7 h-7 text-slate-400 group-hover:scale-110 transition-transform duration-500" />
                    {isTarget && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-lg font-black text-slate-900 truncate tracking-tight">{user.name}</h4>
                      <div className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {user.branch?.name || 'All Branches'}
                      </div>
                    </div>
                    
                    <p className="text-slate-500 text-[13px] font-medium mt-1 leading-relaxed">
                      Completed 6 months probation. Do you want to promote {himHer} to the Permanent Carder?
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <div className="flex items-center gap-1.5 bg-slate-50/50 px-3 py-1.5 rounded-xl border border-slate-100/50">
                        <Calendar className="w-3.5 h-3.5" />
                        Joined {new Date(user.joinedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50/50 px-3 py-1.5 rounded-xl border border-slate-100/50">
                        <Briefcase className="w-3.5 h-3.5" />
                        {user.designation || 'Staff'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <button
                    onClick={() => handlePromote(user.id)}
                    disabled={!!submitting}
                    className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[12px] flex items-center justify-center gap-3 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/25 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submitting === user.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Promote to Permanent
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleIgnore(user.id)}
                    disabled={!!submitting}
                    className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:rotate-90 transition-all duration-500 disabled:opacity-50"
                    title="Dismiss for 30 days"
                  >
                    {submitting === user.id + '_ignore' ? (
                      <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
