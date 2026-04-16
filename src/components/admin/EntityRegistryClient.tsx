'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Users, Search, Plus, Eye, Edit2, Shield, AlertTriangle,
  X, ChevronRight, Loader2, UserCheck, UserX, Copy, Camera,
  Fingerprint, Phone, Mail, Building, Briefcase,
  CheckCircle2, Clock, XCircle, Link2, Filter,
  DownloadCloud, Upload, RefreshCw, GraduationCap,
  ShoppingCart, Baby, ChevronDown, Check, ArrowRight,
  BookUser, Globe, MapPin, Calendar, Save, Trash2
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { AvatarUploader } from '@/components/ui/AvatarUploader'
import { useRouter } from 'next/navigation'
import {
  createEntity, updateEntity, toggleEntityStatus,
  checkEntityDuplicates, flagEntityDuplicate,
  getEntityAuditLogs, exportEntitiesCSV, moveToTrash
} from './actions'
import { toast } from 'sonner'
import { toggleUserStatus, resetUserPassword, deleteUser } from '@/app/admin/actions'

// ── Types ────────────────────────────────────────────────────────────────────
interface Role { id: string; name: string }
interface Branch { id: string; name: string }
interface Category { id: string; name: string }
interface SubCategory { id: string; name: string; categoryId: string }
interface Department { id: string; name: string }
interface Entity {
  id: string; entityId: string | null; name: string | null
  firstName: string | null; lastName: string | null; middleName: string | null
  title: string | null; preferredName: string | null; email: string | null
  officialEmail: string | null; image: string | null; mobileNumber: string | null
  secondaryMobile: string | null; nicPassport: string | null; passportNo: string | null
  birthCertNo: string | null; taxId: string | null; etfNo: string | null
  staffId: string | null; epfNo: string | null; gender: string | null
  dateOfBirth: Date | null; maritalStatus: string | null; nationality: string | null
  religion: string | null
  landPhone: string | null
  emergencyContactName: string | null; emergencyContactRel: string | null
  emergencyContactNumber: string | null; emergencyContactLand: string | null
  permanentAddressLine1: string | null; permanentAddressLine2: string | null; permanentAddressLine3: string | null
  permanentCity: string | null; permanentDistrict: string | null; permanentProvince: string | null
  permanentPostalCode: string | null; permanentCountry: string | null
  currentAddressLine1: string | null; currentAddressLine2: string | null; currentAddressLine3: string | null
  currentCity: string | null; currentDistrict: string | null; currentProvince: string | null
  currentPostalCode: string | null; currentCountry: string | null
  isActive: boolean; entityStatus: string | null; isDuplicateFlagged: boolean
  isEmployee: boolean; isParent: boolean; isStudent: boolean; isSupplier: boolean
  branchId: string | null; departmentId: string | null
  employeeCategoryId: string | null; employeeSubCategoryId: string | null
  roleId: string | null; notes: string | null
  firstRegisteredDate: Date | null; entitySource: string | null
  role: Role | null; branch: Branch | null
  employeeCategory: Category | null; employeeSubCategory: SubCategory | null
  department: Department | null
  studentProfile: { userId: string; studentId: string } | null
  parentProfile: { userId: string } | null
  supplierProfile: { userId: string; companyName: string } | null
}

interface Props {
  entities: Entity[]; roles: Role[]; branches: Branch[]
  categories: Category[]; subCategories: SubCategory[]
  departments: Department[]; myRole: string
}

// ── Role badge config ────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  isEmployee: { label: 'Employee', color: 'bg-primary/10 text-primary border-primary/20', icon: Briefcase },
  isParent: { label: 'Parent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Baby },
  isStudent: { label: 'Student', color: 'bg-gold-leeds/10 text-yellow-700 border-yellow-200', icon: GraduationCap },
  isSupplier: { label: 'Supplier', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShoppingCart },
} as const

type RoleKey = keyof typeof ROLE_CONFIG

const ENTITY_STATUSES = ['ACTIVE', 'DRAFT', 'PENDING_APPROVAL', 'INACTIVE', 'ARCHIVED']
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700', DRAFT: 'bg-slate-100 text-slate-600',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700', INACTIVE: 'bg-rose-100 text-rose-700',
  ARCHIVED: 'bg-gray-200 text-gray-500',
}

// ── Profile status for a single role ────────────────────────────────────────
function getProfileStatus(entity: Entity, role: RoleKey): 'complete' | 'incomplete' | 'not_created' {
  if (!entity[role]) return 'not_created'
  if (role === 'isEmployee') return entity.staffId ? 'complete' : 'incomplete'
  if (role === 'isParent') return entity.parentProfile ? 'complete' : 'incomplete'
  if (role === 'isStudent') return entity.studentProfile ? 'complete' : 'incomplete'
  if (role === 'isSupplier') return entity.supplierProfile?.companyName ? 'complete' : 'incomplete'
  return 'not_created'
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export function EntityRegistryClient({ entities, roles, branches, categories, subCategories, departments, myRole }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Search + filter state
  const [search, setSearch] = useState('')
  const [filterBranch, setFilterBranch] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDuplicate, setFilterDuplicate] = useState('all')

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)
  const [viewingEntity, setViewingEntity] = useState<Entity | null>(null)
  const [duplicates, setDuplicates] = useState<any[]>([])
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const csv = await exportEntitiesCSV()
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Leeds_Entity_Registry_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (err: any) {
      toast.error('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  // ── Counters ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: entities.length,
    active: entities.filter(e => e.isActive).length,
    duplicateReview: entities.filter(e => e.isDuplicateFlagged).length,
    employees: entities.filter(e => e.isEmployee).length,
    parents: entities.filter(e => e.isParent).length,
    students: entities.filter(e => e.isStudent).length,
    suppliers: entities.filter(e => e.isSupplier).length,
  }), [entities])

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return entities.filter(e => {
      const q = search.toLowerCase()
      const matchSearch = !q || [
        e.name, e.firstName, e.lastName, e.entityId, e.email,
        e.mobileNumber, e.nicPassport, e.passportNo, e.staffId, e.officialEmail
      ].some(v => v?.toLowerCase().includes(q))

      const matchBranch = filterBranch === 'all' || e.branchId === filterBranch
      const matchDup = filterDuplicate === 'all'
        || (filterDuplicate === 'flagged' && e.isDuplicateFlagged)
        || (filterDuplicate === 'clean' && !e.isDuplicateFlagged)
      const matchStatus = filterStatus === 'all' || (e.entityStatus || 'ACTIVE') === filterStatus
      const matchRole =
        filterRole === 'all' ||
        (filterRole === 'Employee' && e.isEmployee) ||
        (filterRole === 'Parent' && e.isParent) ||
        (filterRole === 'Student' && e.isStudent) ||
        (filterRole === 'Supplier' && e.isSupplier)

      return matchSearch && matchBranch && matchDup && matchStatus && matchRole
    })
  }, [entities, search, filterBranch, filterRole, filterStatus, filterDuplicate])

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleToggleStatus = async (e: Entity) => {
    if (!confirm(`${e.isActive ? 'Deactivate' : 'Reactivate'} ${e.name}?`)) return
    try {
      await toggleEntityStatus(e.id, !e.isActive)
      router.refresh()
      toast.success(`Entity ${e.isActive ? 'deactivated' : 'reactivated'}`)
    } catch (err: any) { toast.error(err.message) }
  }

  const handleMoveToTrash = async (e: Entity) => {
    if (!confirm(`Are you sure you want to move ${e.name} to the Trash Bin?`)) return
    try {
      await moveToTrash(e.id)
      router.refresh()
      toast.success(`Entity moved to Trash Bin`)
    } catch (err: any) { toast.error(err.message) }
  }

  const handleFlagDuplicate = async (e: Entity) => {
    try {
      await flagEntityDuplicate(e.id, !e.isDuplicateFlagged)
      router.refresh()
      toast.success(e.isDuplicateFlagged ? 'Duplicate flag removed' : 'Flagged for duplicate review')
    } catch (err: any) { toast.error(err.message) }
  }

  const handleResetPw = async (e: Entity) => {
    if (!confirm(`Reset password for ${e.name} to 'password123'?`)) return
    const fd = new FormData(); fd.append('id', e.id)
    await resetUserPassword(fd)
    toast.success('Password reset')
  }

  return (
    <div className="space-y-6">
      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total Entities', value: stats.total, color: 'text-slate-800', bg: 'bg-white' },
          { label: 'Active', value: stats.active, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Dup Review', value: stats.duplicateReview, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Employees', value: stats.employees, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Parents', value: stats.parents, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Students', value: stats.students, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Suppliers', value: stats.suppliers, color: 'text-rose-700', bg: 'bg-rose-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white/80 shadow-sm`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── CONTROLS BAR ──────────────────────────────────────────────────── */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 shadow-sm p-4 flex flex-col lg:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, entity ID, NIC, passport, email, mobile..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { value: filterBranch, setter: setFilterBranch, placeholder: 'Branch', options: branches.map(b => ({ v: b.id, l: b.name })) },
            { value: filterRole, setter: setFilterRole, placeholder: 'Role', options: ['Employee', 'Parent', 'Student', 'Supplier'].map(r => ({ v: r, l: r })) },
            { value: filterStatus, setter: setFilterStatus, placeholder: 'Status', options: ENTITY_STATUSES.map(s => ({ v: s, l: s })) },
            { value: filterDuplicate, setter: setFilterDuplicate, placeholder: 'Dup Flag', options: [{ v: 'flagged', l: 'Flagged' }, { v: 'clean', l: 'Clean' }] },
          ].map(f => (
            <select key={f.placeholder} value={f.value} onChange={e => f.setter(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
              <option value="all">All {f.placeholder}</option>
              {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <button onClick={handleExport} disabled={exporting} title="Export to CSV"
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm disabled:opacity-50">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
            <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => toast.info('Advanced filter panel coming soon')} title="Advanced Filters"
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
          </button>
          <button onClick={() => router.refresh()} title="Refresh Data"
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditingEntity(null); setShowAddModal(true) }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Add Entity
          </button>
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────────────────────────────────── */}
      <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-[32px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {['Profile / Name', 'Entity ID', 'Identification', 'Roles', 'Branch', 'Contact', 'Status', 'Module Profiles'].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
                <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap sticky right-0 z-20 text-right">
                  <span className="bg-slate-50/60 backdrop-blur-md px-3 py-1.5 rounded-[10px]">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filtered.map(entity => (
                <EntityRow
                  key={entity.id} entity={entity}
                  onView={() => setViewingEntity(entity)}
                  onEdit={() => { setEditingEntity(entity); setShowAddModal(true) }}
                  onToggleStatus={() => handleToggleStatus(entity)}
                  onFlagDuplicate={() => handleFlagDuplicate(entity)}
                  onResetPw={() => handleResetPw(entity)}
                  onTrash={() => handleMoveToTrash(entity)}
                />
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-24 flex flex-col items-center gap-3 text-slate-300">
            <BookUser className="w-14 h-14" />
            <p className="font-black uppercase tracking-widest text-sm text-slate-600">No Entities Found</p>
            <p className="text-xs">Adjust your search or filters</p>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-semibold">{filtered.length} of {entities.length} entities shown</p>
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <EntityFormModal
            entity={editingEntity}
            roles={roles} branches={branches} categories={categories}
            subCategories={subCategories} departments={departments}
            myRole={myRole}
            onClose={() => { setShowAddModal(false); setEditingEntity(null) }}
            onSuccess={() => { setShowAddModal(false); setEditingEntity(null); router.refresh() }}
            onCreated={(entityId) => { setShowAddModal(false); setEditingEntity(null); router.refresh(); toast.success(`Entity created: ${entityId}`) }}
          />
        )}
      </AnimatePresence>

      {/* ── VIEW PROFILE DRAWER ───────────────────────────────────────────── */}
      <AnimatePresence>
        {viewingEntity && (
          <EntityViewDrawer
            entity={viewingEntity}
            onClose={() => setViewingEntity(null)}
            onEdit={() => { setEditingEntity(viewingEntity); setViewingEntity(null); setShowAddModal(true) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENTITY TABLE ROW
// ═══════════════════════════════════════════════════════════════════════════════
function EntityRow({ entity, onView, onEdit, onToggleStatus, onFlagDuplicate, onResetPw, onTrash }: {
  entity: Entity; onView: () => void; onEdit: () => void
  onToggleStatus: () => void; onFlagDuplicate: () => void; onResetPw: () => void; onTrash: () => void
}) {
  const roles = (['isEmployee', 'isParent', 'isStudent', 'isSupplier'] as RoleKey[]).filter(r => entity[r])
  const status = entity.entityStatus || 'ACTIVE'

  return (
    <tr className="group hover:bg-primary/5 transition-colors duration-150">
      {/* Profile / Name */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserAvatar imageUrl={entity.image} firstName={entity.firstName} lastName={entity.lastName} name={entity.name} size="md" />
            {entity.isDuplicateFlagged && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-2.5 h-2.5 text-white" />
              </span>
            )}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">{entity.name || '—'}</p>
            {entity.preferredName && <p className="text-[10px] text-slate-400 font-medium">"{entity.preferredName}"</p>}
            <p className="text-[10px] text-primary font-bold uppercase">{entity.role?.name || 'No System Role'}</p>
          </div>
        </div>
      </td>

      {/* Entity ID */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            {entity.entityId || <span className="text-slate-300 italic">Unassigned</span>}
          </span>
        </div>
      </td>

      {/* Identification */}
      <td className="px-5 py-4">
        <div className="space-y-0.5">
          {entity.staffId && <p className="text-xs text-slate-600 flex items-center gap-1"><Fingerprint className="w-3 h-3 opacity-40" />ID: {entity.staffId}</p>}
          {entity.nicPassport && <p className="text-[10px] text-slate-400">NIC: {entity.nicPassport}</p>}
          {entity.passportNo && <p className="text-[10px] text-slate-400">PP: {entity.passportNo}</p>}
          {!entity.staffId && !entity.nicPassport && <p className="text-[10px] text-slate-300 italic">No ID on file</p>}
        </div>
      </td>

      {/* Roles */}
      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-1">
          {roles.length === 0
            ? <span className="text-[10px] text-slate-300 italic">None</span>
            : roles.map(r => {
              const cfg = ROLE_CONFIG[r]
              return (
                <span key={r} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${cfg.color}`}>
                  <cfg.icon className="w-2.5 h-2.5" />{cfg.label}
                </span>
              )
            })
          }
        </div>
      </td>

      {/* Branch */}
      <td className="px-5 py-4">
        <p className="text-xs font-semibold text-slate-700">{entity.branch?.name || 'Network-wide'}</p>
        {entity.employeeCategory && <p className="text-[10px] text-slate-400">{entity.employeeCategory.name}</p>}
      </td>

      {/* Contact */}
      <td className="px-5 py-4">
        <div className="space-y-0.5">
          {entity.email && <p className="text-xs text-slate-600 flex items-center gap-1 truncate max-w-[160px]"><Mail className="w-3 h-3 opacity-40 shrink-0" />{entity.email}</p>}
          {entity.mobileNumber && <p className="text-[10px] text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3 opacity-40" />{entity.mobileNumber}</p>}
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${STATUS_COLORS[status] || STATUS_COLORS.ACTIVE}`}>
            {status.replace('_', ' ')}
          </span>
          {!entity.isActive && (
            <span className="block px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-500">SUSPENDED</span>
          )}
        </div>
      </td>

      {/* Module Profiles */}
      <td className="px-5 py-4">
        <div className="space-y-0.5">
          {(['isEmployee', 'isParent', 'isStudent', 'isSupplier'] as RoleKey[]).map(r => {
            const cfg = ROLE_CONFIG[r]
            const ps = getProfileStatus(entity, r)
            if (!entity[r] && ps === 'not_created') return null
            return (
              <div key={r} className="flex items-center gap-1.5">
                <cfg.icon className="w-3 h-3 text-slate-300 shrink-0" />
                <span className="text-[9px] font-bold text-slate-500">{cfg.label}:</span>
                {ps === 'complete' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                {ps === 'incomplete' && <Clock className="w-3 h-3 text-amber-500" />}
                {ps === 'not_created' && <XCircle className="w-3 h-3 text-slate-300" />}
                <span className={`text-[8px] font-black uppercase ${ps === 'complete' ? 'text-emerald-600' : ps === 'incomplete' ? 'text-amber-600' : 'text-slate-300'}`}>
                  {ps === 'complete' ? 'Done' : ps === 'incomplete' ? 'Incomplete' : 'N/A'}
                </span>
              </div>
            )
          })}
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 sticky right-0 z-10 p-0 pointer-events-none group-hover:pointer-events-auto">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-white/50 translate-x-2 group-hover:translate-x-0">
          <button onClick={onView} title="View Profile" className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={onEdit} title="Edit Entity" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => {
            // Re-trigger onView but maybe force tab = linked profiles
            // We can handle this state locally or just open the drawer
            onView()
          }} title="Open Linked Profiles" className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
            <Link2 className="w-4 h-4" />
          </button>
          <button onClick={onFlagDuplicate} title="Duplicate Check" className={`p-2 rounded-xl transition-colors ${entity.isDuplicateFlagged ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'}`}>
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={onToggleStatus} title={entity.isActive ? 'Deactivate' : 'Reactivate'}
            className={`p-2 rounded-xl transition-colors ${entity.isActive ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
            {entity.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
          <button onClick={onTrash} title="Move to Trash" className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD / EDIT ENTITY MODAL — 7-SECTION MULTI-STEP FORM
// ═══════════════════════════════════════════════════════════════════════════════
const FORM_SECTIONS = ['Personal', 'Identity', 'Contact', 'Perm. Address', 'Curr. Address', 'Roles', 'Institutional']

function EntityFormModal({ entity, roles, branches, categories, subCategories, departments, myRole, onClose, onSuccess, onCreated }: {
  entity: Entity | null; roles: Role[]; branches: Branch[]
  categories: Category[]; subCategories: SubCategory[]
  departments: Department[]; myRole: string
  onClose: () => void; onSuccess: () => void; onCreated: (entityId: string) => void
}) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [checkingDup, setCheckingDup] = useState(false)
  const [dupWarning, setDupWarning] = useState<any[]>([])
  const [bypassed, setBypassed] = useState(false)
  const [selectedCatId, setSelectedCatId] = useState(entity?.employeeCategoryId || '')
  const [sameAddr, setSameAddr] = useState(false)
  const [roles_, setRoles_] = useState({
    isEmployee: entity?.isEmployee ?? false,
    isParent: entity?.isParent ?? false,
    isStudent: entity?.isStudent ?? false,
    isSupplier: entity?.isSupplier ?? false,
  })

  const isEdit = !!entity

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    // Add role checkboxes explicitly
    if (roles_.isEmployee) fd.set('isEmployee', 'on')
    if (roles_.isParent) fd.set('isParent', 'on')
    if (roles_.isStudent) fd.set('isStudent', 'on')
    if (roles_.isSupplier) fd.set('isSupplier', 'on')
    if (sameAddr) fd.set('sameAsPermanent', 'on')

    // Duplicate check on create
    if (!isEdit && !bypassed) {
      setCheckingDup(true)
      try {
        const { duplicates } = await checkEntityDuplicates(fd)
        if (duplicates.length > 0) {
          setDupWarning(duplicates)
          setCheckingDup(false)
          return
        }
      } catch { }
      setCheckingDup(false)
    }

    setSubmitting(true)
    try {
      const result = isEdit ? await updateEntity(fd) : await createEntity(fd)
      if (result.success) {
        if (isEdit) {
          toast.success('Entity updated successfully')
          onSuccess()
        } else {
          toast.success(`Entity created: ${(result as any).entityId}`)
          onCreated((result as any).entityId)
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="px-10 py-7 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              {isEdit ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{isEdit ? 'Edit Entity Record' : 'Register New Entity'}</h2>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {isEdit ? `ENT ID: ${entity?.entityId || 'Unassigned'}` : 'Central Entity Registry — Universal Identity Creation'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Step indicators */}
        <div className="px-10 pt-5 pb-3 flex items-center gap-1 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
          {FORM_SECTIONS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)} type="button"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${step === i ? 'bg-primary text-white shadow-lg shadow-primary/20' : i < step ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-400 border border-slate-200'}`}>
              {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
              {s}
            </button>
          ))}
        </div>

        {/* Duplicate warning */}
        <AnimatePresence>
          {dupWarning.length > 0 && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="bg-amber-50 border-b border-amber-200 px-10 py-4 overflow-hidden">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-black text-amber-800">Possible Duplicate Entity Detected</p>
                  <p className="text-xs text-amber-600 mb-3">The following existing records may match this new entity. Review before creating.</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {dupWarning.map(d => (
                      <div key={d.id} className="bg-white border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                        <span className="font-mono text-[10px] text-amber-700 font-bold">{d.entityId || d.id.slice(0, 8)}</span>
                        <span className="text-xs font-semibold text-slate-700">{d.firstName} {d.lastName}</span>
                        <span className="text-[10px] text-slate-400">{d.email || d.mobileNumber || d.nicPassport}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setDupWarning([])} className="px-4 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-700">Review Again</button>
                    <button onClick={() => { setBypassed(true); setDupWarning([]) }} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold">Continue Anyway</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault() }} className="flex-1 overflow-y-auto">
          <div className="px-10 py-8 space-y-6">
            {isEdit && <input type="hidden" name="id" value={entity!.id} />}

            {/* ── SECTION A: Personal ── */}
            <div className={step === 0 ? 'block space-y-5 animate-in fade-in slide-in-from-right-2 duration-200' : 'hidden'}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-[200px] shrink-0 pt-4 flex flex-col items-center border-r border-slate-100 pr-4">
                  {isEdit ? (
                    <AvatarUploader
                      userId={entity!.id}
                      currentImage={entity?.image}
                      firstName={entity?.firstName}
                      lastName={entity?.lastName}
                      name={entity?.name}
                      onUploadComplete={(url) => { toast.success('Photo updated') }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-center mt-2">
                      <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold px-2 leading-relaxed uppercase">
                        Photo upload unlocks after saving the identity record.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-5">
                  <SectionHeader icon={<Shield className="w-4 h-4" />} title="Basic Personal Details" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FField label="Title" name="title" type="select" defaultValue={entity?.title || ''} options={['', 'Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Rev', 'Hon']} />
                    <FField label="First Name *" name="firstName" required defaultValue={entity?.firstName || ''} />
                    <FField label="Last Name *" name="lastName" required defaultValue={entity?.lastName || ''} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FField label="Middle Name" name="middleName" defaultValue={entity?.middleName || ''} />
                    <FField label="Preferred / Display Name" name="preferredName" defaultValue={entity?.preferredName || ''} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FField label="Gender" name="gender" type="select" defaultValue={entity?.gender || ''} options={['', 'MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']} />
                    <FField label="Date of Birth" name="dateOfBirth" type="date" defaultValue={entity?.dateOfBirth ? new Date(entity.dateOfBirth).toISOString().split('T')[0] : ''} />
                    <FField label="Marital Status" name="maritalStatus" type="select" defaultValue={entity?.maritalStatus || ''} options={['', 'SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER']} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FField label="Nationality" name="nationality" defaultValue={entity?.nationality || ''} placeholder="e.g. Sri Lankan" />
                    <FField label="Religion (Optional)" name="religion" defaultValue={entity?.religion || ''} placeholder="Optional" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION B: Identity ── */}
            <div className={step === 1 ? 'block space-y-5 animate-in fade-in slide-in-from-right-2 duration-200' : 'hidden'}>
              <SectionHeader icon={<Fingerprint className="w-4 h-4" />} title="Identity & Legal Information" />
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-3">
                <BookUser className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs text-slate-600 font-semibold">Entity ID is auto-generated on creation (ENT-XXXXXX). It cannot be edited and becomes the universal identity key.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FField label="NIC / National ID" name="nicPassport" defaultValue={entity?.nicPassport || ''} placeholder="National Identity Card Number" />
                <FField label="Passport Number" name="passportNo" defaultValue={entity?.passportNo || ''} placeholder="Passport Number" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FField label="Birth Certificate No." name="birthCertNo" defaultValue={entity?.birthCertNo || ''} />
                <FField label="Tax ID (Optional)" name="taxId" defaultValue={entity?.taxId || ''} />
                <FField label="Staff / Employee ID" name="staffId" defaultValue={entity?.staffId || ''} placeholder="e.g. LC-1001" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FField label="EPF Number" name="epfNo" defaultValue={entity?.epfNo || ''} />
                <FField label="ETF Number" name="etfNo" defaultValue={(entity as any)?.etfNo || ''} />
              </div>
            </div>

            {/* ── SECTION C: Contact ── */}
            <div className={step === 2 ? 'block space-y-5 animate-in fade-in slide-in-from-right-2 duration-200' : 'hidden'}>
              <SectionHeader icon={<Phone className="w-4 h-4" />} title="Contact Information" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FField label="Personal Mobile *" name="mobileNumber" type="tel" required defaultValue={entity?.mobileNumber || ''} placeholder="+94 7X XXX XXXX" />
                <FField label="Secondary Mobile" name="secondaryMobile" type="tel" defaultValue={entity?.secondaryMobile || ''} />
                <FField label="Land Phone" name="landPhone" type="tel" defaultValue={entity?.landPhone || ''} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FField label="Personal Email *" name="email" type="email" required defaultValue={entity?.email || ''} placeholder="personal@email.com" />
                <FField label="Official Email" name="officialEmail" type="email" defaultValue={entity?.officialEmail || ''} placeholder="official@leeds.lk" />
              </div>
              <SectionHeader icon={<Shield className="w-3 h-3" />} title="Emergency Contact" small />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FField label="Emergency Contact Name" name="emergencyContactName" defaultValue={entity?.emergencyContactName || ''} />
                <FField label="Relationship" name="emergencyContactRel" defaultValue={(entity as any)?.emergencyContactRel || ''} placeholder="e.g. Spouse, Parent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FField label="Emergency Mobile" name="emergencyContactNumber" type="tel" defaultValue={entity?.emergencyContactNumber || ''} />
                <FField label="Emergency Land Line" name="emergencyContactLand" type="tel" defaultValue={(entity as any)?.emergencyContactLand || ''} />
              </div>
            </div>

            {/* ── SECTION D: Permanent Address ── */}
            <div className={step === 3 ? 'block space-y-5 animate-in fade-in slide-in-from-right-2 duration-200' : 'hidden'}>
              <SectionHeader icon={<MapPin className="w-4 h-4" />} title="Permanent Address" />
              <div className="grid grid-cols-1 gap-4">
                <FField label="Address Line 1" name="permanentAddressLine1" defaultValue={entity?.permanentAddressLine1 || ''} />
                <FField label="Address Line 2" name="permanentAddressLine2" defaultValue={entity?.permanentAddressLine2 || ''} />
                <FField label="Address Line 3" name="permanentAddressLine3" defaultValue={entity?.permanentAddressLine3 || ''} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FField label="City" name="permanentCity" defaultValue={(entity as any)?.permanentCity || ''} />
                <FField label="District" name="permanentDistrict" defaultValue={(entity as any)?.permanentDistrict || ''} />
                <FField label="Province" name="permanentProvince" defaultValue={(entity as any)?.permanentProvince || ''} />
                <FField label="Postal Code" name="permanentPostalCode" defaultValue={(entity as any)?.permanentPostalCode || ''} />
              </div>
              <FField label="Country" name="permanentCountry" defaultValue={(entity as any)?.permanentCountry || 'Sri Lanka'} />
            </div>

            {/* ── SECTION E: Current Address ── */}
            <div className={step === 4 ? 'block space-y-5 animate-in fade-in slide-in-from-right-2 duration-200' : 'hidden'}>
              <SectionHeader icon={<Globe className="w-4 h-4" />} title="Current / Residential Address" />
              <label className="flex items-center gap-3 cursor-pointer bg-primary/5 border border-primary/10 rounded-2xl p-4">
                <input type="checkbox" name="sameAsPermanent" checked={sameAddr} onChange={e => setSameAddr(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary" />
                <span className="text-sm font-bold text-slate-700">Same as Permanent Address</span>
              </label>
              {!sameAddr && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FField label="Address Line 1" name="currentAddressLine1" defaultValue={entity?.currentAddressLine1 || ''} />
                    <FField label="Address Line 2" name="currentAddressLine2" defaultValue={entity?.currentAddressLine2 || ''} />
                    <FField label="Address Line 3" name="currentAddressLine3" defaultValue={entity?.currentAddressLine3 || ''} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FField label="City" name="currentCity" defaultValue={(entity as any)?.currentCity || ''} />
                    <FField label="District" name="currentDistrict" defaultValue={(entity as any)?.currentDistrict || ''} />
                    <FField label="Province" name="currentProvince" defaultValue={(entity as any)?.currentProvince || ''} />
                    <FField label="Postal Code" name="currentPostalCode" defaultValue={(entity as any)?.currentPostalCode || ''} />
                  </div>
                  <FField label="Country" name="currentCountry" defaultValue={(entity as any)?.currentCountry || 'Sri Lanka'} />
                </div>
              )}
            </div>

            {/* ── SECTION F: Role Assignment (Moving to 6th place) ── */}
            <div className={step === 5 ? 'block space-y-5 animate-in fade-in slide-in-from-right-2 duration-200' : 'hidden'}>
              <SectionHeader icon={<Shield className="w-4 h-4" />} title="Role Assignment" />
              <p className="text-sm text-slate-500">Select all roles that apply to this entity. Multiple roles can be active simultaneously. Selecting a role automatically creates the linked module profile shell.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(ROLE_CONFIG) as RoleKey[]).map(r => {
                  const cfg = ROLE_CONFIG[r]
                  const active = roles_[r]
                  return (
                    <button key={r} type="button" onClick={() => setRoles_(prev => ({ ...prev, [r]: !prev[r] }))}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${active ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-slate-200 bg-white hover:border-primary/40'}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <cfg.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-sm ${active ? 'text-primary' : 'text-slate-700'}`}>{cfg.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {r === 'isEmployee' && 'HR / Staff module profile'}
                          {r === 'isParent' && 'School / Students module'}
                          {r === 'isStudent' && 'Student management module'}
                          {r === 'isSupplier' && 'Procurement / Finance module'}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                        {active && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Role profile status preview */}
              {Object.values(roles_).some(Boolean) && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Module Profiles to be Created</p>
                  <div className="space-y-2">
                    {(Object.keys(roles_) as RoleKey[]).filter(r => roles_[r]).map(r => (
                      <div key={r} className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {ROLE_CONFIG[r].label} Profile shell will be auto-created
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── SECTION G: Institutional Linking (Moving to 7th place) ── */}
            <div className={step === 6 ? 'block space-y-5 animate-in fade-in slide-in-from-right-2 duration-200' : 'hidden'}>
              <SectionHeader icon={<Building className="w-4 h-4" />} title="Institutional Linking" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FField label="Main Branch" name="branchId" type="select" defaultValue={entity?.branchId || ''}
                  options={[{ value: '', label: 'Network-wide' }, ...branches.map(b => ({ value: b.id, label: b.name }))]} />
                <FField label="System Role" name="roleId" type="select" defaultValue={entity?.roleId || ''}
                  options={[{ value: '', label: 'No System Role' }, ...roles.filter(r => myRole.toLowerCase() === 'super admin' || r.name.toLowerCase() !== 'super admin').map(r => ({ value: r.id, label: r.name }))]} />
              </div>

              {/* Role-conditional fields */}
              {(roles_.isEmployee) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                  <p className="md:col-span-3 text-[10px] font-black text-primary uppercase tracking-widest">Employee-Specific Fields</p>
                  <FField label="Department" name="departmentId" type="select" defaultValue={entity?.departmentId || ''}
                    options={[{ value: '', label: 'Select...' }, ...departments.map(d => ({ value: d.id, label: d.name }))]} />
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase">Employee Category *</label>
                    <select name="employeeCategoryId" defaultValue={entity?.employeeCategoryId || ''} onChange={e => setSelectedCatId(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary/10 outline-none">
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase">Position</label>
                    <select name="employeeSubCategoryId" defaultValue={entity?.employeeSubCategoryId || ''} disabled={!selectedCatId}
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary/10 outline-none disabled:opacity-50">
                      <option value="">Select Position...</option>
                      {subCategories.filter(s => s.categoryId === selectedCatId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FField label="Entity Source" name="entitySource" type="select" defaultValue={entity?.entitySource || ''}
                  options={['', 'WALK_IN', 'REFERRAL', 'ONLINE', 'SYSTEM', 'BULK_IMPORT']} />
                <FField label="First Registered Date" name="firstRegisteredDate" type="date"
                  defaultValue={entity?.firstRegisteredDate ? new Date(entity.firstRegisteredDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} />
                <FField label="Entity Status" name="entityStatus" type="select" defaultValue={entity?.entityStatus || 'ACTIVE'} options={ENTITY_STATUSES} />
              </div>

              {!isEdit && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Login Password</p>
                  <FField label="Initial Password" name="password" type="password" defaultValue="password123" />
                  <p className="text-[10px] text-slate-400">Entity will be required to change this on first login.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer navigation */}
          <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
            <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
              {step === 0 ? 'Cancel' : '← Back'}
            </button>
            <div className="flex items-center gap-3">
              {step < FORM_SECTIONS.length - 1 ? (
                <button type="button" onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" formNoValidate disabled={submitting || checkingDup}
                  className="flex items-center gap-2 px-10 py-3 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed">
                  {(submitting || checkingDup) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {checkingDup ? 'Checking...' : submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Entity'}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div >
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENTITY VIEW DRAWER
// ═══════════════════════════════════════════════════════════════════════════════
function EntityViewDrawer({ entity, onClose, onEdit }: { entity: Entity; onClose: () => void; onEdit: () => void }) {
  const [activeTab, setActiveTab] = useState('personal')
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const roles = (['isEmployee', 'isParent', 'isStudent', 'isSupplier'] as RoleKey[]).filter(r => entity[r])

  useEffect(() => {
    let mounted = true
    setLoadingLogs(true)
    getEntityAuditLogs(entity.id).then(logs => {
      if (mounted) setAuditLogs(logs)
    }).finally(() => {
      if (mounted) setLoadingLogs(false)
    })
    return () => { mounted = false }
  }, [entity.id])

  const tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'identity', label: 'Identity' },
    { id: 'contact', label: 'Contact' },
    { id: 'address', label: 'Address' },
    { id: 'roles', label: 'Role Mapping' },
    { id: 'profiles', label: 'Linked Profiles' },
    { id: 'history', label: 'Change History' },
    { id: 'audit', label: 'Audit Trail' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="flex-1 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* Profile header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
            <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden border-2 border-white/30">
              {entity.image ? <img src={entity.image} alt="" className="w-full h-full object-cover" /> : (
                <span className="text-3xl font-black text-white">{entity.firstName?.[0] || entity.name?.[0] || '?'}</span>
              )}
            </div>
            <div>
              <p className="text-2xl font-black leading-tight">{entity.name}</p>
              {entity.preferredName && <p className="text-white/70 text-sm">"{entity.preferredName}"</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="font-mono text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">{entity.entityId || 'ENT-PENDING'}</span>
                <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${entity.isActive ? 'bg-emerald-400/20' : 'bg-rose-400/20'}`}>
                  {entity.isActive ? '● Active' : '● Inactive'}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-white/10 uppercase border border-white/20">
                  {entity.entityStatus}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {roles.map(r => <span key={r} className="text-[9px] font-black uppercase bg-white/15 px-2 py-0.5 rounded-full">{ROLE_CONFIG[r].label}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-4 gap-1 bg-slate-50 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === t.id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-primary'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'personal' && (
            <div className="space-y-3">
              {[
                { l: 'Full Name', v: entity.name }, { l: 'Preferred Name', v: entity.preferredName },
                { l: 'Title', v: entity.title }, { l: 'Gender', v: entity.gender },
                { l: 'Date of Birth', v: entity.dateOfBirth ? format(new Date(entity.dateOfBirth), 'dd MMM yyyy') : null },
                { l: 'Marital Status', v: entity.maritalStatus }, { l: 'Nationality', v: entity.nationality },
                { l: 'Religion', v: entity.religion },
              ].map(f => <InfoRow key={f.l} label={f.l} value={f.v} />)}
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="space-y-3">
              {[
                { l: 'Entity ID', v: entity.entityId, mono: true },
                { l: 'Staff / Employee ID', v: entity.staffId, mono: true },
                { l: 'NIC / National ID', v: entity.nicPassport, mono: true },
                { l: 'Passport No.', v: entity.passportNo, mono: true },
                { l: 'Birth Certificate', v: entity.birthCertNo, mono: true },
                { l: 'Tax ID', v: entity.taxId, mono: true },
                { l: 'EPF No.', v: entity.epfNo, mono: true },
                { l: 'ETF No.', v: entity.etfNo, mono: true },
                { l: 'System Role', v: entity.role?.name },
                { l: 'Main Branch', v: entity.branch?.name },
                { l: 'Department', v: entity.department?.name },
                { l: 'Category', v: entity.employeeCategory?.name },
                { l: 'Sub Category', v: entity.employeeSubCategory?.name },
              ].map(f => <InfoRow key={f.l} label={f.l} value={f.v} mono={f.mono} />)}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-3">
              <SectionHeader icon={<Mail className="w-3 h-3" />} title="Email Addresses" small />
              <InfoRow label="Personal Email" value={entity.email} />
              <InfoRow label="Official Email" value={entity.officialEmail} />

              <SectionHeader icon={<Phone className="w-3 h-3" />} title="Phone Numbers" small />
              <InfoRow label="Primary Mobile" value={entity.mobileNumber} />
              <InfoRow label="Secondary Mobile" value={entity.secondaryMobile} />
              <InfoRow label="Land Phone" value={entity.landPhone} />

              <SectionHeader icon={<AlertTriangle className="w-3 h-3" />} title="Emergency Contact" small />
              <InfoRow label="Contact Name" value={entity.emergencyContactName} />
              <InfoRow label="Relationship" value={entity.emergencyContactRel} />
              <InfoRow label="Mobile Number" value={entity.emergencyContactNumber} />
              <InfoRow label="Land Number" value={entity.emergencyContactLand} />
            </div>
          )}

          {activeTab === 'address' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <SectionHeader icon={<MapPin className="w-3 h-3" />} title="Permanent Address" small />
                <div className="py-2.5 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">
                    {[entity.permanentAddressLine1, entity.permanentAddressLine2, entity.permanentAddressLine3].filter(Boolean).join(', ') || 'Not provided'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {[entity.permanentCity, entity.permanentDistrict, entity.permanentProvince, entity.permanentCountry].filter(Boolean).join(', ')}
                    {entity.permanentPostalCode ? ` - ${entity.permanentPostalCode}` : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <SectionHeader icon={<MapPin className="w-3 h-3" />} title="Current Address" small />
                <div className="py-2.5 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">
                    {[entity.currentAddressLine1, entity.currentAddressLine2, entity.currentAddressLine3].filter(Boolean).join(', ') || 'Not provided'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {[entity.currentCity, entity.currentDistrict, entity.currentProvince, entity.currentCountry].filter(Boolean).join(', ')}
                    {entity.currentPostalCode ? ` - ${entity.currentPostalCode}` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                The roles assigned to this entity across the integrated platform. Active roles authorize the entity to operate in specific system domains.
              </p>
              {(['isEmployee', 'isParent', 'isStudent', 'isSupplier'] as RoleKey[]).map(r => {
                const cfg = ROLE_CONFIG[r]
                const active = entity[r]
                return (
                  <div key={r} className={`rounded-2xl border p-4 ${active ? 'border-primary/20 bg-primary/5' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <cfg.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-sm ${active ? 'text-primary' : 'text-slate-400'}`}>{cfg.label} Role</p>
                        <p className="text-[10px] text-slate-500">{active ? 'Authorized for domain access' : 'Domain access disabled'}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                        {active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Linked module-specific profiles attached to this entity record. Profiles become active when setup is complete.
              </p>
              {(['isEmployee', 'isParent', 'isStudent', 'isSupplier'] as RoleKey[]).filter(r => entity[r]).map(r => {
                const cfg = ROLE_CONFIG[r]
                const ps = getProfileStatus(entity, r)
                return (
                  <div key={r} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                          <cfg.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-800">{cfg.label} Profile</p>
                          <p className="text-[10px] text-slate-400">Settings & specific parameters</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${ps === 'complete' ? 'bg-emerald-100 text-emerald-700' : ps === 'incomplete' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        {ps === 'complete' ? '✓ Complete' : ps === 'incomplete' ? '⚡ Incomplete' : 'Not Setup'}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-50">
                      <button className="flex-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
                        {ps === 'complete' ? 'Open Profile' : 'Complete Setup'}
                      </button>
                      <button className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl transition-all">
                        Disable
                      </button>
                    </div>
                  </div>
                )
              })}
              {roles.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                    <AlertTriangle className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-black text-slate-700">No Roles Assigned</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto">This entity has no active roles, so no module profiles are available yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {loadingLogs ? (
                <div className="flex items-center justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : auditLogs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center p-10">No recent changes recorded.</p>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
                  {auditLogs.slice(0, 10).map((log, i) => (
                    <div key={log.id} className="relative pl-6">
                      <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-white" />
                      <p className="text-xs font-black text-slate-800">{log.action}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                        {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm')} • {log.performedBy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              {loadingLogs ? (
                <div className="flex items-center justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : auditLogs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center p-10">No audit logs found.</p>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left bg-white">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2 text-[9px] uppercase font-black text-slate-500">Date/Time</th>
                        <th className="px-4 py-2 text-[9px] uppercase font-black text-slate-500">Action</th>
                        <th className="px-4 py-2 text-[9px] uppercase font-black text-slate-500">Performed By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {auditLogs.map(log => (
                        <tr key={log.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-slate-500">{format(new Date(log.createdAt), 'dd MMM yy HH:mm')}</td>
                          <td className="px-4 py-2 font-semibold text-slate-700">{log.action}</td>
                          <td className="px-4 py-2 text-slate-500">{log.performedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ── Reusable field component ─────────────────────────────────────────────────
function FField({ label, name, type = 'text', required, defaultValue, placeholder, options }: {
  label: string; name: string; type?: string; required?: boolean
  defaultValue?: string; placeholder?: string; options?: (string | { value: string; label: string })[]
}) {
  const cls = "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary/10 focus:bg-white focus:border-primary/40 transition-all outline-none"
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{label}</label>
      {type === 'select' ? (
        <select name={name} defaultValue={defaultValue} required={required} className={cls}>
          {options?.map(o => typeof o === 'string'
            ? <option key={o} value={o}>{o || `Select ${label}...`}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
      ) : (
        <input type={type} name={name} defaultValue={defaultValue} placeholder={placeholder}
          required={required} className={cls} />
      )}
    </div>
  )
}

function SectionHeader({ icon, title, small }: { icon: React.ReactNode; title: string; small?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${small ? 'pt-2' : 'pb-1'} border-b border-slate-100`}>
      <span className="text-primary">{icon}</span>
      <h3 className={`font-black text-slate-700 uppercase tracking-wider ${small ? 'text-[10px]' : 'text-xs'}`}>{title}</h3>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-50">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider w-36 shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-slate-800 text-right ${mono ? 'font-mono' : ''}`}>
        {value || <span className="text-slate-300 italic text-xs">Not provided</span>}
      </span>
    </div>
  )
}
