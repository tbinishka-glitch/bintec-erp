'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload, CheckCircle2, AlertCircle, X, ShieldAlert, UserPlus, Loader2 } from 'lucide-react'

interface Role { id: string; name: string }
interface Branch { id: string; name: string }
interface Category { id: string; name: string }

interface Props {
  roles: Role[]
  branches: Branch[]
  categories: Category[]
}

const FIELD_CLASS = "w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
const SELECT_CLASS = "w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"

export function CreateUserForm({ roles, branches, categories }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Form field state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [employeeCategoryId, setEmployeeCategoryId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [epfNo, setEpfNo] = useState('')
  
  // Entity Roles
  const [isEmployee, setIsEmployee] = useState(true)
  const [isParent, setIsParent] = useState(false)
  const [isStudent, setIsStudent] = useState(false)
  const [isSupplier, setIsSupplier] = useState(false)

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionModal, setPermissionModal] = useState(false)
  const [success, setSuccess] = useState(false)

  // Auto-fill display name
  const handleNameBlur = () => {
    if (!name && firstName && lastName) setName(`${firstName} ${lastName}`)
  }

  // Avatar handling
  const handleAvatarChange = (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { setError('Photo must be under 5MB.'); return }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = e => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleAvatarChange(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      // Step 1: Create the user
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, name, email, password,
          roleId, branchId, employeeCategoryId, staffId, epfNo,
          isEmployee, isParent, isStudent, isSupplier
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'NO_PERMISSION_SUPER_ADMIN') {
          setPermissionModal(true)
        } else {
          setError(data.error || 'Failed to create account.')
        }
        setSubmitting(false)
        return
      }

      // Step 2: Upload avatar if provided
      if (avatarFile && data.userId) {
        const fd = new FormData()
        fd.append('file', avatarFile)
        fd.append('userId', data.userId)
        await fetch('/api/upload-avatar', { method: 'POST', body: fd })
      }

      setSuccess(true)
      setTimeout(() => router.push('/admin/users'), 1500)
    } catch (err) {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-teal-600" />
        </div>
        <p className="text-xl font-bold text-foreground">Account Created!</p>
        <p className="text-sm text-muted-foreground">Redirecting to user list…</p>
      </div>
    )
  }

  return (
    <>
      {/* Permission Denied Modal */}
      {permissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-3xl shadow-2xl border border-border max-w-md w-full p-8 space-y-5 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-foreground">Permission Denied</h3>
                <p className="text-sm text-muted-foreground">Action not allowed</p>
              </div>
            </div>
            <p className="text-foreground leading-relaxed">
              You have <span className="font-bold text-rose-600">no permission</span> to create Super Admin accounts. 
              Only a Super Admin can grant Super Admin access.
            </p>
            <button
              onClick={() => setPermissionModal(false)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Close
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-2xl text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button type="button" onClick={() => setError(null)} className="ml-auto hover:opacity-70"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Photo Upload */}
        <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
          <p className="text-sm font-semibold text-foreground self-start">Profile Photo <span className="text-muted-foreground font-normal">(Optional)</span></p>

          <div
            className="relative group cursor-pointer"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/50 transition-all shadow-lg">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-purple-800 flex flex-col items-center justify-center text-white gap-1">
                  <Camera className="w-7 h-7 opacity-80" />
                  <span className="text-[9px] font-semibold opacity-70">Add Photo</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-3xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="w-6 h-6 text-white" />
            </div>
            {avatarFile && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setAvatarFile(null); setAvatarPreview(null) }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-white shadow-md hover:bg-destructive/80"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f) }} />

          <p className="text-[11px] text-muted-foreground">Click or drag & drop · JPEG, PNG, WebP · Max 5MB</p>
        </div>

        {/* Entity Roles Checkboxes */}
        <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
           <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Entity Registry Roles</label>
              <span className="text-[10px] font-bold text-slate-400">SELECT ALL THAT APPLY</span>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'isEmployee', label: 'Employee', state: isEmployee, setter: setIsEmployee, color: 'text-primary' },
                { id: 'isStudent', label: 'Student', state: isStudent, setter: setIsStudent, color: 'text-amber-600' },
                { id: 'isParent', label: 'Parent', state: isParent, setter: setIsParent, color: 'text-emerald-600' },
                { id: 'isSupplier', label: 'Supplier', state: isSupplier, setter: setIsSupplier, color: 'text-blue-600' },
              ].map((role) => (
                <label key={role.id} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:border-primary/20 transition-all select-none">
                  <input 
                    type="checkbox" 
                    checked={role.state} 
                    onChange={(e) => role.setter(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className={`text-xs font-black uppercase tracking-wide ${role.color}`}>{role.label}</span>
                </label>
              ))}
           </div>
           
           {!isEmployee && roleId && roles.find(r => r.id === roleId)?.name !== 'User' && (
             <p className="text-[11px] font-bold text-rose-600 flex items-center gap-2 animate-pulse">
                <AlertCircle size={12} /> Administrative roles (HR, Admin, etc.) require the 'Employee' flag.
             </p>
           )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">First Name <span className="text-destructive">*</span></label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} onBlur={handleNameBlur}
              required placeholder="Amali" className={FIELD_CLASS} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Last Name <span className="text-destructive">*</span></label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} onBlur={handleNameBlur}
              required placeholder="Perera" className={FIELD_CLASS} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Display Name <span className="text-destructive">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)}
              required placeholder="Amali Perera" className={FIELD_CLASS} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email Address <span className="text-destructive">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="amali@leeds.lk" className={FIELD_CLASS} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-foreground">Temporary Password <span className="text-destructive">*</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••" className={FIELD_CLASS} />
          </div>
        </div>

        {/* Role / Branch / Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Role <span className="text-destructive">*</span></label>
            <select value={roleId} onChange={e => setRoleId(e.target.value)} required className={SELECT_CLASS}>
              <option value="">Select role…</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Branch</label>
            <select value={branchId} onChange={e => setBranchId(e.target.value)} className={SELECT_CLASS}>
              <option value="">Network-wide</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Employee Category <span className="text-destructive">*</span></label>
            <select value={employeeCategoryId} onChange={e => setEmployeeCategoryId(e.target.value)} required className={SELECT_CLASS}>
              <option value="">Select category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Staff ID / EPF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Staff ID</label>
            <input value={staffId} onChange={e => setStaffId(e.target.value)}
              placeholder="e.g. LC-1001" className={FIELD_CLASS} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">EPF No</label>
            <input value={epfNo} onChange={e => setEpfNo(e.target.value)}
              placeholder="e.g. 4022" className={FIELD_CLASS} />
          </div>
          <p className="sm:col-span-2 text-xs text-muted-foreground">Must provide either Staff ID or EPF Number.</p>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-[0_4px_15px_rgba(90,45,130,0.3)] disabled:opacity-60 flex items-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Create Account</>
            )}
          </button>
        </div>
      </form>
    </>
  )
}
