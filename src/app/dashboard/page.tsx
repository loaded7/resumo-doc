'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [pages, setPages] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setEmail(user.email || '')
      }
    }
    getUser()
  }, [router])

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
    setSummary('')
    setFileName(file.name)

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
        setSummary(data.summary)
        setPages(data.pages)
      }
    } catch {
      setError('Erro ao processar documento. Tente novamente.')
    } finally {
      setLoading(false)
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meus documentos</h2>
        <p className="text-gray-500 mb-8">Faça upload de um PDF para gerar um resumo com IA.</p>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-black transition"
        >
          <p className="text-4xl mb-4">📄</p>
          {loading ? (
            <p className="text-gray-500">Processando documento...</p>
          ) : (
            <>
              <p className="text-gray-500 mb-4">Clique para selecionar um PDF</p>
              <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition">
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
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {summary && (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Resumo — {fileName}</h3>
              <span className="text-sm text-gray-500">{pages} página{pages > 1 ? 's' : ''}</span>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {summary}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(summary)}
              className="mt-4 text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Copiar resumo
            </button>
          </div>
        )}
      </div>
    </main>
  )
}