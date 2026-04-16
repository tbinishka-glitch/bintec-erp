'use client'

import { useState, useMemo } from 'react'
import { 
  Users, Search, Filter, Plus, Edit2, ShieldAlert, 
  Trash2, MoreHorizontal, UserCheck, UserX, 
  Key, Save, X, Loader2, Camera, Mail, 
  Phone, MapPin, Calendar, Briefcase, Fingerprint
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { toggleUserStatus, deleteUser, resetUserPassword, createUser, updateUser } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'

interface Role { id: string; name: string }
interface Branch { id: string; name: string }
interface Category { id: string; name: string }
interface SubCategory { id: string; name: string; categoryId: string }
interface Department { id: string; name: string }

interface User {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  image: string | null
  staffId: string | null
  nicPassport: string | null
  mobileNumber: string | null
  gender: string | null
  dateOfBirth: Date | null
  joinedDate: Date | null
  employmentStatus: string | null
  designation: string | null
  notes: string | null
  address: string | null
  isActive: boolean
  // Scalar FK IDs (from Prisma)
  roleId: string | null
  branchId: string | null
  departmentId: string | null
  employeeCategoryId: string | null
  employeeSubCategoryId: string | null
  // Relations
  role: Role | null
  branch: Branch | null
  employeeCategory: Category | null
  employeeSubCategory: SubCategory | null
  department: Department | null
}

interface Props {
  users: User[]
  roles: Role[]
  branches: Branch[]
  categories: Category[]
  subCategories: SubCategory[]
  departments: Department[]
  myRole: string
}

export function StaffManagerClient({ users, roles, branches, categories, subCategories, departments, myRole }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterBranch, setFilterBranch] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  
  // Form state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (u.staffId || '').toLowerCase().includes(search.toLowerCase())
      const matchBranch = filterBranch === 'all' || u.branchId === filterBranch
      const matchCategory = filterCategory === 'all' || u.employeeCategoryId === filterCategory
      return matchSearch && matchBranch && matchCategory
    })
  }, [users, search, filterBranch, filterCategory])

  const handleOpenModal = (user?: User) => {
    setEditingUser(user || null)
    setSelectedCategoryId(user?.employeeCategoryId || '')
    setError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleToggleStatus = async (user: User) => {
    if (confirm(`Are you sure you want to ${user.isActive ? 'suspend' : 'activate'} ${user.name}?`)) {
      try {
        await toggleUserStatus(user.id, !user.isActive)
        router.refresh()
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  const handleResetPassword = async (user: User) => {
    if (confirm(`Reset password for ${user.name} to 'password123'?`)) {
      const fd = new FormData()
      fd.append('id', user.id)
      try {
        await resetUserPassword(fd)
        alert('Password reset successfully.')
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  const handleDelete = async (user: User) => {
    if (confirm(`PERMANENTLY DELETE ${user.name}? This cannot be undone.`)) {
      const fd = new FormData()
      fd.append('id', user.id)
      try {
        await deleteUser(fd)
        router.refresh()
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
      const result = editingUser 
        ? await updateUser(formData)
        : await createUser(formData)

      if (result.success) {
        handleCloseModal()
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, email or staff ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={filterBranch}
            onChange={e => setFilterBranch(e.target.value)}
            className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          >
            <option value="all">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          
          <select 
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <button 
            onClick={() => handleOpenModal()}
            className="ml-auto md:ml-0 flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[32px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identification</th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Professional Info</th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar imageUrl={u.image} firstName={u.firstName} lastName={u.lastName} name={u.name} size="md" />
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">{u.name}</p>
                        <p className="text-[10px] uppercase font-bold text-primary/70">{u.employeeSubCategory?.name || u.designation || 'Staff Member'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Fingerprint className="w-3 h-3 text-slate-400" />
                        ID: {u.staffId || '—'}
                      </p>
                      <p className="text-[10px] text-slate-400 ml-4.5">NIC: {u.nicPassport || '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-slate-700">{u.branch?.name || 'Network'}</p>
                      <p className="text-[10px] text-slate-500">{u.employeeCategory?.name || 'General'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-600 flex items-center gap-1.5"><Mail className="w-3 h-3 opacity-50" /> {u.email}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5"><Phone className="w-3 h-3 opacity-50" /> {u.mobileNumber || '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleToggleStatus(u)}
                        title={u.isActive ? 'Suspend' : 'Activate'}
                        className={`p-2 rounded-xl transition-colors ${u.isActive ? 'hover:bg-rose-50 text-rose-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                      >
                        {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleResetPassword(u)}
                        title="Reset Password"
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(u)}
                        title="Modify Profile"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(u)}
                        title="Full Termination"
                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-2 opacity-40">
            <Users className="w-12 h-12" />
            <p className="font-bold">No staff members found.</p>
          </div>
        )}
      </div>

      {/* Operational Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent rounded-t-[40px]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {editingUser ? <Edit2 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {editingUser ? 'Modify Professional Profile' : 'Enlist New Staff Member'}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium italic">Leeds Connect Governance Protocol</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - Scrollable Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-2xl flex items-center gap-3 text-rose-700 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 shrink-0" /> {error}
                </div>
              )}

              {editingUser && <input type="hidden" name="id" value={editingUser.id} />}

              {/* Section 1: Basic Identity */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Basic Identity</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">First Name <span className="text-rose-500">*</span></label>
                    <input name="firstName" defaultValue={editingUser?.firstName || ''} required className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="e.g. Ruwan" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Last Name <span className="text-rose-500">*</span></label>
                    <input name="lastName" defaultValue={editingUser?.lastName || ''} required className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="e.g. Perera" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Gender</label>
                    <select name="gender" defaultValue={editingUser?.gender || ''} className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none cursor-pointer">
                      <option value="">Select...</option>
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">NIC <span className="text-rose-500">*</span></label>
                    <input name="nic" defaultValue={editingUser?.nicPassport || ''} required className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="National Identity Card Number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Date of Birth</label>
                    <input type="date" name="dateOfBirth" defaultValue={editingUser?.dateOfBirth ? new Date(editingUser.dateOfBirth).toISOString().split('T')[0] : ''} className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none" />
                  </div>
                </div>
              </div>

              {/* Section 2: Professional Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Professional Deployment</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Staff ID</label>
                    <input name="staffId" defaultValue={editingUser?.staffId || ''} className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="e.g. LC-1001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Official Department</label>
                    <select 
                      name="departmentId" 
                      defaultValue={editingUser?.departmentId || ''} 
                      className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none cursor-pointer"
                    >
                      <option value="">Select Department...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">User Role in the Intranet <span className="text-rose-500">*</span></label>
                    <select name="roleId" defaultValue={editingUser?.roleId || ''} required className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none cursor-pointer">
                      <option value="">Select Role...</option>
                      {roles
                        .filter(r => myRole === 'Super Admin' || r.name !== 'Super Admin')
                        .map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Branch</label>
                    <select name="branchId" defaultValue={editingUser?.branchId || ''} className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none cursor-pointer">
                      <option value="">Network-wide</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  {/* Categorical Deployment Pair */}
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Main Hub (Category) <span className="text-rose-500">*</span></label>
                        {!selectedCategoryId && <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">Selection Required</span>}
                      </div>
                      <select 
                        name="employeeCategoryId" 
                        defaultValue={editingUser?.employeeCategoryId || ''} 
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        required
                        className="OPERATIONAL_INPUT w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none cursor-pointer"
                      >
                        <option value="">Select Primary Hub...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Specific Position <span className="text-rose-500">*</span></label>
                        {selectedCategoryId && <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">{subCategories.filter(sc => sc.categoryId === selectedCategoryId).length} Available</span>}
                      </div>
                      <select 
                        name="employeeSubCategoryId" 
                        key={`subcat-${selectedCategoryId}`} // Force re-render/reset when category changes
                        defaultValue={editingUser?.employeeSubCategoryId || ''} 
                        required
                        disabled={!selectedCategoryId}
                        className={`OPERATIONAL_INPUT w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="">{selectedCategoryId ? 'Select Position...' : 'Waiting for Hub selection...'}</option>
                        {subCategories
                          .filter(sc => sc.categoryId === selectedCategoryId)
                          .map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)
                        }
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Employment Status</label>
                    <select name="employmentStatus" defaultValue={editingUser?.employmentStatus || 'PERMANENT'} className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none cursor-pointer">
                      <option value="PERMANENT">PERMANENT</option>
                      <option value="PROBATION">PROBATION</option>
                      <option value="CONTRACT">CONTRACT</option>
                      <option value="INTERN">INTERN</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Joining Date</label>
                    <input type="date" name="joinedDate" defaultValue={editingUser?.joinedDate ? new Date(editingUser.joinedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none" />
                  </div>
                  <div className="flex items-center gap-2 pt-8 ml-1">
                    <input type="checkbox" name="isActive" defaultChecked={editingUser ? editingUser.isActive : true} className="w-5 h-5 accent-emerald-600 rounded-lg" />
                    <span className="text-xs font-bold text-slate-600 uppercase">Profile is Active</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Connectivity */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Phone className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Contact & Connectivity</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Email <span className="text-rose-500">*</span></label>
                    <input type="email" name="email" defaultValue={editingUser?.email || ''} required className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="e.g. staff@leeds.lk" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Mobile Number</label>
                    <input name="mobileNumber" defaultValue={editingUser?.mobileNumber || ''} className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="e.g. +94 7X XXX XXXX" />
                  </div>
                  {!editingUser && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Initialization Password <span className="text-rose-500">*</span></label>
                      <input type="password" name="password" defaultValue="password123" required className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="••••••••" />
                      <div className="flex items-center gap-2 pt-2 ml-1">
                        <input type="checkbox" name="forcePasswordChange" defaultChecked className="w-4 h-4 accent-primary" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Force password change on first login</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Residential Address</label>
                    <textarea name="address" defaultValue={editingUser?.address || ''} rows={3} className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none" placeholder="Full permanent address details..." />
                  </div>
                </div>
              </div>

              {/* Section 4: Notes (Visible to Employee) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Administrative Notes (Shared)</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Governance Notes</label>
                  <textarea name="notes" defaultValue={editingUser?.notes || ''} rows={4} className="OPERATIONAL_INPUT w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none" placeholder="Enter notes visible to both administrators and the employee..." />
                  <p className="text-[10px] text-slate-400 font-medium italic ml-1">* Changes here are visible to the staff member on their professional dashboard.</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-10 flex items-center justify-end gap-4">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Synchronizing...</>
                  ) : (
                    <><Save className="w-5 h-5" /> {editingUser ? 'Save Protocol' : 'Finalize Enlistment'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 40px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 40px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .OPERATIONAL_INPUT:focus {
          border-color: #5A2D82;
          background-color: white;
        }
      `}</style>
    </div>
  )
}
