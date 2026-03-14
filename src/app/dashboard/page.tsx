'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

type Document = {
  id: string
  title: string
  summary: string
  created_at: string
}

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function Dashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary')
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setEmail(user.email || '')
        loadDocuments()
      }
    }
    getUser()
  }, [router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const preventDefault = (e: DragEvent) => e.preventDefault()
    window.addEventListener('dragover', preventDefault)
    window.addEventListener('drop', preventDefault)
    return () => {
      window.removeEventListener('dragover', preventDefault)
      window.removeEventListener('drop', preventDefault)
    }
  }, [])

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setDocuments(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSelectDoc = (doc: Document) => {
    setSelectedDoc(doc)
    setMessages([])
    setActiveTab('summary')
  }

  const handleDelete = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id)
    if (selectedDoc?.id === id) setSelectedDoc(null)
    loadDocuments()
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setError('Por favor envie apenas arquivos PDF')
      return
    }

    setLoading(true)
    setError('')
    setSelectedDoc(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: saved } = await supabase
          .from('documents')
          .insert({
            title: file.name,
            summary: data.summary,
            content: '',
            user_id: user!.id,
          })
          .select()
          .single()

        if (saved) {
          setSelectedDoc(saved)
          loadDocuments()
        }
      }
    } catch {
      setError('Erro ao processar documento. Tente novamente.')
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await processFile(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (loading) return
    const file = e.dataTransfer.files[0]
    if (file) await processFile(file)
  }

  const handleChat = async () => {
    if (!chatInput.trim() || !selectedDoc) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          summary: selectedDoc.summary,
          title: selectedDoc.title,
        }),
      })

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao responder. Tente novamente.' }])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <button
  onClick={() => setSelectedDoc(null)}
  className="text-xl font-bold tracking-tight text-white hover:opacity-70 transition"
>
  Astro<span className="text-gray-500">PDF</span>
</button>
        <div className="flex items-center gap-3">
          <Link
            href="/perfil"
            className="text-sm text-gray-400 hover:text-white transition px-3 py-2 rounded-lg hover:bg-gray-800"
          >
            {email}
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 border border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition"
          >
            Sair
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4 gap-4">
          <div
            onClick={() => !loading && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
              isDragging
                ? 'border-white bg-gray-800'
                : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800'
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-1">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Processando...</p>
              </div>
            ) : isDragging ? (
              <>
                <p className="text-xl mb-1">⬇️</p>
                <p className="text-xs text-white">Solte aqui!</p>
              </>
            ) : (
              <>
                <p className="text-xl mb-1">📄</p>
                <p className="text-xs text-gray-400">Upload ou arraste um PDF</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-3">
              Histórico · {documents.length}
            </p>
            {documents.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">Nenhum documento ainda</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`group relative px-3 py-2.5 rounded-lg text-sm cursor-pointer transition ${
                      selectedDoc?.id === doc.id
                        ? 'bg-white text-gray-900'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <p className="font-medium truncate pr-5 text-xs">{doc.title}</p>
                    <p className={`text-xs mt-0.5 ${selectedDoc?.id === doc.id ? 'text-gray-500' : 'text-gray-600'}`}>
                      {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}
                      className="absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition text-gray-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!selectedDoc ? (
  <div
    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }}
    onDrop={handleDrop}
    onClick={() => !isDragging && fileInputRef.current?.click()}
    className={`flex flex-col items-center justify-center h-full text-center gap-6 rounded-2xl border-2 border-dashed transition cursor-pointer ${
      isDragging ? 'border-white bg-gray-900' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-900'
    }`}
  >
    <div className="text-6xl">{isDragging ? '⬇️' : '🚀'}</div>
    <h2 className="text-xl font-bold text-white">
      {isDragging ? 'Solte aqui!' : 'Pronto pra resumir?'}
    </h2>
    <p className="text-gray-500 text-sm max-w-sm">
      {isDragging ? 'Pode soltar o PDF agora.' : 'Clique no botão ou arraste um PDF pra começar.'}
    </p>
    {!isDragging && (
      <button
        onClick={() => fileInputRef.current?.click()}
        className="mt-2 bg-white text-gray-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
      >
        Fazer upload agora →
      </button>
    )}
  </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 pt-6 pb-0">
                <h3 className="text-lg font-bold text-white truncate mb-4">{selectedDoc.title}</h3>
                <div className="flex gap-1 border-b border-gray-800">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                      activeTab === 'summary'
                        ? 'border-white text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Resumo
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                      activeTab === 'chat'
                        ? 'border-white text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Chat com documento
                  </button>
                </div>
              </div>

              {activeTab === 'summary' && (
                <div className="p-6">
                  <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                    <ReactMarkdown>{selectedDoc.summary}</ReactMarkdown>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedDoc.summary)}
                    className="mt-6 text-sm border border-gray-700 text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition"
                  >
                    Copiar resumo
                  </button>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="flex flex-col h-96">
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {messages.length === 0 && (
                      <p className="text-sm text-gray-600 text-center mt-8">Faça perguntas sobre o documento</p>
                    )}
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-sm px-4 py-2.5 rounded-xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-white text-gray-900'
                            : 'bg-gray-800 text-gray-200'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800 px-4 py-3 rounded-xl">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="border-t border-gray-800 p-4 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                      placeholder="Pergunte algo sobre o documento..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <button
                      onClick={handleChat}
                      disabled={chatLoading || !chatInput.trim()}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition disabled:opacity-30"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}