'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou password incorretos')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard'
  }

  const inputClass = "w-full bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#333] focus:outline-none focus:border-[#3b82f6]"

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="px-8 w-full max-w-sm">
        <p className="text-[#3b82f6] text-xs tracking-[0.2em] uppercase mb-3">Physiobox</p>
        <h1 className="text-5xl font-extrabold text-white uppercase tracking-tight leading-none mb-10">
          Entrar
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <p className="text-[9px] text-[#333] tracking-widest uppercase mb-2">Email</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplo.com" required className={inputClass} />
          </div>
          <div>
            <p className="text-[9px] text-[#333] tracking-widest uppercase mb-2">Password</p>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required className={inputClass} />
          </div>

          {error && <p className="text-red-500 text-xs uppercase tracking-wider">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#1d4ed8] text-white py-4 rounded-xl font-bold uppercase text-xs tracking-[0.2em] hover:bg-[#1e40af] transition disabled:opacity-50 mt-2">
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}