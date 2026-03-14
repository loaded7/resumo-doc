'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')

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

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">📄</p>
          <p className="text-gray-500 mb-4">Nenhum documento ainda</p>
          <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition">
            Upload de PDF
          </button>
        </div>
      </div>
    </main>
  )
}