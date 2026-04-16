import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createBranch, deleteBranch } from '../actions'
import { DeleteBranchButton } from '../DeleteButtons'

export default async function AdminBranchesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const me = await prisma.user.findUnique({ where: { email: session.user.email as string }, include: { role: true } })
  const normalized = (me?.role?.name || '').toUpperCase().replace(/\s+/g, '_')
  const allowedRoles = ['SUPER_ADMIN', 'CORPORATE_ADMIN', 'IT_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN']
  if (!allowedRoles.includes(normalized)) redirect('/')
  const isBranchAdmin = normalized === 'BRANCH_ADMIN'

  const branches = await prisma.branch.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { users: true } },
    },
  })

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <header className="flex items-center gap-4">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Admin</Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Branches</h2>
          <p className="text-muted-foreground text-sm">{branches.length} branches in the network</p>
        </div>
      </header>

      {/* Create Branch Form */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Add New Branch</h3>
        <form action={createBranch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-foreground">Branch Name <span className="text-destructive">*</span></label>
            <input id="name" name="name" type="text" required placeholder="e.g. Galle Branch"
              className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="location" className="text-sm font-medium text-foreground">Location</label>
            <input id="location" name="location" type="text" placeholder="e.g. Galle City"
              className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
              Create Branch
            </button>
          </div>
        </form>
      </div>

      {/* Branches List */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">All Branches</h3>
        </div>
        <div className="divide-y divide-border">
          {branches.map((b) => (
            <div key={b.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                  {b.name[0]}
                </div>
                <div>
                  <p className="font-bold text-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.location ?? 'Location not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-foreground">{b._count.users}</p>
                  <p className="text-xs text-muted-foreground">staff</p>
                </div>
                <DeleteBranchButton id={b.id} name={b.name} deleteAction={deleteBranch} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
