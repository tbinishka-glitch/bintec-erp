'use client'

import { useState, useMemo, useRef, useOptimistic, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import Link from 'next/link'
import { 
  BookOpen, Search, Tag, Clock, User, ChevronRight, Sparkles, 
  TrendingUp, ArrowRight, Plus, X, GraduationCap, Settings, 
  Users, ClipboardCheck, ChevronDown, Check, FileText, Image as ImageIcon,
  FileIcon, Download, Eye, MessageCircle, Heart, ThumbsUp, ThumbsDown, Send,
  FileCheck2, LayoutDashboard
} from 'lucide-react'
import { CustomHeart } from '@/components/ui/CustomHeart'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { createArticle, addComment } from '@/app/intranet/knowledge/actions'
import { toggleReaction } from '@/lib/reactions'
import { toast } from 'sonner'

// ── CONSTANTS ──
const NAVIGATION_TABS = ['All', 'Policies', 'SOPs', 'Resources', 'Blog Articles']

const POLICY_SUB_CATEGORIES = [
  { id: 'HR', title: 'HR Policies', icon: Users, color: 'text-primary' },
  { id: 'Operations', title: 'Operations Policies', icon: Settings, color: 'text-black' },
  { id: 'Academic', title: 'Academic Policies', icon: GraduationCap, color: 'text-gold-leeds' },
]

const SOP_SUB_CATEGORIES = [
  { id: 'Operations', title: 'Operations SOPs', icon: ClipboardCheck, color: 'text-black' },
  { id: 'Academic', title: 'Academic SOPs', icon: GraduationCap, color: 'text-gold-leeds' },
]

const ACADEMIC_SECTIONS = [
  'Teaching & Learning', 
  'Examinations', 
  'Student Management', 
  'Curriculum Development', 
  'Academic Administration'
]

const OPERATIONS_SECTIONS = [
  'Human Resources',
  'Facilities Management',
  'Marketing',
  'Accounts and Finance',
  'IT'
]

const DOCUMENT_TYPES = ['Policy', 'SOP', 'Resource', 'Blog Article']

export function KnowledgeClient({ articles, session }: { articles: any[], session: any }) {
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [filterSub, setFilterSub] = useState<string | null>(null)
  const [filterSection, setFilterSection] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [commentingArticle, setCommentingArticle] = useState<any | null>(null)
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null)

  const userId = session?.user?.id
  const roleName = session?.user?.roleName
  const isAdmin = roleName === 'Corporate Admin' || roleName === 'Super Admin'

  // Filtering Logic
  const filtered = useMemo(() => {
    return articles.filter(a => {
      const matchSearch = !search || 
        a.title.toLowerCase().includes(search.toLowerCase()) || 
        a.content.toLowerCase().includes(search.toLowerCase()) ||
        a.category?.toLowerCase().includes(search.toLowerCase())
      
      if (!matchSearch) return false

      if (activeTab === 'All') return true
      if (activeTab === 'Policies' && a.documentType === 'Policy') return true
      if (activeTab === 'SOPs' && a.documentType === 'SOP') return true
      if (activeTab === 'Resources' && a.documentType === 'Resource') return true
      if (activeTab === 'Blog Articles' && (a.documentType === 'Blog Article' || a.category === 'Blog')) return true
      
      return false
    })
  }, [articles, activeTab, search])

  // Split into rows
  const sopsAndPolicies = useMemo(() => filtered.filter(a => ['SOP', 'Policy'].includes(a.documentType)), [filtered])
  const blogArticles = useMemo(() => filtered.filter(a => a.documentType === 'Blog Article' || a.category === 'Blog'), [filtered])
  const resourceArticles = useMemo(() => filtered.filter(a => a.documentType === 'Resource'), [filtered])

  // ── DATA PARTITIONING ──
  const { featured, gridItems } = useMemo(() => {
    if (filtered.length === 0) return { featured: null, gridItems: [] }

    const newestPart1 = filtered.find(a => a.partNumber === 1) || filtered[0]
    
    const siblings = filtered.filter(a => 
      a.id !== newestPart1.id && 
      ((a.parentId === newestPart1.id) || (newestPart1.parentId && a.parentId === newestPart1.parentId) || (newestPart1.id === a.parentId))
    ).sort((a, b) => a.partNumber - b.partNumber)

    const others = filtered.filter(a => a.id !== newestPart1.id && !siblings.find(s => s.id === a.id))

    return {
      featured: newestPart1,
      gridItems: [...siblings, ...others].slice(0, 30)
    }
  }, [filtered])

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'Policies' || tab === 'SOPs') {
      setFilterSub(null); setFilterSection(null); setIsCategoryModalOpen(true)
    } else {
      setFilterSub(null); setFilterSection(null); setIsCategoryModalOpen(false)
    }
  }

  const onToggleEmoji = async (articleId: string, emoji: string) => {
    try {
      await toggleReaction('ARTICLE', articleId, emoji, '/knowledge')
    } catch (err) {
      toast.error('Failed to react')
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-12">
      
      {/* ── TOP NAVIGATION ── */}
      <div className="bg-white rounded-[2.5rem] p-3 shadow-premium border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none w-full md:w-auto">
          {NAVIGATION_TABS.map(tab => (
            <button key={tab} onClick={() => handleTabClick(tab)}
              className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-transparent text-gray-400 hover:text-primary hover:bg-primary/5'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto pr-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input 
              type="text" placeholder="Search Knowledge..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="shrink-0 bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-xl hover:bg-primary/90 transition-all text-xs flex items-center gap-2 uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Knowledge
          </button>
        </div>
      </div>

      {/* ── BREADCRUMBS ── */}
      {(filterSub || filterSection) && (
        <div className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
           <span>{activeTab}</span>
           <ChevronRight className="w-3 h-3" />
           <span className="text-primary">{filterSub}</span>
           {filterSection && (
             <>
               <ChevronRight className="w-3 h-3" />
               <span className="text-gold-leeds">{filterSection}</span>
             </>
           )}
           <button onClick={() => { setFilterSub(null); setFilterSection(null) }} className="ml-4 text-destructive hover:scale-110 transition-transform">
             Clear Filters
           </button>
        </div>
      )}

      {/* ── FEATURED SPOTLIGHT ── */}
      <AnimatePresence mode="wait">
        {featured && (
          <FeaturedKnowledgeCard 
            article={featured} 
            userId={userId} 
            onReact={onToggleEmoji} 
            onCommentClick={() => setCommentingArticle(featured)} 
            onViewPdf={(url: string) => setSelectedPdf(url)}
          />
        )}
      </AnimatePresence>

      {/* ── SECTIONS ── */}
      <div className="space-y-16">
        {/* ROW 1: SOPs & Policies */}
        {(activeTab === 'All' || activeTab === 'Policies' || activeTab === 'SOPs') && sopsAndPolicies.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-800 flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-blue-600" /> SOPs & Institutional Policies
              </h2>
              <div className="h-px flex-1 bg-slate-100 mx-6 hidden md:block" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sopsAndPolicies.slice(0, 6).map((article, i) => (
                <KnowledgeCard 
                  key={article.id} article={article} index={i} userId={userId}
                  onReact={onToggleEmoji} onCommentClick={() => setCommentingArticle(article)}
                  onViewPdf={(url: string) => setSelectedPdf(url)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ROW 2: Blog Articles */}
        {(activeTab === 'All' || activeTab === 'Blog Articles') && blogArticles.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-800 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-emerald-600" /> Professional Blog Articles
              </h2>
              <div className="h-px flex-1 bg-slate-100 mx-6 hidden md:block" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogArticles.slice(0, 6).map((article, i) => (
                <KnowledgeCard 
                  key={article.id} article={article} index={i} userId={userId}
                  onReact={onToggleEmoji} onCommentClick={() => setCommentingArticle(article)}
                  onViewPdf={(url: string) => setSelectedPdf(url)}
                  isBlog
                />
              ))}
            </div>
          </section>
        )}

        {/* ROW 3: Resources */}
        {(activeTab === 'All' || activeTab === 'Resources') && resourceArticles.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-800 flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5 text-amber-600" /> Resource Library
              </h2>
              <div className="h-px flex-1 bg-slate-100 mx-6 hidden md:block" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resourceArticles.slice(0, 6).map((article, i) => (
                <KnowledgeCard 
                  key={article.id} article={article} index={i} userId={userId}
                  onReact={onToggleEmoji} onCommentClick={() => setCommentingArticle(article)}
                  onViewPdf={(url: string) => setSelectedPdf(url)}
                />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4 text-slate-300">
            <BookOpen className="w-16 h-16" />
            <p className="font-black uppercase tracking-widest text-sm text-slate-900">No results found</p>
            <p className="text-[10px] font-bold">Try searching for keywords or changing the category tab.</p>
          </div>
        )}
      </div>

      <AddKnowledgeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} isAdmin={isAdmin} />
      <CategoryFilterModal 
        isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} activeTab={activeTab}
        onSelect={(sub: string, sec: string) => { setFilterSub(sub); setFilterSection(sec); setIsCategoryModalOpen(false) }} 
      />
      <CommentModal 
        article={articles.find(a => a.id === commentingArticle?.id) || commentingArticle} 
        onClose={() => setCommentingArticle(null)} 
        user={session?.user}
      />
      <PDFViewerModal url={selectedPdf} title="Document View" onClose={() => setSelectedPdf(null)} />
    </div>
  )
}

function FeaturedKnowledgeCard({ article, userId, onReact, onCommentClick, onViewPdf }: any) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isPDF = !!article.pdfUrl
  const reactionEmojis = ['❤️', '👍', '👎', '👏']
  const reactionsMap = useMemo(() => {
    const map: Record<string, { count: number, userList: string[], hasReacted: boolean }> = {}
    reactionEmojis.forEach(e => map[e] = { count: 0, userList: [], hasReacted: false })
    article.reactions?.forEach((r: any) => {
      if (map[r.emoji]) {
        map[r.emoji].count++
        map[r.emoji].userList.push(r.user.name)
        if (r.userId === userId) map[r.emoji].hasReacted = true
      }
    })
    return map
  }, [article.reactions, userId])

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3.5rem] overflow-hidden shadow-premium border border-gray-50 flex flex-col lg:flex-row min-h-[450px]">
      <div className="lg:w-1/2 relative min-h-[300px] bg-gray-50">
        <img src={article.imageUrl || '/images/placeholder-knowledge.jpg'} alt="" className="absolute inset-0 w-full h-full object-contain" />
        <div className="absolute top-8 left-8"><span className="px-6 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">Latest Release</span></div>
      </div>
      <div className="lg:w-1/2 p-10 md:p-14 flex flex-col justify-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gold-leeds"><Sparkles className="w-4 h-4" /> {article.documentType} · {article.mainCategory}</div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{article.title} {article.isMultipart && <span className="text-primary ml-4">Part {article.partNumber}</span>}</h2>
          
          <motion.div 
            initial={false}
            animate={{ height: isExpanded ? 'auto' : '100px' }}
            className="overflow-hidden relative"
          >
            <p className={`text-sm md:text-base text-gray-500 font-medium leading-relaxed ${!isExpanded && 'line-clamp-4'}`}>
              {article.content}
            </p>
            {!isExpanded && article.content.length > 200 && (
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            )}
          </motion.div>

          {article.content.length > 200 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              {isExpanded ? 'See Less' : 'See More'}
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between pt-8 border-t border-gray-100">
           <div className="flex items-center gap-3"><UserAvatar imageUrl={article.author.image} name={article.author.name} size="md" /><div><p className="text-xs font-black uppercase leading-none">{article.author.name}</p><p className="text-[10px] font-bold text-gray-400 mt-1">{format(new Date(article.createdAt), 'MMM dd, yyyy')}</p></div></div>
           <div className="flex items-center gap-6">
              <div className="flex -space-x-1">{reactionEmojis.map(emoji => (<ReactionIcon key={emoji} emoji={emoji} data={reactionsMap[emoji]} onClick={() => onReact(article.id, emoji)} />))}</div>
              <button onClick={onCommentClick} className="flex items-center gap-2 text-gray-300 hover:text-gold-leeds transition-colors"><MessageCircle className="w-5 h-5" /><span className="text-xs font-black">{article.comments?.length || 0}</span></button>
           </div>
        </div>
        <div className="flex gap-4">{isPDF ? (
            <button onClick={() => onViewPdf(article.pdfUrl)} className="flex-1 flex items-center justify-center gap-2 py-5 bg-primary text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary/90 transition-all">
              <Eye className="w-4 h-4" /> View Online
            </button>
          ) : (
            <Link href={`/intranet/knowledge/${article.id}`} className="flex-1 flex items-center justify-center gap-2 py-5 bg-primary text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary/90 transition-all">
              Dive In <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function KnowledgeCard({ article, index, userId, onReact, onCommentClick, onViewPdf, isBlog }: any) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isPDF = !!article.pdfUrl
  const reactionEmojis = ['❤️', '👍', '👎', '👏']
  
  // 500 word limit corresponds to roughly 3000-3500 chars.
  // We'll enforce it specifically for blogs if they exceed that.
  const wordLimit = 500
  const contentWords = article.content.split(/\s+/)
  const isOverLimit = contentWords.length > wordLimit
  const displayedContent = (isBlog && isOverLimit && !isExpanded) 
    ? contentWords.slice(0, wordLimit).join(' ') + '...' 
    : article.content
  const reactionsMap = useMemo(() => {
    const map: Record<string, { count: number, userList: string[], hasReacted: boolean }> = {}
    reactionEmojis.forEach(e => map[e] = { count: 0, userList: [], hasReacted: false })
    article.reactions?.forEach((r: any) => { if (map[r.emoji]) { map[r.emoji].count++; map[r.emoji].userList.push(r.user.name); if (r.userId === userId) map[r.emoji].hasReacted = true } })
    return map
  }, [article.reactions, userId])

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="group bg-white rounded-[3rem] overflow-hidden shadow-soft border border-gray-50 flex flex-col">
      <div className="relative h-56 overflow-hidden bg-gray-50 flex items-center justify-center p-2">
        <img src={article.imageUrl || '/images/placeholder-knowledge.jpg'} alt="" className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-6 left-6"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border backdrop-blur-md ${article.documentType === 'Policy' ? 'bg-primary/20 text-primary border-primary/20' : article.documentType === 'SOP' ? 'bg-black/20 text-black border-black/20' : 'bg-gold-leeds/20 text-gold-leeds border-gold-leeds/20'}`}>{article.documentType}</span></div>
        {isPDF && <div className="absolute top-6 right-6"><div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white"><FileIcon className="w-5 h-5" /></div></div>}
      </div>
      <div className="p-8 flex-1 flex flex-col space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase"><Clock className="w-3.5 h-3.5" /> {format(new Date(article.createdAt), 'MMM dd, yyyy')}</div>
          <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors leading-tight line-clamp-2">{article.title} {article.isMultipart && <span className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded">Part {article.partNumber}</span>}</h3>
          
          <div className="relative">
            <p className={`text-xs font-medium text-slate-500 leading-relaxed ${(!isExpanded && !isBlog) && 'line-clamp-3'}`}>
              {displayedContent}
            </p>
            {(article.content.length > 100 || isOverLimit) && (
              <button 
                onClick={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }}
                className="text-[9px] font-black uppercase tracking-tighter text-blue-600 mt-2 flex items-center gap-1 hover:underline"
              >
                {isExpanded ? 'Show Less' : 'Read More'}
                <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
        <div className="pt-6 border-t border-gray-50 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2"><UserAvatar imageUrl={article.author.image} name={article.author.name} size="xs" /><span className="text-[10px] font-black uppercase text-gray-900">{article.author.name.split(' ')[0]}</span></div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-1">{reactionEmojis.map(emoji => (<ReactionIcon key={emoji} emoji={emoji} data={reactionsMap[emoji]} onClick={() => onReact(article.id, emoji)} />))}</div>
            <button onClick={onCommentClick} className="flex items-center gap-1.5 text-gray-300 hover:text-gold-leeds"><MessageCircle className="w-4 h-4" /><span className="text-[10px] font-black">{article.comments?.length || 0}</span></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {isPDF ? (
            <><button onClick={() => onViewPdf(article.pdfUrl)} className="flex items-center justify-center gap-2 py-3 bg-primary/5 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"><Eye className="w-3.5 h-3.5" /> View</button>
            <a href={article.pdfUrl} download className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"><Download className="w-3.5 h-3.5" /> Get</a></>
          ) : (<Link href={`/intranet/knowledge/${article.id}`} className="col-span-2 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 shadow-md transition-all">Read Article <ArrowRight className="w-4 h-4" /></Link>)}
        </div>
      </div>
    </motion.div>
  )
}

function ReactionIcon({ emoji, data, onClick }: { emoji: string, data: any, onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false)
  const renderEmoji = (e: string) => {
    if (e === '❤️') return <CustomHeart size={18} animate={false} />
    return e
  }
  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <button onClick={onClick} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all hover:scale-125 ${data.hasReacted ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-100 text-gray-100'}`}>{renderEmoji(emoji)}</button>
      <AnimatePresence>{isHovered && data.count > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white p-3 rounded-2xl shadow-premium z-[60] min-w-[150px] pointer-events-none">
          <div className="space-y-1"><p className="text-[9px] font-black uppercase border-b border-white/10 pb-1 mb-1">{emoji} Reactions</p>
          {data.userList?.map((name: string, i: number) => (<div key={i} className="text-[9px] font-bold">· {name}</div>))}</div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  )
}

function CommentModal({ article, onClose, user }: { article: any, onClose: () => void, user: any }) {
  const [commentText, setCommentText] = useState('')
  const [isPending, startTransition] = useTransition()
  
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    article?.comments || [],
    (state: any[], newComment: any) => [...state, newComment]
  )

  if (!article) return null

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || isPending) return

    const newComment = {
      id: `temp-${Date.now()}`,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
      user: {
        name: user?.name || 'You',
        image: user?.image || null
      }
    }

    addOptimisticComment(newComment)
    const currentText = commentText
    setCommentText('')

    startTransition(async () => {
      const fd = new FormData()
      fd.append('articleId', article.id)
      fd.append('content', currentText)
      try {
        await addComment(fd)
        toast.success('Comment posted!')
      } catch (err) {
        toast.error('Failed to post comment')
        setCommentText(currentText) // Restore text on failure
      }
    })
  }
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-premium overflow-hidden">
        <div className="p-8 md:p-10 flex flex-col h-[80vh]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
            <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-gold-leeds/10 flex items-center justify-center text-gold-leeds"><MessageCircle className="w-6 h-6" /></div><div><h3 className="text-xl font-black uppercase text-gray-900 leading-none">Discussion</h3><p className="text-[10px] font-bold text-gray-400 mt-2 truncate max-w-[300px]">{article.title}</p></div></div>
            <button onClick={onClose} className="text-gray-300 hover:text-destructive"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {optimisticComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 space-y-4">
                <MessageCircle className="w-12 h-12 opacity-20" />
                <p className="font-black uppercase tracking-widest text-xs">No comments yet</p>
              </div>
            ) : (
              optimisticComments.map((comment: any) => (
                <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-left-2">
                  <UserAvatar imageUrl={comment.user.image} name={comment.user.name} size="xs" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-gray-900">{comment.user.name}</span>
                      <span className="text-[9px] font-bold text-gray-300">
                        {comment.id.startsWith('temp-') ? 'Posting...' : format(new Date(comment.createdAt), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                      <p className="text-sm font-medium text-gray-600 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-6 border-t border-gray-100">
            <form onSubmit={handlePost} className="flex gap-3">
              <input 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..." 
                disabled={isPending}
                className="flex-1 bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
              <button 
                type="submit" 
                disabled={isPending || !commentText.trim()}
                className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:grayscale disabled:opacity-50"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function PDFViewerModal({ url, title, onClose }: { url: string | null, title: string, onClose: () => void }) {
  if (!url) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="flex flex-col h-full">
           <div className="p-6 md:px-10 flex items-center justify-between border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white"><FileIcon className="w-5 h-5" /></div>
                 <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-gray-900">{title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{url.split('/').pop()}</p>
                 </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-destructive transition-all hover:rotate-90">
                 <X className="w-6 h-6" />
              </button>
           </div>
           <div className="flex-1 bg-gray-200 p-2 relative">
             <iframe src={`${url}#toolbar=0`} className="w-full h-full rounded-2xl shadow-inner border-0" />
           </div>
           <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-center gap-6">
              <a href={url} download className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all">
                 <Download className="w-4 h-4" /> Download Local Copy
              </a>
              <button onClick={onClose} className="px-8 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                 Close Viewer
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  )
}

function CategoryFilterModal({ isOpen, onClose, activeTab, onSelect }: any) {
  const [selectedMain, setSelectedMain] = useState<string | null>(null)
  if (!isOpen) return null
  const isPolicies = activeTab === 'Policies'; const subCategories = isPolicies ? POLICY_SUB_CATEGORIES : SOP_SUB_CATEGORIES
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/50">
        <div className="p-8 md:p-12 space-y-10">
          <div className="flex items-center justify-between"><div className="space-y-1"><h2 className="text-3xl font-black uppercase tracking-tight text-primary">Browse <span className="text-gold-leeds">{activeTab}</span></h2><p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Select a category</p></div><button onClick={onClose} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-destructive"><X className="w-6 h-6" /></button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subCategories.map(cat => (<button key={cat.id} onClick={() => { if (cat.id === 'Academic' || cat.id === 'Operations') setSelectedMain(cat.id); else onSelect(cat.id, null) }} className={`flex flex-col items-center justify-center p-10 rounded-[2.5rem] border-2 transition-all ${selectedMain === cat.id ? 'bg-primary border-primary text-white scale-105' : 'bg-white border-gray-100'}`}><div className={`w-16 h-16 rounded-3xl mb-6 flex items-center justify-center transition-all ${selectedMain === cat.id ? 'bg-white/20' : 'bg-primary/5'}`}><cat.icon className={`w-8 h-8 ${selectedMain === cat.id ? 'text-white' : cat.color}`} /></div><span className={`text-[11px] font-black uppercase tracking-widest text-center ${selectedMain === cat.id ? 'text-white' : 'text-gray-900'}`}>{cat.title}</span></button>))}
          </div>
          <AnimatePresence>{selectedMain && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-6 border-t border-gray-100"><p className="text-[10px] font-black uppercase text-gray-400 mb-6">Select Specific {selectedMain} Section</p><div className="flex flex-wrap gap-3">{(selectedMain === 'Academic' ? ACADEMIC_SECTIONS : OPERATIONS_SECTIONS).map(sec => (<button key={sec} onClick={() => onSelect(selectedMain, sec)} className="px-6 py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-bold transition-all">{sec}</button>))}</div></motion.div>)}</AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function AddKnowledgeModal({ isOpen, onClose, isAdmin }: any) {
  const [step, setStep] = useState(1); const [formData, setFormData] = useState({ documentType: '', mainCategory: '', subCategory: '', academicCategory: '', title: '', description: '', visibility: 'ALL', isMultipart: false, tags: '' }); const [loading, setLoading] = useState(false); const formRef = useRef<HTMLFormElement>(null)
  if (!isOpen) return null; const handleNext = () => setStep(step + 1); const handleBack = () => setStep(step - 1)
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); const fd = new FormData(formRef.current!); fd.append('isMultipart', formData.isMultipart.toString()); try { await createArticle(fd); toast.success('Submitted!'); onClose(); setStep(1) } catch (err: any) { toast.error(err.message) } finally { setLoading(false) } }
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-primary/30 backdrop-blur-xl" />
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden">
        <form ref={formRef} onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto scrollbar-none border-[3px] border-primary/5 rounded-[3rem]">
          <div className="flex flex-col gap-6 sticky top-0 bg-white z-20 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Add <span className="text-gold-leeds">Knowledge</span></h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Resource Creation Suite</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-300 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Step Progress Indicator */}
            <div className="flex items-center justify-between px-2 gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-gray-100'}`} />
                  {s < 4 && <div className={`w-2 h-2 rounded-full shrink-0 ${step > s ? 'bg-primary' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            {step === 1 && (<motion.div key="1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6"><p className="text-[10px] font-black uppercase text-primary">Step 1: Select Type</p><div className="grid grid-cols-2 gap-4">{DOCUMENT_TYPES.map(type => { const disabled = !isAdmin && type !== 'Blog Article'; return (<button key={type} type="button" disabled={disabled} onClick={() => { setFormData({...formData, documentType: type}); handleNext() }} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${disabled ? 'opacity-30 grayscale cursor-not-allowed bg-gray-50' : formData.documentType === type ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-gray-100'}`}><FileText className="w-6 h-6" /><span className="text-[10px] font-black uppercase">{type}</span></button>) })}</div></motion.div>)}
            {step === 2 && (<motion.div key="2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">{(formData.documentType === 'Policy' || formData.documentType === 'SOP') ? (<><p className="text-[10px] font-black uppercase text-primary">Step 2: Main Category</p><div className="grid grid-cols-2 gap-4">{['Operations', 'Academic'].map(cat => (<button key={cat} type="button" onClick={() => { setFormData({...formData, mainCategory: cat}); handleNext() }} className={`p-10 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${formData.mainCategory === cat ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-gray-100'}`}>{cat === 'Academic' ? <GraduationCap className="w-10 h-10" /> : <Settings className="w-10 h-10" />}<span className="text-[11px] font-black uppercase">{cat}</span></button>))}</div></>) : 
              (<div className="py-12 text-center space-y-4"><Check className="w-12 h-12 text-teal-500 mx-auto" /><p className="font-black uppercase text-sm">General Content</p><button type="button" onClick={handleNext} className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px]">Continue</button></div>)}</motion.div>)}
            {step === 3 && (<motion.div key="3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">{formData.mainCategory ? (<><p className="text-[10px] font-black uppercase text-primary">Step 3: Sub-Category</p><div className="grid grid-cols-1 gap-3">{(formData.mainCategory === 'Academic' ? ['Academic Management', 'Academic Operations'] : OPERATIONS_SECTIONS).map(sec => (<button key={sec} type="button" onClick={() => { setFormData({...formData, subCategory: sec}); handleNext() }} className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${formData.subCategory === sec ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-gray-100'}`}><span className="text-xs font-bold">{sec}</span><ChevronRight className="w-4 h-4" /></button>))}</div></>) : 
              (<div className="py-12 text-center space-y-4"><Check className="w-12 h-12 text-teal-500 mx-auto" /><p className="font-black uppercase text-sm">Continue to Content</p><button type="button" onClick={handleNext} className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px]">Continue</button></div>)}</motion.div>)}
            {step === 4 && (<motion.div key="4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
               {formData.mainCategory === 'Academic' && (<div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100"><p className="text-[9px] font-black uppercase text-gray-400">Final Focus</p><select name="academicCategory" required className="w-full bg-white border border-gray-200 p-4 rounded-2xl text-xs font-bold"><option value="">Select Focus...</option>{ACADEMIC_SECTIONS.map(sec => <option key={sec} value={sec}>{sec}</option>)}</select></div>)}
               <div className="space-y-6">
                  <input name="title" required placeholder="Resource Title..." className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none" />
                  <textarea name="description" required rows={5} placeholder="Full content..." className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-medium outline-none" />
                  <div className="flex items-center gap-3"><input type="checkbox" id="isMultipart" checked={formData.isMultipart} onChange={e => setFormData({...formData, isMultipart: e.target.checked})} className="w-4 h-4 rounded text-primary" /><label htmlFor="isMultipart" className="text-xs font-black text-primary uppercase cursor-pointer">Multi-Part split</label></div>
                  <div className="grid grid-cols-2 gap-6"><div className="space-y-2"><label className="text-[10px] font-black text-gray-400">Image</label><input type="file" name="image" accept="image/*" required className="w-full text-xs" /></div><div className="space-y-2"><label className="text-[10px] font-black text-gray-400">PDF</label><input type="file" name="pdf" accept=".pdf" className="w-full text-xs" /></div></div>
                  <div className="space-y-4"><label className="text-[10px] font-black text-gray-400">Visibility</label><div className="flex flex-wrap gap-2">{['ALL', 'Academic Staff Only', 'Operations Staff Only'].map(v => (<button key={v} type="button" onClick={() => setFormData({...formData, visibility: v})} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${formData.visibility === v ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>{v}</button>))}<input type="hidden" name="visibility" value={formData.visibility} /></div></div>
               </div>
               <div className="flex gap-4"><button type="button" onClick={handleBack} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px]">Back</button><button type="submit" disabled={loading} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] shadow-xl disabled:opacity-50">{loading ? 'Publishing...' : 'Publish'}</button></div>
            </motion.div>)}
          </AnimatePresence>

          {/* Persistent Hidden Inputs for Form Submission */}
          <input type="hidden" name="documentType" value={formData.documentType} />
          <input type="hidden" name="mainCategory" value={formData.mainCategory} />
          <input type="hidden" name="subCategory" value={formData.subCategory} />
        </form>
      </motion.div>
    </div>
  )
}
