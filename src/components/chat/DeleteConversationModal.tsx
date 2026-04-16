'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react'

interface DeleteConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  type?: 'CONVERSATION' | 'MESSAGE'
}

export function DeleteConversationModal({ isOpen, onClose, onConfirm, title, type = 'CONVERSATION' }: DeleteConversationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } catch (err) {
      console.error('Deletion failed', err)
      setIsDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#4A5568]/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-border p-10 overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -translate-y-16 translate-x-16 opacity-50" />
            
            <div className="relative space-y-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
                <Trash2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                   Are You sure you want to delete this {type === 'CONVERSATION' ? 'Conversation' : 'Message'}
                </h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest px-4">
                  {type === 'CONVERSATION' 
                    ? `Chat with "${title}" will be permanently removed for all participants.`
                    : 'This specific message will be removed from the audit trail and hidden for all staff.'
                  }
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-4">
                <button 
                  onClick={handleConfirm}
                  disabled={isDeleting}
                  className="w-full py-5 bg-red-500 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-200 hover:bg-red-600 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    `Yes, Delete ${type === 'CONVERSATION' ? 'Conversation' : 'Message'}`
                  )}
                </button>
                
                <button 
                  onClick={onClose}
                  disabled={isDeleting}
                  className="w-full py-5 bg-gray-50 text-gray-500 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-gray-100 transition-all"
                >
                  No, Go Back
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest pt-2">
                <AlertTriangle className="w-3 h-3" /> Audit Permanent Action
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
