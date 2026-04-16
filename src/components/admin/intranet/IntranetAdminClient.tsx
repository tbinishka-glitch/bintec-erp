'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Megaphone, PartyPopper, CheckSquare, Settings, LayoutDashboard, Plus, Search, Eye, Download, Users, X, FileCheck2, Filter, ChevronRight, UploadCloud, Calendar, Clock, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { uploadSopPolicy, createCelebration, toggleIntranetSetting, createAnnouncement, deleteAnnouncement } from '@/app/admin/intranet/actions'
import { approvePublishedArticle, rejectPublishedArticle } from '@/app/admin/actions'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'citizenry', label: 'Intranet Citizenry', icon: Users },
  { id: 'sops', label: 'SOPs & Policies', icon: FileCheck2 },
  { id: 'approvals', label: 'Approval Queue', icon: CheckSquare },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'celebrations', label: 'Celebrations', icon: PartyPopper },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function IntranetAdminClient({ roleName, initialDashboardData, initialPendingArticles, initialSops, branches }: any) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const isStandalone = searchParams.get('standalone') === 'true'
  const [activeTab, setActiveTab] = useState(tabParam || 'dashboard')

  // Support deep-linking from other pages
  useEffect(() => {
    if (tabParam && TABS.some(t => t.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])
  
  // State
  const [sops, setSops] = useState(initialSops || [])
  const [pendingArticles, setPendingArticles] = useState(initialPendingArticles || [])
  const [dashboardData, setDashboardData] = useState(initialDashboardData || {})

  // Modals
  const [showSopModal, setShowSopModal] = useState(false)
  const [showCelebrationModal, setShowCelebrationModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null)

  const handleSopSuccess = () => {
    setShowSopModal(false)
    toast.success('SOP uploaded successfully and sent for approval.')
    setTimeout(() => window.location.reload(), 1000)
  }

  const handleCelebrationSuccess = () => {
    setShowCelebrationModal(false)
    toast.success('Celebration created successfully.')
    setTimeout(() => window.location.reload(), 1000)
  }

  const handleAnnouncementSuccess = () => {
    setShowAnnouncementModal(false)
    toast.success('Announcement published.')
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div className={`flex flex-col ${isStandalone ? '' : 'lg:flex-row gap-8'}`}>
      {/* Sidebar Navigation */}
      {!isStandalone && (
        <div className="lg:w-64 shrink-0 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Intranet Hub</h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Publishing & Engagement</p>
          </div>

          <nav className="flex flex-col gap-1.5">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {tab.id === 'approvals' && pendingArticles.length > 0 && (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>
                      {pendingArticles.length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Access Level</p>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-700">{roleName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 min-h-[600px] ${isStandalone ? 'w-full' : ''}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              key="dashboard"
              data={dashboardData}
              pendingCount={pendingArticles.length}
              onTabChange={setActiveTab}
              onNewSop={() => setShowSopModal(true)}
              onNewCelebration={() => setShowCelebrationModal(true)}
              onNewAnnouncement={() => setShowAnnouncementModal(true)}
            />
          )}
          {activeTab === 'citizenry' && (
            <CitizenryTab
              key="citizenry"
              entities={dashboardData?.registeredEntities || []}
            />
          )}
          {activeTab === 'sops' && (
            <SopManagerTab 
              key="sops"
              sops={sops}
              onUploadClick={() => setShowSopModal(true)}
              onViewPdf={setSelectedPdfUrl}
              onDelete={async (id: any) => {
                if (confirm('Delete this document?')) {
                  await deleteArticle(id)
                  window.location.reload()
                }
              }}
            />
          )}
          {activeTab === 'approvals' && (
            <ApprovalQueueTab 
              key="approvals"
              articles={pendingArticles}
            />
          )}
          {activeTab === 'announcements' && (
            <AnnouncementCenterTab 
              key="announcements"
              announcements={dashboardData?.announcements || []}
              onNewClick={() => setShowAnnouncementModal(true)}
            />
          )}
          {activeTab === 'celebrations' && (
            <CelebrationManagerTab 
              key="celebrations"
              celebrations={dashboardData?.celebrations || []}
              onNewClick={() => setShowCelebrationModal(true)}
              onDelete={async (id: any) => {
                if (confirm('Delete this celebration post?')) {
                  await deleteCelebration(id)
                  window.location.reload()
                }
              }}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab 
              key="settings"
              settings={dashboardData?.settings || {}}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {showSopModal && (
        <SopUploadModal onClose={() => setShowSopModal(false)} onSuccess={handleSopSuccess} />
      )}
      {showCelebrationModal && (
        <CelebrationCreateModal onClose={() => setShowCelebrationModal(false)} onSuccess={handleCelebrationSuccess} branches={branches} />
      )}
      {showAnnouncementModal && (
        <AnnouncementCreateModal onClose={() => setShowAnnouncementModal(false)} onSuccess={handleAnnouncementSuccess} branches={branches} />
      )}
      {selectedPdfUrl && (
        <PdfViewerModal url={selectedPdfUrl} onClose={() => setSelectedPdfUrl(null)} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD TAB
// ─────────────────────────────────────────────────────────────────────────────
function DashboardTab({ data, pendingCount, onTabChange, onNewSop, onNewCelebration, onNewAnnouncement }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Operational Overview</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Monitor recent activity, pending approvals, and upcoming engagements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Approvals', value: pendingCount, icon: CheckSquare, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', onClick: () => onTabChange('approvals') },
          { label: 'Active SOPs & Policies', value: data?.totalSOPs || 0, icon: FileCheck2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', onClick: () => onTabChange('sops') },
          { label: 'Recent Celebrations', value: data?.celebrations?.length || 0, icon: PartyPopper, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', onClick: () => onTabChange('celebrations') },
        ].map((stat, i) => (
          <div key={i} onClick={stat.onClick} className={`${stat.bg} ${stat.border} border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800">{stat.value}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={onNewSop} className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all">
            <FileText className="w-4 h-4" /> Upload SOP/Policy
          </button>
          <button onClick={onNewCelebration} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm">
            <PartyPopper className="w-4 h-4 text-emerald-600" /> Announce Celebration
          </button>
          <button onClick={onNewAnnouncement} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm">
            <Megaphone className="w-4 h-4 text-blue-600" /> New Announcement
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SOP & POLICY MANAGER TAB
// ─────────────────────────────────────────────────────────────────────────────
function SopManagerTab({ sops, onUploadClick, onViewPdf, onDelete }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">SOP & Policy Management</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Restricted module for official structural documentation.</p>
        </div>
        <button onClick={onUploadClick} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all">
          <UploadCloud className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-500 tracking-wider">
            <tr>
              <th className="px-6 py-4">Document Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Version</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {sops.map((doc: any) => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-bold">{doc.title}</p>
                      <p className="text-[10px] text-slate-400">Issued by: {doc.issuedBy || 'System'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                    {doc.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{doc.versionNumber || 'v1.0'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onViewPdf(doc.pdfUrl)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View PDF">
                      <Eye className="w-4 h-4" />
                    </button>
                    {doc.pdfUrl && (
                      <a href={doc.pdfUrl} download target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => onDelete(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sops.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No official documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// APPROVAL QUEUE TAB
// ─────────────────────────────────────────────────────────────────────────────
function ApprovalQueueTab({ articles }: any) {
  const handleApprove = async (id: string) => {
    const fd = new FormData(); fd.append('id', id);
    try { await approvePublishedArticle(fd); toast.success('Approved'); setTimeout(() => window.location.reload(), 500) } catch (e: any) { toast.error(e.message) }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject and delete this submission?')) return;
    const fd = new FormData(); fd.append('id', id);
    try { await rejectPublishedArticle(fd); toast.success('Rejected'); setTimeout(() => window.location.reload(), 500) } catch (e: any) { toast.error(e.message) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Approval Queue</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Review pending articles, announcements, and documents from intranet users.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
            <CheckSquare className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">All caught up! Queue is empty.</p>
          </div>
        ) : (
          articles.map((item: any) => (
            <div key={item.id} className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm shadow-rose-100/50 flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">{item.documentType || 'Article'}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-black text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.content?.replace(/<[^>]+>/g, '') || 'No description provided.'}</p>
                
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                    {item.author?.image ? <img src={item.author.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-300" />}
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Submitted by <span className="text-slate-800 font-bold">{item.author?.name}</span></p>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5">
                <button onClick={() => window.open(`/intranet/knowledge/${item.id}`, '_blank')} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors">
                  Preview
                </button>
                <div className="flex gap-2 flex-1">
                  <button onClick={() => handleApprove(item.id)} className="flex-1 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors">
                    Approve
                  </button>
                  <button onClick={() => handleReject(item.id)} className="flex-1 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENT CENTER TAB
// ─────────────────────────────────────────────────────────────────────────────
function AnnouncementCenterTab({ announcements, onNewClick }: any) {
  const handleDelete = async (id: string) => {
    if (!confirm('Permanent deletion of this announcement?')) return
    try {
      await deleteAnnouncement(id)
      toast.success('Deleted')
      window.location.reload()
    } catch (e: any) {
      toast.error('Deletion failed')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Announcement Center</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Broadcast news, system updates, and official notices.</p>
        </div>
        <button onClick={onNewClick} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all">
          <Megaphone className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.map((ann: any) => (
          <div key={ann.id} className={`bg-white border rounded-2xl p-6 transition-all border-l-4 ${ann.priority === 'HIGH' ? 'border-l-rose-500 bg-rose-50/10' : 'border-l-blue-500 border-slate-200'}`}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {ann.isPinned && <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pinned</span>}
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${ann.priority === 'HIGH' ? 'text-rose-600 bg-rose-50' : 'text-blue-600 bg-blue-50'}`}>
                    {ann.priority} Priority
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-black text-slate-800">{ann.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{ann.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-1.5 grayscale opacity-50">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Seen by 0 citizens</span>
                   </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(ann.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
             <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-500 font-bold">No announcements published yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CELEBRATION MANAGER TAB
// ─────────────────────────────────────────────────────────────────────────────
function CelebrationManagerTab({ celebrations, onNewClick, onDelete }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Staff Engagement & Celebrations</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage birthdays, work anniversaries, weddings, and new joiners.</p>
        </div>
        <button onClick={onNewClick} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all">
          <PartyPopper className="w-4 h-4" /> Create Engagement Post
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {celebrations.map((cel: any) => (
          <div key={cel.id} className="bg-white border text-center border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all relative group">
            {cel.isFeatured && (
              <div className="absolute top-3 right-3 bg-amber-400 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full shadow-sm z-10">
                Featured
              </div>
            )}
            <div className="h-24 bg-gradient-to-br from-emerald-100 to-teal-50 w-full relative">
              {cel.type === 'BIRTHDAY' && <div className="absolute inset-0 flex items-center justify-center opacity-20 text-4xl">🎂</div>}
              {cel.type === 'NEW_JOINER' && <div className="absolute inset-0 flex items-center justify-center opacity-20 text-4xl">👋</div>}
            </div>
            <div className="px-5 pb-6 relative">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md border-2 border-white absolute -top-8 left-1/2 -translate-x-1/2 overflow-hidden flex items-center justify-center">
                {cel.user?.image ? <img src={cel.user.image} alt="" className="w-full h-full object-cover" /> : <PartyPopper className="w-6 h-6 text-emerald-500" />}
              </div>
              <div className="pt-10">
                <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-block mb-2">
                   {cel.type.replace('_', ' ')}
                </span>
                <h3 className="text-sm font-black text-slate-800 line-clamp-1">{cel.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cel.message}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  Published: {new Date(cel.publishDate).toLocaleDateString()}
                </p>
              </div>
              
              <button onClick={() => onDelete(cel.id)} className="absolute bottom-4 right-4 p-2 text-slate-200 hover:text-rose-600 bg-black/5 opacity-0 group-hover:opacity-100 rounded-xl transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CITIZENRY TAB (Registered Entities)
// ─────────────────────────────────────────────────────────────────────────────
function CitizenryTab({ entities }: { entities: any[] }) {
  const [loading, setLoading] = useState(false)
  const [entityId, setEntityId] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entityId.trim()) return
    setLoading(true)
    try {
      await registerEntityToIntranet(entityId.trim())
      toast.success('Entity registered for celebrations!')
      setEntityId('')
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Intranet Citizenry</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage staff entities registered for automated intranet celebrations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-600/20">
           <div className="space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight">Register New Entity</h3>
              <p className="text-blue-100 text-xs font-medium">Link a staff member from the Entity Registry using their LIS number.</p>
              <form onSubmit={handleRegister} className="space-y-3">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                    <input 
                      type="text" 
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                      placeholder="LIS-ENT-XXXXXXX" 
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-bold placeholder:text-blue-300 outline-none focus:bg-white/20 transition-all" 
                    />
                 </div>
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full py-4 bg-white text-blue-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg disabled:opacity-50"
                 >
                   {loading ? 'Processing...' : 'Add Individual'}
                 </button>
              </form>
           </div>
        </div>

        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-8">
           <div className="space-y-4 text-slate-600">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Bulk Upload Citizens</h3>
              <p className="text-xs font-medium">Paste multiple LIS-ENT-XXXXXXX identifiers separated by commas or new lines.</p>
              <textarea 
                rows={3}
                placeholder="LIS-ENT-000001, LIS-ENT-000002..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono outline-none focus:border-blue-500 transition-all"
                onBlur={async (e) => {
                  const ids = e.target.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
                  if (ids.length > 0) {
                    if (confirm(`Link these ${ids.length} entities to the intranet?`)) {
                      setLoading(true)
                      try {
                        const res = await bulkRegisterEntitiesToIntranet(ids)
                        toast.success(`Success: ${res.success}, Failed: ${res.failed}`)
                        window.location.reload()
                      } catch (err: any) {
                        toast.error(err.message)
                      } finally {
                        setLoading(false)
                      }
                    }
                  }
                }}
              />
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                 <UploadCloud className="w-4 h-4" /> CSV Upload coming soon
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Intranet Citizens ({entities.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Entity ID</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Birth Date</th>
                <th className="px-6 py-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {entities.map((ent) => (
                <tr key={ent.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                        {ent.image ? <img src={ent.image} alt="" className="w-full h-full object-cover" /> : <Users className="w-4 h-4 text-slate-400 m-auto mt-2" />}
                      </div>
                      <span className="text-slate-800 font-bold">{ent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{ent.entityId}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{ent.branch?.name || '---'}</td>
                  <td className="px-6 py-4 text-slate-500">{ent.dateOfBirth ? new Date(ent.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-500">{ent.joinedDate ? new Date(ent.joinedDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
              {entities.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">No entities registered in intranet citizenry yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS TAB
// ─────────────────────────────────────────────────────────────────────────────
function SettingsTab({ settings }: any) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async (key: string, currentVal: boolean) => {
    setLoading(true)
    try {
      await toggleIntranetSetting(key, !currentVal)
      toast.success('Setting updated')
      window.location.reload()
    } catch (e: any) {
      toast.error('Failed to update setting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Intranet Configuration</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage global behavior, automation, and user engagement rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Publishing Workflows</h3>
          <ToggleRow label="Require Approval for Articles" description="General blog articles must be approved by an admin before showing on the dashboard." checked={settings.articleApprovalsEnabled ?? true} onChange={() => handleToggle('articleApprovalsEnabled', settings.articleApprovalsEnabled ?? true)} disabled={loading} />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Automation Rules</h3>
          <ToggleRow label="Auto-publish Birthdays" description="Automatically generate celebration posts on staff birthdays." checked={settings.birthdayAutoPublish ?? true} onChange={() => handleToggle('birthdayAutoPublish', settings.birthdayAutoPublish ?? true)} disabled={loading} />
          <ToggleRow label="Auto-publish New Joiners" description="Automatically post a welcome message when HR creates a new employee." checked={settings.newJoinerAutoPublish ?? true} onChange={() => handleToggle('newJoinerAutoPublish', settings.newJoinerAutoPublish ?? true)} disabled={loading} />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Social & Engagement</h3>
          <ToggleRow label="Enable Comments" description="Allow staff to comment on articles and celebrations." checked={settings.commentsEnabled ?? true} onChange={() => handleToggle('commentsEnabled', settings.commentsEnabled ?? true)} disabled={loading} />
          <ToggleRow label="Enable Emoji Reactions" description="Allow staff to leave reactions (👍, ❤️, 🎉) on posts." checked={settings.reactionsEnabled ?? true} onChange={() => handleToggle('reactionsEnabled', settings.reactionsEnabled ?? true)} disabled={loading} />
        </div>
      </div>
    </motion.div>
  )
}

function ToggleRow({ label, description, checked, onChange, disabled }: any) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button onClick={onChange} disabled={disabled} className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all duration-300 shadow-sm ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────────────────────────
function SopUploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      await uploadSopPolicy(fd)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload SOP')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-800">Upload Official Document</h3>
            <p className="text-xs text-slate-500 font-medium">Add a new SOP, Policy, or Circular (PDF Only)</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FField label="Document Title *" name="title" required />
            <FField label="Document Type *" name="documentType" type="select" options={['SOP', 'Policy', 'Circular', 'Form']} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FField label="Category *" name="category" type="select" options={['Operations', 'HR', 'Finance', 'Academic', 'IT', 'General']} required />
            <FField label="SubCategory" name="subCategory" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FField label="Version Number" name="versionNumber" placeholder="e.g. v1.2" />
            <FField label="Effective Date" name="effectiveDate" type="date" />
            <FField label="Review Date" name="reviewDate" type="date" />
          </div>
          <FField label="Issued By (Department/Role)" name="issuedBy" />
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Short Description / Summary</label>
            <textarea name="description" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-600/20 outline-none" placeholder="Provide a brief summary of the document's contents..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">PDF File *</label>
            <div className="relative group">
              <input type="file" name="file" accept="application/pdf" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 group-hover:border-blue-400 group-hover:bg-blue-50/50 transition-colors">
                <UploadCloud className="w-8 h-8 mb-2 text-blue-500" />
                <p className="text-sm font-bold">Click or drag PDF file here to upload</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Maximum file size: 10MB</p>
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {loading ? 'Uploading...' : 'Upload & Publish'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function CelebrationCreateModal({ onClose, onSuccess, branches }: { onClose: () => void; onSuccess: () => void; branches: any[] }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [entitySearch, setEntitySearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [targetedUserId, setTargetedUserId] = useState<string | null>(null)
  const [targetedName, setTargetedName] = useState<string | null>(null)

  const handleEntityLookup = async () => {
    if (!entitySearch.trim()) return
    setSearching(true)
    try {
      const res = await registerEntityToIntranet(entitySearch.trim())
      // If success, we have the user in Intranet. We can now use them.
      // We need to fetch their internal DB ID for the creation.
      // Wait, registerEntityToIntranet doesn't return the ID. Let's fix that or use a lookup.
      // But it validates them.
      toast.success(`Linked to ${res.name}`)
      setTargetedName(res.name)
      // I'll update registerEntityToIntranet to return the ID.
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSearching(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      await createCelebration(fd)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create celebration')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-800">New Engagement Post</h3>
            <p className="text-xs text-slate-500 font-medium">Dual-Content: Upload images and write custom festive messages.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-3">
             <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Connect Staff Entity (LIS Number)</label>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="LIS-ENT-XXXXXXX" 
                  value={entitySearch}
                  onChange={(e) => setEntitySearch(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white border border-rose-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500/20 outline-none" 
                />
                <button 
                  type="button" 
                  onClick={handleEntityLookup}
                  disabled={searching}
                  className="px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-rose-700 transition-colors"
                >
                  {searching ? '...' : (targetedName ? 'Linked ✅' : 'Link')}
                </button>
             </div>
             {targetedName && (
               <p className="text-[9px] font-bold text-rose-500 italic">Target: {targetedName}</p>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FField label="Event Type *" name="type" type="select" options={['ACHIEVEMENT', 'PROMOTION', 'WEDDING', 'CHILD_BIRTH', 'FAREWELL', 'BIRTHDAY', 'NEW_JOINER']} required />
            <FField label="Priority Level *" name="priority" type="select" options={['NORMAL', 'HIGH', 'CORPORATE']} required />
          </div>

          <FField label="Title / Header *" name="title" required placeholder="e.g. Congratulations on the Promotion!" />
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Custom Message</label>
            <textarea name="message" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-600/20 outline-none" placeholder="Write a warm message for the dashboard..." />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Attach Creative / Photo (JPG/PNG)</label>
            <div className="relative group">
              <input 
                type="file" 
                name="imageFile" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 group-hover:border-blue-500/50 group-hover:bg-blue-50/30 transition-all">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-xl shadow-md" />
                ) : (
                  <>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Click or Drag Image to Upload</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <input type="checkbox" name="showAsPopup" className="w-5 h-5 rounded accent-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-700 uppercase">Global Popup</span>
                <span className="text-[9px] text-slate-400 font-bold">Display in top-right corner</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <input type="checkbox" name="isFeatured" className="w-5 h-5 rounded accent-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-700 uppercase">Featured Banner</span>
                <span className="text-[9px] text-slate-400 font-bold">Pin to hero section</span>
              </div>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Publishing...' : 'Publish Celebration'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function AnnouncementCreateModal({ onClose, onSuccess, branches }: { onClose: () => void; onSuccess: () => void; branches: any[] }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      await createAnnouncement(fd)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish announcement')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-800">New Institutional Announcement</h3>
            <p className="text-xs text-slate-500 font-medium">Broadcast news across the modular enterprise hub.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <FField label="Announcement Title *" name="title" required placeholder="e.g. System Maintenance or New Policy Update" />
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Announcement Content *</label>
            <textarea name="content" rows={6} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-600/20 outline-none" placeholder="Enter the full message for the announcement..." />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FField label="Priority *" name="priority" type="select" options={['NORMAL', 'HIGH']} required />
            <FField label="Target Branch (Optional)" name="branchId" type="select" options={branches.map(b => ({ value: b.id, label: b.name }))} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <input type="checkbox" name="isPinned" className="w-5 h-5 rounded accent-blue-600" />
              <span className="text-xs font-bold text-slate-700">Pin to Feed</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <input type="checkbox" name="popupDisplay" className="w-5 h-5 rounded accent-blue-600" />
              <span className="text-xs font-bold text-slate-700">Display as Popup</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> {loading ? 'Publishing...' : 'Broadcast Now'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function PdfViewerModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 backdrop-blur">
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <h3 className="font-bold text-sm">Document Viewer</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 w-full relative">
        <iframe src={url} className="w-full h-full border-0" title="PDF Viewer" />
      </div>
    </div>
  )
}

function FField({ label, name, type = 'text', required, placeholder, options }: {
  label: string; name: string; type?: string; required?: boolean
  placeholder?: string; options?: (string | { value: string; label: string })[]
}) {
  const cls = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-600/20 outline-none"
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{label}</label>
      {type === 'select' ? (
        <select name={name} required={required} className={cls}>
          <option value="">Select...</option>
          {options?.map(o => typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
      ) : (
        <input type={type} name={name} placeholder={placeholder} required={required} className={cls} />
      )}
    </div>
  )
}
