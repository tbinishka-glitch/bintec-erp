'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Search, Users, Building2, Mail, ChevronRight } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Network Director', HR_ADMIN: 'Head of HR',
  BRANCH_HEAD: 'Branch Head', DEPT_HEAD: 'Department Head',
  STAFF: 'Staff Member', CONTENT_MOD: 'Content Moderator',
  WELFARE_ADMIN: 'Welfare Admin',
}

const ROLE_GRADIENTS: Record<string, string> = {
  SUPER_ADMIN: 'from-primary to-purple-800',
  HR_ADMIN:    'from-blue-500 to-indigo-600',
  BRANCH_HEAD: 'from-emerald-500 to-teal-600',
  DEPT_HEAD:   'from-orange-400 to-amber-600',
  STAFF:       'from-gray-400 to-gray-600',
}

const ROLE_BADGES: Record<string, string> = {
  SUPER_ADMIN: 'bg-primary/10 text-primary',
  HR_ADMIN:    'bg-blue-100 text-blue-700',
  BRANCH_HEAD: 'bg-emerald-100 text-emerald-700',
  DEPT_HEAD:   'bg-amber-100 text-amber-700',
  STAFF:       'bg-muted text-muted-foreground',
}

export function DirectoryClient({ users, totalCount }: { users: any[], totalCount: number }) {
  const [search, setSearch] = useState('')
  const [activeBranch, setActiveBranch] = useState('All')

  const branches = useMemo(() => ['All', ...Array.from(new Set(users.map(u => u.branch?.name).filter(Boolean)))], [users])

  const filtered = useMemo(() => users.filter(u => {
    const matchBranch = activeBranch === 'All' || u.branch?.name === activeBranch
    const term = search.toLowerCase()
    const matchSearch = !search || 
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.name?.toLowerCase().includes(term) ||
      u.branch?.name?.toLowerCase().includes(term) ||
      u.employeeSubCategory?.name?.toLowerCase().includes(term) ||
      u.designation?.toLowerCase().includes(term)
    return matchBranch && matchSearch
  }), [users, activeBranch, search])

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-8">

      {/* Hero Header */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#5A2D82] via-[#5A2D82] to-[#7c4da6] text-white shadow-premium shadow-primary/20">
        <div className="relative p-10 md:p-14">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                  <Users className="w-7 h-7 text-gold-leeds" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Staff <span className="text-gold-leeds">Directory</span></h1>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mt-2">Network Personnel Registry</p>
                </div>
              </div>
            </div>

            {/* Hero Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input type="text" placeholder="Search by name, role, branch…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md transition-all shadow-inner" />
            </div>
          </div>
        </div>
      </div>

      {/* Branch filter + count */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {branches.map(b => (
            <button key={b} onClick={() => setActiveBranch(b)}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeBranch === b ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
              }`}>
              {b}
            </button>
          ))}
        </div>
        <div className="bg-white px-5 py-2.5 rounded-[1.25rem] border border-gray-50 shadow-soft">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest shrink-0">
            Records Shown: <span className="text-primary">{filtered.length}</span> / {totalCount}
          </p>
        </div>
      </div>

      {/* Staff Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white p-20 rounded-[2.5rem] shadow-soft text-center text-gray-400 border border-gray-50">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-100" />
            <p className="text-xl font-black text-gray-900 uppercase tracking-widest leading-none">No Results</p>
            <p className="text-xs font-bold text-gray-300 mt-3 uppercase tracking-widest">Try a different name or branch filter</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map((user, i) => {
              const roleName = user.role?.name || 'User'
              const roleLabel = ROLE_LABELS[roleName] ?? roleName
              const gradient = ROLE_GRADIENTS[roleName] ?? ROLE_GRADIENTS.STAFF
              return (
                <motion.div layout key={user.id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-soft hover:shadow-premium transition-all border border-transparent hover:border-primary/5"
                >
                  {/* Banner */}
                  <div className={`h-20 bg-gradient-to-r ${gradient} relative opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
                      <UserAvatar
                        imageUrl={user.image}
                        name={user.name}
                        size="xl"
                        className="ring-8 ring-white shadow-xl group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  <div className="pt-14 pb-8 px-6 flex flex-col items-center text-center gap-4">
                    <div className="space-y-1">
                      <h3 className="font-black text-gray-900 text-base leading-tight group-hover:text-primary transition-colors">{user.name}</h3>
                      <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                        {user.employeeSubCategory?.name || user.designation || roleLabel}
                      </p>
                    </div>

                    <div className="w-full space-y-2 pt-2 border-t border-gray-50 mt-2">
                      {user.branch && (
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest justify-center">
                          <Building2 className="w-3.5 h-3.5 text-gray-300" />
                          <span>{user.branch.name}</span>
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold lowercase tracking-widest justify-center w-full px-2 overflow-hidden">
                          <Mail className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                    </div>

                    <Link href={`/directory/${user.id}`}
                      className="mt-4 w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white py-3.5 rounded-2xl transition-all">
                      Profile Intelligence <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
