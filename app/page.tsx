import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="px-8 w-full max-w-sm">
        <p className="text-[#3b82f6] text-xs tracking-[0.2em] uppercase mb-3">Bem-vindo</p>
        <h1 className="text-6xl font-extrabold text-white uppercase tracking-tight leading-none mb-2">
          Physio<br />box
        </h1>
        <p className="text-[#555] text-xs tracking-[0.15em] uppercase mb-10">
          Performance & Reabilitação
        </p>
        <Link href="/login"
          className="block w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-center py-4 rounded-lg font-bold uppercase text-xs tracking-[0.2em] hover:bg-[#222] hover:border-[#3b82f6] transition">
          Entrar
        </Link>
      </div>
    </main>
  )
}