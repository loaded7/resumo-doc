'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Perfil() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [totalDocs, setTotalDocs] = useState(0)
  const [memberSince, setMemberSince] = useState('')
  const [loading, setLoading] = useState(false)
  const [senhaLoading, setSenhaLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setEmail(user.email || '')
      setNome(user.user_metadata?.nome || '')
      setMemberSince(new Date(user.created_at).toLocaleDateString('pt-BR'))

      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setTotalDocs(count || 0)
    }
    getUser()
  }, [router])

  const handleSaveNome = async () => {
    setLoading(true)
    setSuccess('')
    setError('')

    const { error } = await supabase.auth.updateUser({
      data: { nome }
    })

    if (error) {
      setError('Erro ao salvar nome.')
    } else {
      setSuccess('Nome atualizado!')
    }
    setLoading(false)
  }

  const handleSaveSenha = async () => {
    if (novaSenha.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    setSenhaLoading(true)
    setSuccess('')
    setError('')

    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      setError('Erro ao atualizar senha.')
    } else {
      setSuccess('Senha atualizada!')
      setNovaSenha('')
    }
    setSenhaLoading(false)
  }

  const inicial = (nome || email || '?')[0].toUpperCase()

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white hover:opacity-70 transition">
        Astro<span className="text-gray-500">PDF</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-gray-400 border border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition"
        >
          ← Voltar
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto w-full px-6 py-12 flex flex-col gap-6">

        {/* Avatar e info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white text-gray-900 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {inicial}
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{nome || 'Sem nome'}</p>
            <p className="text-gray-400 text-sm">{email}</p>
            <p className="text-gray-600 text-xs mt-1">Membro desde {memberSince}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
            <p className="text-4xl font-bold text-white mb-1">{totalDocs}</p>
            <p className="text-gray-500 text-sm">documentos resumidos</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
            <p className="text-4xl font-bold text-white mb-1">∞</p>
            <p className="text-gray-500 text-sm">resumos disponíveis</p>
          </div>
        </div>

        {/* Feedback */}
        {success && (
          <div className="bg-green-900/30 border border-green-800 rounded-xl p-3">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Nome */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-white font-semibold">Nome de exibição</h2>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como você quer ser chamado?"
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            onClick={handleSaveNome}
            disabled={loading}
            className="self-end bg-white text-gray-900 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {/* Senha */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-white font-semibold">Alterar senha</h2>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Nova senha (mínimo 6 caracteres)"
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            onClick={handleSaveSenha}
            disabled={senhaLoading}
            className="self-end bg-white text-gray-900 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            {senhaLoading ? 'Salvando...' : 'Atualizar senha'}
          </button>
        </div>

      </div>
    </main>
  )
}