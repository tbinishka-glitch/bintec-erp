'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ExternalLink, Plus, Info, ShieldCheck, HeartPulse, Wallet, Calendar } from 'lucide-react';
import { CustomHeart } from '@/components/ui/CustomHeart';

const CATEGORY_ICONS: Record<string, any> = {
  'Health': HeartPulse,
  'Leave': Calendar,
  'Finance': Wallet,
  'Mental Wellness': () => <CustomHeart size={20} animate={false} />,
  'Safety': ShieldCheck,
  'Benefits': Star,
  'Other': Info,
}

import { Star } from 'lucide-react';

export function WelfareClient({ 
  resources, 
  categories, 
  isAdmin, 
  addResourceAction 
}: { 
  resources: any[], 
  categories: string[], 
  isAdmin: boolean,
  addResourceAction: (formData: FormData) => void
}) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-24 space-y-12">
      
      {/* ── HEADER SECTION ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[2.5rem] bg-gradient-to-r from-[#5A2D82] via-[#5A2D82] to-[#7c4da6] text-white overflow-hidden shadow-premium shadow-primary/20"
      >
        <div className="relative py-12 md:py-20 px-10 md:px-14 z-10 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
              <CustomHeart size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Welfare <span className="text-gold-leeds">Hub</span></h1>
              <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mt-2">Leeds Staff Well-being & Support</p>
            </div>
          </div>
          <p className="text-base md:text-lg text-white/80 font-medium leading-relaxed max-w-lg">
            A comprehensive repository of health benefits, leave guidelines, wellness resources, and corporate support policies.
          </p>
        </div>
      </motion.div>

      {/* ── ADMIN: ADD RESOURCE ── */}
      {isAdmin && (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border-2 border-dashed border-primary/10">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
               <Plus className="w-5 h-5 text-primary" />
             </div>
             <h3 className="text-xl font-black text-gray-900 tracking-tight">Add Support Resource</h3>
          </div>
          <form action={addResourceAction} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label htmlFor="title" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
              <input id="title" name="title" required type="text" placeholder="e.g. Employee Assistance"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-[1.25rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <select id="category" name="category" required
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-[1.25rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">Select Category…</option>
                {['Health', 'Leave', 'Finance', 'Mental Wellness', 'Safety', 'Benefits', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="link" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">External Link (Optional)</label>
              <input id="link" name="link" type="text" placeholder="https://..."
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-[1.25rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label htmlFor="description" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Details & Purpose</label>
              <textarea id="description" name="description" rows={3} placeholder="Provide clear guidance for staff..."
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all" />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="px-10 py-4 bg-primary hover:bg-primary/95 text-white text-sm font-black rounded-2xl shadow-premium shadow-primary/20 transition-all">
                Publish Resource
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── RESOURCES BY CATEGORY ── */}
      {categories.length === 0 ? (
        <div className="py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
           <CustomHeart size={64} className="opacity-10 mb-6" />
           <p className="text-xl font-black text-gray-900 uppercase tracking-widest">Repository Empty</p>
           <p className="text-xs font-bold text-gray-300 mt-2 uppercase tracking-widest leading-relaxed">HR will add welfare resources soon</p>
        </div>
      ) : (
        categories.map(cat => {
          const Icon = CATEGORY_ICONS[cat] || Info;
          return (
            <section key={cat} className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex items-center gap-4 ml-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/5">
                  {typeof Icon === 'function' ? <Icon /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-wider">{cat}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-0.5">Leeds Support Services</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resources.filter(r => r.category === cat).map(r => (
                  <motion.div 
                    key={r.id}
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-50 flex flex-col gap-6 group hover:shadow-premium hover:border-primary/5 transition-all"
                  >
                    <div className="flex-1 space-y-3">
                      <h4 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors leading-tight">{r.title}</h4>
                      {r.description && <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-4">{r.description}</p>}
                    </div>
                    {r.link && (
                      <a 
                        href={r.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50 group-hover:bg-primary group-hover:text-white rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest transition-all"
                      >
                        Access Resource <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  );
}
