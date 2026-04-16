import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { 
  Settings, Bell, Lock, Palette, 
  Smartphone, Languages, Shield, HelpCircle 
} from 'lucide-react'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const settingGroups = [
    {
      title: 'Security & Access',
      icon: Lock,
      items: [
        { label: 'Password Management', desc: 'Update your institutional credentials', icon: Shield },
        { label: 'Session Visibility', desc: 'Manage your active ERP sessions', icon: Smartphone },
      ]
    },
    {
      title: 'Preferences',
      icon: Palette,
      items: [
        { label: 'Theme Configuration', desc: 'Customize your platform aesthetics', icon: Palette },
        { label: 'System Language', desc: 'Select your preferred working language', icon: Languages },
      ]
    },
    {
      title: 'Alerting',
      icon: Bell,
      items: [
        { label: 'Notification Settings', desc: 'Manage institutional transmissions', icon: Bell },
      ]
    }
  ]

  return (
    <div className="flex-1 space-y-10 p-10 bg-[#F8F9FC] min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-black uppercase">System <span className="text-primary">Settings</span></h1>
        <p className="text-sm font-medium text-slate-400">Manage your personalized Leeds ERP environment and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {settingGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-[2.5rem] shadow-premium border border-gray-50 overflow-hidden transform hover:scale-[1.01] transition-all">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-primary">
                <group.icon size={20} />
              </div>
              <h2 className="text-sm font-black text-black uppercase tracking-widest">{group.title}</h2>
            </div>
            
            <div className="p-4 space-y-2">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all text-left group"
                >
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:text-primary group-hover:bg-white transition-all shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[13px] font-bold text-black">{item.label}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Support Section */}
        <div className="bg-primary text-white rounded-[2.5rem] shadow-premium p-10 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
            <HelpCircle size={160} />
          </div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">Need Platform Assistance?</h2>
            <p className="text-white/60 text-sm font-medium max-w-xs">Our institutional technical team is available to assist with accessibility and security configurations.</p>
            <button className="px-8 py-3 bg-white text-primary rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">
              Contact Command Center
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
