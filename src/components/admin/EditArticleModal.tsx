'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, FileText, Image as ImageIcon, FileIcon, User, Shield, ChevronRight } from 'lucide-react'
import { updateArticle } from '@/app/intranet/knowledge/actions'
import { toast } from 'sonner'

export function EditArticleModal({ article, isOpen, onClose }: { article: any, isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(formRef.current!)
    fd.append('id', article.id)
    
    try {
      await updateArticle(fd)
      toast.success('Article updated successfully')
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 md:p-12 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Edit Article</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Resource Governance Suite</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-none">
            {/* Basic Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Title</label>
                <input 
                  name="title" 
                  defaultValue={article.title} 
                  required 
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Content</label>
                <textarea 
                  name="content" 
                  defaultValue={article.content} 
                  required 
                  rows={8}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Categorization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Visibility</label>
                <select 
                  name="visibility" 
                  defaultValue={article.visibility}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none"
                >
                  <option value="ALL">ALL (Everyone)</option>
                  <option value="ACADEMIC">ACADEMIC (Academic Staff Only)</option>
                  <option value="OPERATIONS">OPERATIONS (Operations Staff Only)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Document Type</label>
                <select 
                  name="documentType" 
                  defaultValue={article.documentType}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none"
                >
                  <option value="Policy">Policy</option>
                  <option value="SOP">SOP</option>
                  <option value="Resource">Resource</option>
                  <option value="Blog Article">Blog Article</option>
                </select>
              </div>
            </div>

            {/* Media Updates */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-gray-400 ml-1">Update Media (Optional)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center gap-3 text-center">
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Change Image</span>
                  <input type="file" name="image" accept="image/*" className="text-[10px] w-full" />
                </div>
                <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center gap-3 text-center">
                  <FileIcon className="w-6 h-6 text-gray-300" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Replace PDF</span>
                  <input type="file" name="pdf" accept=".pdf" className="text-[10px] w-full" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tags (Comma separated)</label>
              <input 
                name="tags" 
                defaultValue={article.tags || ''} 
                placeholder="e.g. HR, Rules, Onboarding"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-8 flex gap-4 sticky bottom-0 bg-white">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
