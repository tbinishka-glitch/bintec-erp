import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, Building, Megaphone, BookOpen, Heart,
  Settings, Star, Crown, GraduationCap, ClipboardCheck, 
  Truck, ShoppingCart, Briefcase, BarChart3, 
  Database, FileText, UserSquare2, Wallet, X
} from 'lucide-react'

const allModules = [
  { name: 'Dashboard',   href: '/',              icon: Users,      color: 'bg-blue-50 text-blue-600' },
  { name: 'Intranet',    href: '/intranet/announcements', icon: Megaphone,   color: 'bg-purple-50 text-purple-600' },
  { name: 'HRM',         href: '/hr',            icon: UserSquare2,   color: 'bg-rose-50 text-rose-600' },
  { name: 'Students',    href: '/school-management', icon: GraduationCap, color: 'bg-amber-50 text-amber-600' },
  { name: 'Exams',       href: '/examination',   icon: FileText,      color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Attendance',  href: '/attendance',    icon: ClipboardCheck, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Finance',     href: '/finance',       icon: Wallet,        color: 'bg-cyan-50 text-cyan-600' },
  { name: 'Procurement', href: '/procurement',   icon: ShoppingCart,  color: 'bg-orange-50 text-orange-600' },
  { name: 'Assets',      href: '/assets',        icon: Briefcase,     color: 'bg-slate-50 text-slate-600' },
  { name: 'Transport',   href: '/transport',     icon: Truck,         color: 'bg-blue-50 text-blue-600' },
  { name: 'CRM Hub',     href: '/crm',           icon: Star,          color: 'bg-pink-50 text-pink-600' },
  { name: 'Data Center', href: '/data-management', icon: Database,      color: 'bg-violet-50 text-violet-600' },
  { name: 'Reports',     href: '/reports',       icon: BarChart3,     color: 'bg-teal-50 text-teal-600' },
  { name: 'Logistics',   href: '/procurement',   icon: Truck,         color: 'bg-gray-50 text-gray-600' },
]

export default async function MenuPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="flex-1 min-h-screen bg-white md:bg-[#F8F9FC] p-6 md:p-10 space-y-10">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">Institutional <span className="text-primary">Registry</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Module Navigation</p>
        </div>
        <Link href="/" className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-black transition-all">
          <X size={20} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {allModules.map((module) => (
          <Link
            key={module.name}
            href={module.href}
            className="group flex flex-col items-center justify-center p-8 bg-white md:shadow-premium rounded-[2rem] border border-gray-50 hover:border-primary/20 hover:scale-[1.02] transition-all text-center space-y-4"
          >
            <div className={`p-5 rounded-2xl ${module.color} group-hover:scale-110 transition-transform`}>
              <module.icon size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-black mb-1">{module.name}</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Verified Module</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
