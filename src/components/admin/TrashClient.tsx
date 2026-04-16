'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ShieldAlert, RefreshCcw, Trash2, Search, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { restoreEntity, permanentlyDeleteEntity, emptyTrashBin } from '@/app/admin/users/actions'

export function TrashClient({ entities }: { entities: any[] }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [emptying, setEmptying] = useState(false)

  const filtered = entities.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.entityId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Restore ${name} back to the active Entity Registry?`)) return
    setProcessingId(id)
    try {
      await restoreEntity(id)
      toast.success(`${name} has been restored successfully.`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`WARNING: Permanently delete ${name}? This action CANNOT be undone and destroys all associated records forever.`)) return
    setProcessingId(id)
    try {
      await permanentlyDeleteEntity(id)
      toast.success(`${name} has been instantly permanently deleted.`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleEmptyTrash = async () => {
    if (!confirm(`WARNING: Are you absolutely sure you want to PERMANENTLY END all ${entities.length} entities in the trash? This is irreversible.`)) return
    setEmptying(true)
    try {
      await emptyTrashBin()
      toast.success('System Trash Bin has been emptied. Data is gone forever.')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setEmptying(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Trashed Entities..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all shadow-sm"
          />
        </div>
        
        {entities.length > 0 && (
          <button 
            onClick={handleEmptyTrash} 
            disabled={emptying}
            className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all disabled:opacity-50"
          >
            <Trash className="w-4 h-4" /> {emptying ? 'Annihilating Data...' : 'Empty Trash'}
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <ShieldAlert className="w-16 h-16 opacity-30 mb-4" />
             <p className="font-bold tracking-widest uppercase">The Trash Bin is Empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(e => (
              <div key={e.id} className={`bg-white p-5 rounded-2xl border ${processingId === e.id ? 'border-primary/50 opacity-50' : 'border-rose-100'} shadow-sm flex flex-col gap-4 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-3">
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-rose-100">Deleted</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <UserAvatar imageUrl={e.image} firstName={e.firstName} lastName={e.lastName} name={e.name} size="md" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{e.name || '—'}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{e.entityId || 'Unassigned'}</p>
                    <p className="text-[10px] text-primary/80 font-bold uppercase mt-1">{e.role?.name || 'No Role'}</p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 mt-2 p-3 bg-slate-50 rounded-xl space-y-1">
                  <p><strong>Deleted At:</strong> {e.deletedAt ? new Date(e.deletedAt).toLocaleString() : 'N/A'}</p>
                  {e.branch && <p><strong>Branch:</strong> {e.branch.name}</p>}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-slate-100 hidden group-hover:flex">
                  <button onClick={() => handleRestore(e.id, e.name)} disabled={!!processingId}
                    className="flex-1 shrink-0 flex justify-center items-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors">
                    <RefreshCcw className="w-3.5 h-3.5" /> Restore
                  </button>
                  <button onClick={() => handlePermanentDelete(e.id, e.name)} disabled={!!processingId}
                    className="shrink-0 p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors" title="Delete Permanently">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
