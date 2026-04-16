import Link from 'next/link'
import { ChevronRight, Crown, Construction } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface SuperAdminPageShellProps {
  title: string
  highlight: string
  subtitle: string
  icon: LucideIcon
  tag: string
  description: string
  roadmapItems: string[]
}

export function SuperAdminPageShell({
  title,
  highlight,
  subtitle,
  icon: Icon,
  tag,
  description,
  roadmapItems,
}: SuperAdminPageShellProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="relative border-b border-red-900/20 bg-gradient-to-r from-red-950/60 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(239,68,68,0.12),transparent_60%)]" />
        <div className="relative max-w-[1400px] mx-auto px-8 py-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-900 flex items-center justify-center shadow-xl shadow-red-900/40">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors">
                  Elite Command
                </Link>
                <ChevronRight size={12} className="text-slate-700" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400">{tag}</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">
                {title} <span className="text-red-400">{highlight}</span>
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
            <Crown size={11} /> Super Admin Only
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-16 flex flex-col items-center justify-center gap-10">
        {/* Under Construction Card */}
        <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-red-900/20 rounded-[2.5rem] p-12 text-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06),transparent_70%)]" />
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-950 to-slate-900 border border-red-900/30 flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Construction className="w-9 h-9 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">{title} {highlight}</h2>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 max-w-sm mx-auto">{description}</p>
            <div className="border-t border-white/5 pt-8 space-y-3 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4">Planned Features</p>
              {roadmapItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Link
          href="/admin"
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-white/10 hover:border-red-600/40 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-400 transition-all"
        >
          <ChevronRight size={13} className="rotate-180" /> Back to Elite Command
        </Link>
      </div>
    </div>
  )
}
