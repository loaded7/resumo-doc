'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">ResumDoc</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Sair
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-8">

        <div className="w-64 flex-shrink-0">
          <div
            onClick={() => !loading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-black transition mb-6"
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Processando com IA...</p>
              </div>
            ) : (
              <>
                <p className="text-2xl mb-1">📄</p>
                <p className="text-xs text-gray-500">Upload de PDF</p>
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

          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Histórico</h2>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum documento ainda</p>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`group relative px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                    selectedDoc?.id === doc.id
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectDoc(doc)}
                >
                  <p className="font-medium truncate pr-5">{doc.title}</p>
                  <p className={`text-xs mt-1 ${selectedDoc?.id === doc.id ? 'text-gray-300' : 'text-gray-400'}`}>
                    {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}
                    className={`absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition ${
                      selectedDoc?.id === doc.id ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {!selectedDoc ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-4xl mb-4">📂</p>
              <p className="text-gray-500">Selecione um documento ou faça upload de um PDF</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 pt-6 pb-0">
                <h3 className="text-lg font-bold text-gray-900 truncate mb-4">{selectedDoc.title}</h3>
                <div className="flex gap-1 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                      activeTab === 'summary'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Resumo
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                      activeTab === 'chat'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Chat com documento
                  </button>
                </div>
              </div>

              {activeTab === 'summary' && (
                <div className="p-6">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown>{selectedDoc.summary}</ReactMarkdown>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedDoc.summary)}
                    className="mt-4 text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                  >
                    Copiar resumo
                  </button>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="flex flex-col h-96">
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {messages.length === 0 && (
                      <p className="text-sm text-gray-400 text-center mt-8">Faça perguntas sobre o documento</p>
                    )}
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-2 rounded-xl">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="border-t border-gray-200 p-4 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                      placeholder="Pergunte algo sobre o documento..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      onClick={handleChat}
                      disabled={chatLoading || !chatInput.trim()}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
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