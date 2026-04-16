'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { deletePublishedArticle } from '@/app/admin/actions'
import { toast } from 'sonner'

export function DeleteArticleButton({ 
  id, 
  category, 
  isMultipart = false, 
  partNumber = 1 
}: { 
  id: string, 
  category: string,
  isMultipart?: boolean,
  partNumber?: number | null
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    // We already have the id from props, but server actions via form action usually provide formData.
    // In this custom modal usage, we'll construct the formData manually.
    const formData = new FormData()
    formData.append('id', id)
    
    startTransition(async () => {
      try {
        await deletePublishedArticle(formData)
        toast.success(isMultipart && partNumber === 1 ? `Article series removed from repository` : `${category} successfully deleted`)
        setShowConfirm(false)
      } catch (error: any) {
        toast.error(error.message || 'Governance action failed')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-12"
            >
              <div className="flex flex-col items-center text-center space-y-8">
                {/* Danger Icon with Glow */}
                <div className="relative">
                   <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                   <div className="relative w-24 h-24 rounded-[2rem] bg-red-50 flex items-center justify-center text-red-600 shadow-xl shadow-red-100/50">
                      <AlertTriangle className="w-12 h-12" />
                   </div>
                </div>
                
                <div className="space-y-3">
                   <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                      Confirm <span className="text-red-600">Deletion</span>
                   </h3>
                   <p className="text-[13px] font-medium text-gray-500 max-w-[300px] leading-relaxed">
                      Do you want to delete this <span className="font-black text-gray-900 underline decoration-red-200 underline-offset-4">{category}</span>? This action is permanent and cannot be reversed.
                   </p>
                </div>

                {isMultipart && partNumber === 1 && (
                  <div className="w-full p-6 bg-gold-leeds/5 border border-gold-leeds/20 rounded-3xl relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-1 h-full bg-gold-leeds" />
                     <p className="text-[10px] font-black text-gold-leeds uppercase tracking-widest leading-relaxed text-left pl-2">
                        ⚠️ Critical Context: Series Root
                     </p>
                     <p className="text-[11px] font-medium text-gray-600 mt-2 text-left pl-2">
                        Deleting Part 1 will recursively remove all associated parts in this series.
                     </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
                   <button 
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      disabled={isPending}
                      className="py-5 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all border border-gray-100"
                   >
                      No, Go Back
                   </button>
                   <button 
                      type="button"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="py-5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                      {isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Yes, Delete'
                      )}
                   </button>
                </div>
              </div>

              {/* Close Icon */}
              <button 
                onClick={() => setShowConfirm(false)}
                className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors"
                aria-label="Close"
              >
                 <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
