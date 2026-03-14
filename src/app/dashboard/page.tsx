'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Document = {
  id: string
  title: string
  summary: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Histórico</h2>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum documento ainda</p>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedDoc?.id === doc.id
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className={`text-xs mt-1 ${selectedDoc?.id === doc.id ? 'text-gray-300' : 'text-gray-400'}`}>
                    {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div
            onClick={() => !loading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-black transition mb-6"
          >
            <p className="text-3xl mb-3">📄</p>
            {loading ? (
              <p className="text-gray-500">Processando documento com IA...</p>
            ) : (
              <>
                <p className="text-gray-500 mb-3">Clique para selecionar um PDF</p>
                <button className="bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition text-sm">
                  Upload de PDF
                </button>
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {selectedDoc && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 truncate">{selectedDoc.title}</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(selectedDoc.summary)}
                  className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition flex-shrink-0 ml-4"
                >
                  Copiar
                </button>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {selectedDoc.summary}
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}