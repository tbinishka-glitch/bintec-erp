'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building, Plus, Trash2, Search, Briefcase, 
  Users, ShieldAlert, Loader2, CheckCircle2, ChevronRight
} from 'lucide-react'
import { createDepartment, deleteDepartment } from '@/app/admin/actions'
import { motion, AnimatePresence } from 'framer-motion'

interface Department {
  id: string
  name: string
  _count?: {
    users: number
  }
}

export function DepartmentManagerClient({ departments }: { departments: Department[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const [deptToDelete, setDeptToDelete] = useState<{ id: string, name: string } | null>(null)
  const [showGuidelines, setShowGuidelines] = useState(true)

  const validateDepartmentName = (name: string) => {
    // 1. Uniqueness check (UI side)
    const exists = departments.some(d => d.name.toLowerCase() === name.trim().toLowerCase())
    if (exists) return "This department name already exists in the registry."

    // 2. Terminology prohibition: cannot use the word "department"
    if (name.toLowerCase().includes('department')) {
      return 'The term "Department" cannot be included as it is already the primary category.'
    }

    // 3. Max 3-Word Rule (Ignoring " & " and spaces)
    const words = name.replace(/&/g, ' ').split(/\s+/).filter(w => w.length > 0)
    if (words.length < 1 || words.length > 3) {
      return `Department name must contain between 1 and 3 words. Current word count: ${words.length}.`
    }

    // 4. Title Case & Abbreviation Enforcement
    // Check if each word is Title Case and at least 3 letters long to prevent abbreviations like IT, HR
    const isTitleCase = words.every(w => /^[A-Z][a-z]+$/.test(w))
    if (!isTitleCase) {
      return "Format error: Each word must be in Title Case (e.g., 'Information Technology') and at least 2 letters long (No abbreviations like 'IT' or 'HR')."
    }

    const hasShortWord = words.some(w => w.length < 3)
    if (hasShortWord) {
      return "Format error: Please use full professional terminology (e.g., 'Human Resources' instead of 'HR'). Words must be at least 3 characters long."
    }

    return null
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const name = (formData.get('name') as string).trim()

    const validationError = validateDepartmentName(name)
    if (validationError) {
      setError(validationError)
      setSubmitting(false)
      return
    }

    try {
      const result = await createDepartment(formData)
      if (result.success) {
        setSuccess(`Department "${name}" created successfully.`)
        form.reset()
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return
    
    setSubmitting(true)
    const formData = new FormData()
    formData.append('id', deptToDelete.id)
    try {
      await deleteDepartment(formData)
      setDeptToDelete(null)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setDeptToDelete(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Deletion Confirmation Modal */}
      <AnimatePresence>
        {deptToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setDeptToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="relative text-center space-y-6">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto shadow-inner">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">Governance Alert</h4>
                  <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                    Are you sure you want to delete this <span className="text-rose-500 font-black">Department</span> permanently? 
                  </p>
                  <p className="px-4 py-3 bg-rose-50 rounded-2xl text-[11px] font-bold text-rose-600 uppercase tracking-wider leading-relaxed border border-rose-100 italic">
                    "This will Delete all the entries inside the Intranet"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => setDeptToDelete(null)}
                    disabled={submitting}
                    className="h-14 rounded-2xl border-2 border-slate-100 text-slate-400 font-black uppercase tracking-wider text-[11px] hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={submitting}
                    className="h-14 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-wider text-[11px] shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Governance Guidelines Modal */}
      <AnimatePresence>
        {showGuidelines && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] p-10 shadow-2xl border border-white/20 overflow-hidden"
            >
              <button 
                onClick={() => setShowGuidelines(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-2xl transition-all group"
              >
                <Plus className="w-6 h-6 text-slate-400 rotate-45 group-hover:text-primary transition-all" />
              </button>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Registration Guidelines</h3>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Professional Registry Standards</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-600 font-medium leading-relaxed">To maintain the elite organizational structure of the Leeds Connect Intranet, all new departments must adhere to the following strictly enforced parameters:</p>
                  
                  <div className="grid gap-3">
                    <div className="group p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-start gap-4 hover:bg-white hover:shadow-soft hover:border-primary/20 transition-all">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">1</div>
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                        <span className="text-primary font-black uppercase text-[11px] block mb-1">Word Count Rule</span>
                        Department names must contain <span className="text-primary underline">Maximum 3 words</span>. 1-word and 2-word names are now permitted (e.g., "Marketing", "Quality Assurance").
                      </p>
                    </div>

                    <div className="group p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-start gap-4 hover:bg-white hover:shadow-soft hover:border-primary/20 transition-all">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">2</div>
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                        <span className="text-primary font-black uppercase text-[11px] block mb-1">Abbreviation Restriction</span>
                        Short abbreviations like <span className="text-rose-500 underline font-black">"IT"</span> or <span className="text-rose-500 underline font-black">"HR"</span> are strictly prohibited. Please use full terminology (e.g., "Information Technology").
                      </p>
                    </div>

                    <div className="group p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-start gap-4 hover:bg-white hover:shadow-soft hover:border-primary/20 transition-all">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">3</div>
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                        <span className="text-primary font-black uppercase text-[11px] block mb-1">Terminology Restriction</span>
                        The word <span className="text-rose-500 underline font-black">"Department"</span> cannot be included in the name, as entries are already categorized within this registry.
                      </p>
                    </div>

                    <div className="group p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-start gap-4 hover:bg-white hover:shadow-soft hover:border-primary/20 transition-all">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">4</div>
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                        <span className="text-primary font-black uppercase text-[11px] block mb-1">Uniqueness Security</span>
                        Duplicate department names are strictly prohibited. The system will alert you if the registry already contains a matching entry.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowGuidelines(false)}
                  className="w-full h-16 bg-slate-800 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl shadow-slate-800/10"
                >
                  I Understand & Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Building className="text-primary w-8 h-8" />
             Department <span className="text-primary">Master Registry</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage network-wide professional divisions and organizational structure.</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
            {departments.length} Global Divisions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Creation Form */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/80 shadow-soft sticky top-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Create New Department</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Department Name</label>
                <input 
                  name="name" 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none" 
                  placeholder="e.g. Marketing" 
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl flex items-center gap-3 text-rose-700 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl flex items-center gap-3 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[12px] flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Register Department
              </button>
            </form>
          </div>
        </div>

        {/* List Table */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm flex items-center gap-4">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search master list..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-600"
            />
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-soft overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department Identity</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Staff Count</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filtered.map((dept) => (
                  <tr key={dept.id} className="group hover:bg-white transition-colors capitalize">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          <Building className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm tracking-tight">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-600">{dept._count?.users || 0} Professional{dept._count?.users !== 1 ? 's' : ''}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setDeptToDelete({ id: dept.id, name: dept.name })}
                        className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold italic text-sm">
                       No departments found matching your search...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
