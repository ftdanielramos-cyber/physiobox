import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-900 text-neutral-100">
      {/* Caixa em cinza médio com borda desportiva */}
      <div className="bg-neutral-800 border border-neutral-700/60 p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white mb-1 italic tracking-tighter">
          Physiobox
        </h1>
        <p className="text-neutral-400 text-xs font-medium uppercase tracking-widest mb-6">
          Performance & Reabilitação
        </p>
        <Link
          href="/login"
          className="block w-full bg-blue-600 text-white text-center py-3.5 rounded-xl font-semibold uppercase text-sm tracking-wider hover:bg-blue-500 transition-all transform active:scale-95 shadow-md"
        >
          Entrar no Treino
        </Link>
      </div>
    </main>
  )
}