'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, X, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { UserAvatar } from './UserAvatar'

interface AvatarUploaderProps {
  userId: string
  currentImage?: string | null
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  size?: 'lg' | 'xl' | '2xl'
  onUploadComplete?: (imageUrl: string) => void
}

export function AvatarUploader({
  userId,
  currentImage,
  name,
  firstName,
  lastName,
  size = 'xl',
  onUploadComplete
}: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus('error')
      setErrorMsg('Only image files are supported.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus('error')
      setErrorMsg('File must be under 5MB.')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload
    setStatus('uploading')
    setErrorMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('userId', userId)
      const res = await fetch('/api/upload-avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setStatus('success')
      if (onUploadComplete) onUploadComplete(data.imageUrl)
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Upload failed. Please try again.')
      setPreview(currentImage || null)
    }
  }, [userId, currentImage, onUploadComplete])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const sizeMap = { lg: 'w-16 h-16', xl: 'w-20 h-20', '2xl': 'w-28 h-28' }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview + Overlay */}
      <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
        <div 
          className={`${sizeMap[size]} rounded-3xl overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300 shadow-lg`}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
        >
          {preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center text-white text-2xl font-bold">
              {firstName && lastName ? `${firstName[0]}${lastName[0]}` : name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Camera overlay */}
        <div className={`absolute inset-0 rounded-3xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isDragOver ? 'opacity-100 bg-primary/40' : ''}`}>
          <Camera className="w-6 h-6 text-white drop-shadow-md" />
        </div>

        {/* Status badge */}
        {status === 'success' && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        )}
        {status === 'uploading' && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Hidden input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />

      {/* Action button */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={status === 'uploading'}
        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
      >
        <Upload className="w-4 h-4" />
        {status === 'uploading' ? 'Uploading…' : status === 'success' ? 'Change Photo' : 'Upload Photo'}
      </button>

      {/* Status messages */}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMsg}
        </div>
      )}
      {status === 'success' && (
        <p className="text-xs text-teal-600 font-semibold">Photo saved successfully!</p>
      )}

      <p className="text-[10px] text-muted-foreground">JPEG, PNG, WebP or GIF · Max 5MB</p>
    </div>
  )
}
