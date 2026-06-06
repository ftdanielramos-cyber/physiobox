'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function PerfilPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        const { data } = await supabase.from('profiles').select('nome').eq('id', user.id).single()
        setNome(data?.nome || '')
      }
    }
    carregarPerfil()
  }, [])

  async function sair() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-[#3b82f6] text-xs tracking-[0.2em] uppercase mb-2">Conta</p>
        <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mb-8">Perfil</h1>

        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-4">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#1a1a1a]">
            <div className="w-14 h-14 rounded-xl bg-[#1d4ed8] flex items-center justify-center text-white text-2xl font-extrabold uppercase">
              {nome ? nome[0] : '?'}
            </div>
            <div>
              <p className="text-lg font-extrabold text-white uppercase tracking-wider">{nome || '—'}</p>
              <p className="text-[10px] text-[#444] uppercase tracking-wider mt-1">{email}</p>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-[#333] tracking-widest uppercase mb-1">Função</p>
            <p className="text-sm font-bold text-white uppercase tracking-wider">Fisioterapeuta</p>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-4">
          <p className="text-xs text-[#3b82f6] tracking-[0.15em] uppercase font-bold mb-4">Physiobox</p>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-[#444] uppercase tracking-wider">Versão</p>
              <p className="text-[10px] text-white uppercase tracking-wider">1.0.0</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-[#444] uppercase tracking-wider">Plataforma</p>
              <p className="text-[10px] text-white uppercase tracking-wider">PWA</p>
            </div>
          </div>
        </div>

        <button onClick={sair}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-red-500 py-4 rounded-xl font-bold uppercase text-xs tracking-[0.2em] hover:border-red-500 transition mt-2">
          Terminar Sessão
        </button>
      </div>
    </main>
  )
}