import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { Sparkles, Palette, Snowflake, PartyPopper, CheckCircle } from 'lucide-react'

async function updateSetting(formData: FormData) {
  'use server'
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  const normalized = (roleName || '').toUpperCase().replace(/\s+/g, '_')
  const allowedRoles = ['SUPER_ADMIN', 'CORPORATE_ADMIN', 'IT_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN']
  if (!allowedRoles.includes(normalized)) redirect('/')

  const field = formData.get('field') as string;
  const val = formData.get('val') as string;
  
  const updateData: any = {};
  if (val === 'true') updateData[field] = true;
  else if (val === 'false') updateData[field] = false;
  else updateData[field] = val;

  await prisma.systemSetting.upsert({
    where: { id: 'global' },
    update: updateData,
    create: { id: 'global', ...updateData }
  });

  revalidatePath('/', 'layout');
}

export default async function ThemeEnginePage() {
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  const normalized = (roleName || '').toUpperCase().replace(/\s+/g, '_')
  const allowedRoles = ['SUPER_ADMIN', 'CORPORATE_ADMIN', 'IT_ADMIN', 'NETWORK_ADMIN', 'BRANCH_ADMIN']
  if (!allowedRoles.includes(normalized)) redirect('/')

  let settings = await prisma.systemSetting.findUnique({ where: { id: 'global' } });
  if (!settings) {
    settings = await prisma.systemSetting.create({ data: { id: 'global' } });
  }

  const themes = [
    { id: 'default', name: 'Leeds Corporate', color: 'bg-primary' },
    { id: 'christmas', name: 'Christmas', color: 'bg-green-600' },
    { id: 'new-year', name: 'New Year', color: 'bg-yellow-500' },
    { id: 'halloween', name: 'Halloween', color: 'bg-orange-600' },
  ];

  const toggleEffects = [
    { field: 'snowfallEnabled', label: 'Snowfall Effect', icon: Snowflake, val: settings.snowfallEnabled },
    { field: 'santaEnabled', label: 'Flying Santa Sleigh', icon: Sparkles, val: settings.santaEnabled },
    { field: 'confettiEnabled', label: 'Confetti Eruption', icon: PartyPopper, val: settings.confettiEnabled },
    { field: 'fireworksEnabled', label: 'Fireworks Display', icon: Sparkles, val: settings.fireworksEnabled },
    { field: 'balloonsEnabled', label: 'Floating Balloons', icon: PartyPopper, val: settings.balloonsEnabled },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-7 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <PartyPopper className="absolute -top-4 -right-4 w-40 h-40 opacity-20" />
        </div>
        <div className="relative">
          <Link href="/admin" className="text-white/80 hover:text-white text-sm mb-4 inline-block transition-colors">← Back to Admin</Link>
          <h2 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="w-8 h-8" /> Theme Engine</h2>
          <p className="text-white/90 mt-2 max-w-lg">Control global seasonal experiences. Changes here are instantly broadcasted across the network.</p>
        </div>
      </header>

      {/* Global Theme Strategy */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Active Color Theme</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {themes.map(t => {
            const isActive = settings?.activeTheme === t.id;
            return (
              <form key={t.id} action={updateSetting}>
                <input type="hidden" name="field" value="activeTheme" />
                <input type="hidden" name="val" value={t.id} />
                <button type="submit" className={`w-full text-left rounded-xl border-2 p-4 transition-all ${isActive ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-border hover:border-primary/50'}`}>
                  <div className={`w-8 h-8 rounded-full mb-3 shadow-inner ${t.color}`} />
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  {isActive && <CheckCircle className="w-4 h-4 text-primary absolute top-4 right-4" />}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      {/* Global Animation Overlays */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Festive Overlay Engine</h3>
        <p className="text-sm text-muted-foreground mb-6">Toggle specific screen animations. Be mindful of activating too many at once.</p>
        
        <div className="space-y-3">
          {toggleEffects.map(effect => (
            <div key={effect.field} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${effect.val ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <effect.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{effect.label}</p>
                  <p className="text-xs text-muted-foreground">{effect.val ? 'Currently active on all devices' : 'Disabled'}</p>
                </div>
              </div>
              <form action={updateSetting}>
                <input type="hidden" name="field" value={effect.field} />
                <input type="hidden" name="val" value={effect.val ? 'false' : 'true'} />
                <button type="submit"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${effect.val ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${effect.val ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
