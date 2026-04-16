'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Menu, Paperclip as PaperclipIcon, Mic, Smile, MoreVertical, Trash2, CheckCheck, RefreshCw, FileIcon, ImageIcon, Download, X as CloseIcon, Share2, Square, CheckSquare } from 'lucide-react'
import { sendMessage, deleteMessage, markAsRead, deleteChatGroup, forwardMessages } from '../actions'
import { ForwardModal } from '@/components/chat/ForwardModal'
import { DeleteConversationModal } from '@/components/chat/DeleteConversationModal'
import { format } from 'date-fns'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { getSocket } from '@/lib/socket'
import { useDropzone } from 'react-dropzone'

export function ChatWindow({ title, avatarUrl, messages: initialMessages, currentUserId, groupId, currentUser, allGroups = [] }: any) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [content, setContent] = useState('')
  const [isTyping, setIsTyping] = useState<any[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const typingTimeoutRef = useRef<any>(null)

  const socket = getSocket(currentUserId)

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  // Sync with prop changes
  useEffect(() => {
    setMessages(initialMessages)
    markAsRead(groupId)
    scrollToBottom()
  }, [initialMessages, groupId, scrollToBottom])

  // Socket setup
  useEffect(() => {
    socket.emit('join-room', groupId)
    const handleNewMessage = (msg: any) => {
      setMessages((prev: any) => {
        if (prev.some((m: any) => m.id === msg.id)) return prev
        const newMsgs = [...prev, msg]
        return newMsgs
      })
      markAsRead(groupId)
    }
    const handleTyping = (data: any) => {
      setIsTyping((prev) => prev.some(u => u.userId === data.userId) ? prev : [...prev, data])
    }
    const handleTypingStop = (data: any) => {
      setIsTyping((prev) => prev.filter(u => u.userId !== data.userId))
    }
    socket.on('new-message', handleNewMessage)
    socket.on('user-typing', handleTyping)
    socket.on('user-typing-stop', handleTypingStop)
    socket.on('message-deleted', (messageId: string) => {
      setMessages((prev: any) => prev.map((m: any) => 
        m.id === messageId ? { ...m, isDeleted: true, deletedAt: new Date() } : m
      ))
    })
    return () => {
      socket.off('new-message', handleNewMessage)
      socket.off('user-typing', handleTyping)
      socket.off('user-typing-stop', handleTypingStop)
      socket.off('message-deleted')
    }
  }, [socket, groupId])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    setIsUploading(true)
    setUploadProgress(10)

    const file = acceptedFiles[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setUploadProgress(100)

      const type = data.mimeType.startsWith('image/') ? 'IMAGE' : (data.mimeType.startsWith('video/') ? 'VIDEO' : 'FILE')
      
      const savedMsg = await sendMessage({ 
        groupId, 
        content: `Sent a ${type.toLowerCase()}`, 
        type,
        fileUrl: data.url,
        fileName: data.fileName,
        fileSize: data.fileSize
      })

      setMessages((prev: any) => [...prev, savedMsg])
      socket.emit('send-message', { groupId, message: savedMsg })
    } catch (e) {
      console.error('Upload failed', e)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [groupId, socket])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ 
    onDrop,
    noClick: true,
    noKeyboard: true
  })

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    const msgContent = content
    setContent('')
    setAudioPreview(null)
    setPendingBlob(null)
    socket.emit('typing-stop', { groupId, userId: currentUserId })

    try {
      const savedMsg = await sendMessage({ groupId, content: msgContent, type: 'TEXT' })
      setMessages((prev: any) => [...prev, savedMsg])
      socket.emit('send-message', { groupId, message: savedMsg })
    } catch (error) {
      router.refresh()
    }
  }

  const handleInputChange = (e: any) => {
    setContent(e.target.value)
    socket.emit('typing-start', { groupId, userId: currentUserId, userName: currentUser?.name })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', { groupId, userId: currentUserId })
    }, 2000)
  }

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setHasMicPermission(true)
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioPreview(url)
        setPendingBlob(audioBlob)
        setIsRecording(false)
        if (timerRef.current) clearInterval(timerRef.current)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (e) {
      console.error('Microphone access denied', e)
      setHasMicPermission(false)
      alert("Microphone permission is required for voice messages.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  const handleSendVoice = async () => {
    if (!pendingBlob) return
    setIsUploading(true)
    const file = new File([pendingBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch('/api/chat/upload', { method: 'POST', body: formData })
      const data = await res.json()
      
      const savedMsg = await sendMessage({ 
        groupId, 
        content: 'Voice Message', 
        type: 'VOICE',
        fileUrl: data.url,
        fileName: data.fileName,
        fileSize: data.fileSize
      })

      setMessages((prev: any) => [...prev, savedMsg])
      socket.emit('send-message', { groupId, message: savedMsg })
      setAudioPreview(null)
      setPendingBlob(null)
    } catch (e) {
      console.error('Voice upload failed', e)
    } finally {
      setIsUploading(false)
    }
  }

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end)
    const selection = text.substring(start, end)
    const newText = `${before}${prefix}${selection}${suffix}${after}`
    setContent(newText)
    textarea.focus()
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    const files: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile()
        if (file) files.push(file)
      }
    }
    if (files.length > 0) {
      onDrop(files)
    }
  }

  const confirmDelete = (id: string) => {
    setMsgToDeleteId(id)
  }

  const performDeleteMessage = async (id: string) => {
    try {
      await deleteMessage(id)
      socket.emit('delete-message', { groupId, messageId: id })
    } catch (err) {
      console.error("Delete failed:", err);
      // Optional: alert or toast
    } finally {
      setMsgToDeleteId(null)
    }
  }

  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef<any>(null)
  
  // Forwarding & Selection State
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [forwardModalOpen, setForwardModalOpen] = useState(false)
  const [forwardSingleId, setForwardSingleId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [msgToDeleteId, setMsgToDeleteId] = useState<string | null>(null)

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleForward = async (targetGroupId: string) => {
    const idsToForward = forwardSingleId ? [forwardSingleId] : selectedIds
    if (idsToForward.length === 0) return
    
    const results = await forwardMessages(idsToForward, targetGroupId)
    if (results && results.length > 0) {
      if (targetGroupId === groupId) {
        // If forwarding to same chat, add to state
        setMessages((prev: any) => [...prev, ...results])
        results.forEach(msg => socket.emit('send-message', { groupId, message: msg }))
      } else {
        // If to another chat, just toast or notify
        alert(`Successfully forwarded ${idsToForward.length} message(s)`)
      }
    }
    
    setForwardModalOpen(false)
    setForwardSingleId(null)
    setSelectionMode(false)
    setSelectedIds([])
  }

  const downloadFile = (url: string, fileName: string) => {
    // We use the new Ironclad Download Tunnel
    const downloadUrl = `/api/chat/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName || 'attachment')}&v=${Date.now()}`
    
    // Using a hidden link is more reliable for forcing the browser's download manager
    const link = document.createElement('a')
    link.href = downloadUrl
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Permission check
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null)

  return (
    <div {...getRootProps()} className="flex flex-col h-full bg-[#F3F4F6] relative">
      <input {...getInputProps()} />
      
      {isDragActive && (
        <div className="absolute inset-0 bg-[#5A2D82]/10 backdrop-blur-sm z-[200] flex items-center justify-center pointer-events-none border-4 border-dashed border-[#5A2D82]/30 m-4 rounded-3xl">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 animate-in zoom-in-90">
            <div className="w-16 h-16 bg-[#5A2D82]/10 rounded-full flex items-center justify-center mx-auto">
              <PaperclipIcon className="w-8 h-8 text-[#5A2D82]" />
            </div>
            <p className="text-xl font-bold text-[#5A2D82]">Drop files to share</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 border-b border-border flex items-center justify-between bg-card z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/chat" className="md:hidden p-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80">
            <Menu className="w-5 h-5 text-[#5A2D82]" />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5A2D82] to-[#4A5568] flex items-center justify-center text-white font-bold shrink-0 shadow-md overflow-hidden border border-border">
            {avatarUrl ? (
              <img src={avatarUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              title.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#4A5568]">{title}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Authenticated Audit hub</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectionMode(!selectionMode)
              setSelectedIds([])
            }}
            className={`p-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${
              selectionMode ? 'bg-[#5A2D82] text-white' : 'hover:bg-secondary text-muted-foreground'
            }`}
          >
            {selectionMode ? 'Cancel' : 'Select'}
          </button>
          
          {selectionMode && selectedIds.length > 0 && (
            <button 
              onClick={() => setForwardModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] text-white rounded-xl font-bold text-xs uppercase transition-all hover:scale-105"
            >
              <Share2 className="w-4 h-4" /> Forward ({selectedIds.length})
            </button>
          )}

          <button className="p-2.5 hover:bg-secondary rounded-xl transition-colors">
            <Smile className="w-5 h-5 text-muted-foreground" />
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
            title="Delete Entire Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F2F3F5] pattern-dots"
      >
        {messages.filter((m: any) => !m.isDeleted).map((m: any, idx: number, filtered: any[]) => {
          const isMe = m.senderId === currentUserId
          const isDeleted = m.isDeleted
          const showSender = !isMe && (idx === 0 || filtered[idx-1].senderId !== m.senderId)

          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              {showSender && (
                <span className="text-[11px] font-bold text-[#5A2D82]/60 mb-1 ml-4 tracking-wide uppercase">
                  {m.sender?.name}
                </span>
              )}
              
                <div className={`flex items-start gap-3 group max-w-[90%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Sender Avatar */}
                  {!isDeleted && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm mt-0.5 overflow-hidden ${
                      isMe ? 'bg-[#5A2D82]' : 'bg-gray-400'
                    }`}>
                      {m.sender?.image ? (
                        <img src={m.sender.image} alt={m.sender.name} className="w-full h-full object-cover" />
                      ) : (
                        (m.sender?.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                  )}

                  <div className={`flex items-start gap-2 group max-w-full ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Selection Checkbox */}
                  {selectionMode && !isDeleted && (
                    <button 
                      onClick={() => toggleSelection(m.id)}
                      className="mt-4 shrink-0 transition-all hover:scale-110"
                    >
                      {selectedIds.includes(m.id) 
                        ? <CheckSquare className="w-5 h-5 text-[#5A2D82]" />
                        : <Square className="w-5 h-5 text-gray-300" />
                      }
                    </button>
                  )}

                  {!selectionMode && isMe && !isDeleted && (
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <button 
                        onClick={() => confirmDelete(m.id)}
                        className="p-1.5 hover:bg-red-100 rounded-full text-red-500 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => { setForwardSingleId(m.id); setForwardModalOpen(true); }}
                        className="p-1.5 hover:bg-[#5A2D82]/10 rounded-full text-[#5A2D82] shadow-sm"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {!selectionMode && !isMe && !isDeleted && (
                    <button 
                      onClick={() => { setForwardSingleId(m.id); setForwardModalOpen(true); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#5A2D82]/10 rounded-full text-[#5A2D82] shadow-sm transition-all shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className={`relative px-4 py-3 rounded-2xl shadow-sm border ${
                    selectedIds.includes(m.id) ? 'ring-2 ring-[#5A2D82] ring-offset-2' : ''
                  } ${
                    isMe 
                      ? 'bg-[#5A2D82] text-white border-[#5A2D82]/10 rounded-br-none' 
                      : 'bg-white border-[#E2E8F0] text-[#1A1A1A] rounded-bl-none'
                  }`}>
                  {isDeleted && !['Super Admin', 'IT Admin'].includes(currentUser?.role?.name || '') ? (
                    <span className="italic opacity-60 flex items-center gap-2 truncate text-[11px]">
                      <Trash2 className="w-3.5 h-3.5" /> This message was deleted
                    </span>
                  ) : (
                    <div className="space-y-3">
                      {isDeleted && (
                        <div className="bg-red-500/10 border border-red-500/20 text-[9px] px-2 py-0.5 rounded uppercase font-bold text-red-400 mb-2 inline-block">
                          AUDIT: Deleted
                        </div>
                      )}
                      
                      {m.type === 'IMAGE' && m.fileUrl && (
                        <div className="rounded-xl overflow-hidden shadow-sm border border-black/5 max-w-sm">
                          <img src={m.fileUrl} alt="attachment" className="w-full h-auto object-cover max-h-96" />
                          <button 
                            onClick={() => downloadFile(m.fileUrl, m.fileName || 'image.png')}
                            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-[#5A2D82] rounded-full text-white backdrop-blur-sm transition-all Opacity-0 group-hover:opacity-100 shadow-lg"
                            title="Download to PC"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {(m.type === 'FILE' || m.type === 'VIDEO') && m.fileUrl && (
                        <button 
                           onClick={() => downloadFile(m.fileUrl, m.fileName || 'attachment')}
                           className={`flex items-center gap-3 w-full text-left p-3 rounded-xl border transition-all ${
                             isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-[#F1F5F9] border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#1A1A1A]'
                           }`}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? 'bg-white/20' : 'bg-[#5A2D82]/10'}`}>
                            {m.type === 'VIDEO' ? <ImageIcon className="w-5 h-5 text-[#5A2D82]" /> : <FileIcon className="w-5 h-5 text-[#5A2D82]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{m.fileName || 'Attachment'}</p>
                            <p className="text-[10px] opacity-60 uppercase font-medium">{m.fileSize ? `${(m.fileSize / 1024 / 1024).toFixed(2)} MB` : 'File'}</p>
                          </div>
                          <Download className="w-4 h-4 shrink-0" />
                        </button>
                      )}

                      {m.type === 'VOICE' && m.fileUrl && (
                        <div className={`flex items-center gap-3 p-2 min-w-[220px] ${isMe ? 'text-white' : 'text-[#1A1A1A]'}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isMe ? 'bg-white/20' : 'bg-[#5A2D82]/10'}`}>
                            <Mic className="w-6 h-6" />
                          </div>
                          <div className="flex-1 space-y-2">
                             <audio src={m.fileUrl} controls className="w-full h-8 brightness-100 contrast-100" />
                          </div>
                        </div>
                      )}

                      {m.content && m.type === 'TEXT' && (
                        <div className={`prose prose-sm max-w-none text-inherit leading-relaxed ${isMe ? 'prose-invert' : ''}`}>
                          <div className={`break-words font-semibold text-sm ${isMe ? 'text-white' : 'text-[#1A1A1A]'}`}>
                            <ReactMarkdown 
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                u: ({node, ...props}) => <u {...props} className="underline decoration-[#5A2D82]" />
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`flex items-center justify-end gap-1 mt-2 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      {format(new Date(m.createdAt), 'h:mm a')}
                    </span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#C9A227]" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

        {isTyping.length > 0 && (
          <div className="flex items-center gap-2 animate-pulse ml-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#4A5568]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#4A5568]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[#4A5568]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] font-bold text-[#4A5568]/60 uppercase tracking-tighter">
              {isTyping[0].userName} is typing...
            </span>
          </div>
        )}
      </div>

      {/* Floating Toolbar */}
      <div className="px-5 py-2.5 flex items-center gap-2 border-t border-border bg-card shadow-sm overflow-x-auto no-scrollbar">
        <button onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-[#5A2D82]/5 rounded-lg font-bold text-sm px-3 text-[#1A1A1A] transition-colors border border-transparent hover:border-[#5A2D82]/10">B</button>
        <button onClick={() => insertMarkdown('*', '*')} className="p-2 hover:bg-[#5A2D82]/5 rounded-lg italic text-sm px-3 text-[#1A1A1A] transition-colors border border-transparent hover:border-[#5A2D82]/10">I</button>
        <button onClick={() => insertMarkdown('<u>', '</u>')} className="p-2 hover:bg-[#5A2D82]/5 rounded-lg underline text-sm px-3 text-[#1A1A1A] transition-colors border border-transparent hover:border-[#5A2D82]/10">U</button>
        <button onClick={() => insertMarkdown('\n- ')} className="p-2 hover:bg-[#5A2D82]/5 rounded-lg text-xs px-3 text-[#1A1A1A] font-bold transition-colors">LIST</button>
        <div className="w-px h-5 bg-border mx-2" />
        <button onClick={() => insertMarkdown('😊')} className="p-2 hover:bg-[#5A2D82]/5 rounded-lg text-xl filter grayscale hover:grayscale-0 transition-all">😊</button>
        <button onClick={() => insertMarkdown('👍')} className="p-2 hover:bg-[#5A2D82]/5 rounded-lg text-xl filter grayscale hover:grayscale-0 transition-all">👍</button>
        <button onClick={() => insertMarkdown('❤️')} className="p-2 hover:bg-[#5A2D82]/5 rounded-lg text-xl filter grayscale hover:grayscale-0 transition-all">❤️</button>
        <button onClick={() => insertMarkdown('🔥')} className="p-2 hover:bg-[#5A2D82]/5 rounded-lg text-xl filter grayscale hover:grayscale-0 transition-all">🔥</button>
      </div>

      {isUploading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-white border border-[#5A2D82]/20 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[320px] animate-in slide-in-from-top-4 border-b-4 border-b-[#C9A227]">
          <div className="w-10 h-10 bg-[#5A2D82]/10 rounded-xl flex items-center justify-center animate-spin">
            <RefreshCw className="w-5 h-5 text-[#5A2D82]" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Secure Audit Sync...</p>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#5A2D82] to-[#C9A227] transition-all duration-300" style={{ width: `${uploadProgress || 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-5 bg-card border-t border-border shrink-0 shadow-[0_-4px_30px_-10px_rgba(0,0,0,0.1)]">
        <form onSubmit={handleSend} className="flex items-end gap-3 max-w-6xl mx-auto">
          <div className="flex-1 bg-white border-2 border-[#E5E7EB] rounded-[1.5rem] px-3 py-2 flex items-end gap-1 shadow-sm focus-within:border-[#5A2D82] focus-within:ring-4 focus-within:ring-[#5A2D82]/5 transition-all">
            <button 
              type="button" 
              onClick={open}
              className="p-2.5 hover:bg-[#F3F4F6] rounded-full transition-colors text-[#4A5568] hover:text-[#5A2D82]"
            >
              <PaperclipIcon className="w-6 h-6" />
            </button>
            <textarea 
              placeholder="Type your message..." 
              className="flex-1 px-3 py-3 bg-transparent border-none text-base focus:outline-none focus:ring-0 transition-all resize-none min-h-[48px] max-h-32 text-[#1A1A1A] font-medium leading-relaxed" 
              rows={1}
              value={content}
              onChange={handleInputChange}
              onPaste={handlePaste}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md group ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#4A5568]/5 hover:bg-[#4A5568]/10'
              }`}
            >
              <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-[#4A5568]'}`} />
            </button>
            <button 
              type="submit" 
              disabled={!content.trim() && !audioPreview}
              onClick={audioPreview ? (e) => { e.preventDefault(); handleSendVoice(); } : undefined}
              className="w-12 h-12 bg-[#5A2D82] hover:bg-[#5A2D82]/90 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-lg shadow-[#5A2D82]/30 group"
            >
              <Send className="w-5 h-5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </form>

        {/* Audio Preview / Recording Status */}
        {(isRecording || audioPreview) && (
          <div className="mt-4 flex items-center justify-between bg-[#5A2D82]/5 border border-[#5A2D82]/20 rounded-2xl p-4 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-sm font-bold text-[#5A2D82] uppercase tracking-widest">
                {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Voice Message Ready'}
              </span>
            </div>
            {audioPreview && !isRecording && (
              <div className="flex items-center gap-3">
                <audio src={audioPreview} controls className="h-8 w-48 brightness-110" />
                <button 
                  onClick={() => { setAudioPreview(null); setPendingBlob(null); }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            {isRecording && (
              <button 
                onClick={stopRecording}
                className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase hover:bg-red-600 transition-colors shadow-sm"
              >
                Stop Recording
              </button>
            )}
          </div>
        )}
      </div>

      {forwardModalOpen && (
        <ForwardModal 
          onClose={() => { setForwardModalOpen(false); setForwardSingleId(null); }}
          onForward={handleForward}
          groups={allGroups}
          currentUserId={currentUserId}
          isMultiple={!forwardSingleId && selectedIds.length > 1}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteConversationModal 
          isOpen={true}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => {
             const result = await deleteChatGroup(groupId);
             if (result?.success) {
               router.push('/chat');
               setIsDeleteModalOpen(false);
             }
          }}
          title={title}
          type="CONVERSATION"
        />
      )}

      {msgToDeleteId && (
        <DeleteConversationModal 
          isOpen={true}
          onClose={() => setMsgToDeleteId(null)}
          onConfirm={() => performDeleteMessage(msgToDeleteId)}
          title="Message"
          type="MESSAGE"
        />
      )}
    </div>
  )
}
