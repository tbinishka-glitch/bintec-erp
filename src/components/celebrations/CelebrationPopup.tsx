'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, PartyPopper, Trophy, Heart } from 'lucide-react';
import Image from 'next/image';

interface CelebrationPopupProps {
  celebration: {
    id: string;
    type: string;
    title: string;
    message?: string;
    imageUrl?: string;
    priority: string;
  } | null;
}

export function CelebrationPopup({ celebration }: CelebrationPopupProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (celebration) {
      // Small delay for impact
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [celebration]);

  if (!celebration || !isVisible) return null;

  const isCorporate = celebration.priority === 'CORPORATE' || celebration.priority === 'HIGH';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed top-6 right-6 z-[100] w-[380px] pointer-events-auto"
        >
          <div className={`relative overflow-hidden rounded-[2.5rem] shadow-2xl border ${
            isCorporate 
              ? 'bg-slate-900 border-gold-leeds/30' 
              : 'bg-white border-slate-100'
          }`}>
            
            {/* Background Festive Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <Sparkles className={`absolute top-4 right-10 ${isCorporate ? 'text-gold-leeds' : 'text-blue-500'}`} size={40} />
              <PartyPopper className={`absolute bottom-4 left-4 ${isCorporate ? 'text-gold-leeds' : 'text-rose-500'}`} size={32} />
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setIsVisible(false)}
              className={`absolute top-4 right-4 p-2 rounded-xl transition-colors z-20 ${
                isCorporate 
                  ? 'text-white/40 hover:bg-white/10' 
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              <X size={18} />
            </button>

            <div className="relative z-10 p-6 flex flex-col gap-4">
              {/* Header Badge */}
              <div className="flex items-center gap-2">
                 <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                   isCorporate 
                    ? 'bg-gold-leeds/20 text-gold-leeds border border-gold-leeds/20' 
                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                 }`}>
                   {celebration.priority === 'CORPORATE' ? <Trophy size={10} /> : <Sparkles size={10} />}
                   {celebration.type.replace('_', ' ')}
                 </div>
                 {isCorporate && (
                   <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Management Advisory</span>
                 )}
              </div>

              {/* Image Section */}
              {celebration.imageUrl && (
                <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-lg">
                  <Image 
                    src={celebration.imageUrl} 
                    alt={celebration.title} 
                    fill 
                    className="object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${isCorporate ? 'from-slate-900/60' : 'from-black/40'} via-transparent to-transparent`} />
                </div>
              )}

              {/* Content Section */}
              <div className="space-y-2">
                <h3 className={`text-xl font-black leading-tight tracking-tight ${
                  isCorporate ? 'text-white italic' : 'text-slate-900'
                }`}>
                  {celebration.title}
                </h3>
                {celebration.message && (
                  <p className={`text-xs font-medium leading-relaxed italic ${
                    isCorporate ? 'text-white/70' : 'text-slate-500'
                  }`}>
                    "{celebration.message}"
                  </p>
                )}
              </div>

              {/* Footer Interactive */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className={`flex items-center gap-4 text-[9px] font-black uppercase tracking-widest ${
                  isCorporate ? 'text-gold-leeds' : 'text-blue-600'
                }`}>
                   <span className="flex items-center gap-1.5 cursor-pointer hover:scale-110 transition-transform">
                     <Heart size={14} className="fill-current" /> Celebrate
                   </span>
                </div>
                <div className={`text-[8px] font-bold uppercase tracking-widest ${
                  isCorporate ? 'text-white/20' : 'text-slate-300'
                }`}>
                  Published Just Now
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
