import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Tag, User, Calendar } from 'lucide-react'

export default async function ArticleDetailPage({ params }: { params: Promise<{ articleId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { articleId } = await params
  const me = await prisma.user.findUnique({ where: { id: session.user.id } })
  const roleName = (session.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(roleName || '')

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { author: { include: { branch: true } } }
  })

  if (!article || article.status !== 'APPROVED') redirect('/knowledge')

  // Category access check for non-admins (Governance)
  if (!isAdmin) {
    const v = article.visibility || 'ALL'
    if (v !== 'ALL') {
      const isAcademic = roleName?.toUpperCase().includes('ACADEMIC') || me?.employeeCategory === 'Academic'
      const userType = isAcademic ? 'ACADEMIC' : 'OPERATIONS'
      
      if (v !== userType) {
        redirect('/knowledge')
      }
    }
  }

  const tagList = article.tags ? article.tags.split(',').map(t => t.trim()) : []
  let targetCats: string[] = []
  try { targetCats = article.targetCategories ? JSON.parse(article.targetCategories) : [] } catch {}

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Link href="/knowledge" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Knowledge Hub
        </Link>
      </header>

      <article className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Article header */}
        <div className="p-8 border-b border-border">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> {article.category}
            </span>
            {targetCats.map(cat => (
              <span key={cat} className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                {cat}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {article.author.name}
              {article.author.branch && ` · ${article.author.branch.name}`}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {format(new Date(article.createdAt), 'MMMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Article body */}
        <div className="p-8">
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>

          {/* Tags */}
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
              <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
              {tagList.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      <div className="text-center">
        <Link href="/knowledge" className="text-sm text-primary hover:underline">
          ← Back to Knowledge Hub
        </Link>
      </div>
    </div>
  )
}
