import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-5 flex justify-between items-center absolute top-0 left-0 right-0 z-10">
        <span className="text-xl font-bold tracking-tight text-white">Astro<span className="text-gray-400">PDF</span></span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white transition">
            Entrar
          </Link>
          <Link href="/auth/signup" className="text-sm bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero escuro */}
      <section className="bg-gray-950 px-8 pt-40 pb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-gray-800 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
          Gratuito — sem cartão de crédito
        </div>

        <h1 className="text-6xl font-bold text-white tracking-tight leading-tight max-w-3xl mb-6">
          Resuma qualquer PDF<br />
          <span className="text-gray-500">em segundos com IA.</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-lg mb-10">
          Faça upload, receba o resumo e ainda converse com o documento. Sem complicação.
        </p>

        <div className="flex gap-3 mb-16">
          <Link
            href="/auth/signup"
            className="bg-white text-gray-900 px-8 py-4 rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
          >
            Testar agora — é grátis →
          </Link>
          <Link
            href="/auth/login"
            className="border border-gray-700 text-gray-300 px-8 py-4 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
          >
            Já tenho conta
          </Link>
        </div>

        {/* Mock do app */}
        <div className="w-full max-w-4xl bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
            <span className="text-xs text-gray-600 ml-2">astropdf.vercel.app/dashboard</span>
          </div>
          <div className="flex h-72">
            <div className="w-56 border-r border-gray-800 p-4 flex flex-col gap-3">
              <div className="h-8 bg-gray-800 rounded-lg w-full"></div>
              <div className="text-xs text-gray-600 uppercase tracking-wider mt-2">Histórico</div>
              <div className="h-10 bg-gray-800 rounded-lg w-full"></div>
              <div className="h-10 bg-gray-700 rounded-lg w-full border border-gray-600"></div>
              <div className="h-10 bg-gray-800 rounded-lg w-full"></div>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-4">
              <div className="flex gap-4 border-b border-gray-800 pb-3">
                <div className="h-4 bg-white rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-28"></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-3 bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                <div className="h-3 bg-gray-700 rounded w-4/6"></div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="h-3 bg-gray-800 rounded w-full"></div>
                <div className="h-3 bg-gray-800 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-8 py-24 max-w-5xl mx-auto w-full">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Como funciona</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-16">Três passos. Zero enrolação.</h2>

        <div className="grid grid-cols-3 gap-10">
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-bold">1</div>
            <h3 className="text-lg font-semibold text-gray-900">Faz upload do PDF</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Qualquer PDF — contrato, artigo, livro, relatório, TCC. Clica e seleciona.</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-bold">2</div>
            <h3 className="text-lg font-semibold text-gray-900">Recebe o resumo</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Em segundos você tem um resumo completo com os pontos principais. Salvo no histórico pra sempre.</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-bold">3</div>
            <h3 className="text-lg font-semibold text-gray-900">Conversa com o doc</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Ficou com dúvida? Abre o chat e pergunta qualquer coisa. A IA responde com base no documento.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Funcionalidades</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-16">O que você ganha.</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition">
              <div className="text-3xl mb-5">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Resumo em segundos</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Upload e resumo em menos de 30 segundos. Sem espera, sem fila, sem limitação de uso.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition">
              <div className="text-3xl mb-5">💬</div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Chat com o documento</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Tire dúvidas específicas sobre o PDF sem precisar reler tudo. A IA sabe o que tá no documento.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition">
              <div className="text-3xl mb-5">📂</div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Histórico completo</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Todos os seus resumos ficam salvos. Acesse qualquer documento processado anteriormente.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition">
              <div className="text-3xl mb-5">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Privacidade garantida</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Seus documentos são seus. Cada usuário só acessa os próprios arquivos, protegidos no banco de dados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gray-950 px-8 py-24 flex flex-col items-center text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Pronto pra parar de ler PDF?</h2>
        <p className="text-gray-400 mb-8">Cria sua conta grátis e testa agora. Leva menos de 1 minuto.</p>
        <Link
          href="/auth/signup"
          className="bg-white text-gray-900 px-10 py-4 rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
        >
          Criar conta grátis →
        </Link>
      </section>

      <footer className="px-8 py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        AstroPDF — feito com Next.js, Supabase e IA
      </footer>
    </main>
  )
}