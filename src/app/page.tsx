import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Resumo inteligente de documentos
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Faça upload de qualquer PDF e receba um resumo completo em segundos com IA.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-black text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition"
          >
            Começar grátis
          </Link>
          <Link
            href="/auth/login"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  )
}