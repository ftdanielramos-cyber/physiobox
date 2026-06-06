'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Dashboard() {
  const [totalClientes, setTotalClientes] = useState<number | null>(null)
  const [sessoesHoje, setSessoesHoje] = useState<number | null>(null)
  const [sessoesMes, setSessoesMes] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function carregarStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: perfil } = await supabase.from('profiles').select('nome').eq('id', user.id).single()
        setNome(perfil?.nome?.split(' ')[0] || '')
      }

      const { count: c } = await supabase.from('clientes').select('*', { count: 'exact', head: true })
      setTotalClientes(c || 0)

      const hoje = new Date().toISOString().split('T')[0]
      const { count: sh } = await supabase.from('sessoes').select('*', { count: 'exact', head: true }).eq('data', hoje)
      setSessoesHoje(sh || 0)

      const inicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const fim = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
      const { count: sm } = await supabase.from('sessoes').select('*', { count: 'exact', head: true }).gte('data', inicio).lte('data', fim)
      setSessoesMes(sm || 0)
    }
    carregarStats()
  }, [])

  const hoje = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <main className="min-h-screen" style={{ background: '#f0f4f8' }}>

      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }} className="px-6 pt-12 pb-20">
        <p className="text-blue-200 text-sm capitalize">{hoje}</p>
        <h1 className="text-white text-3xl font-bold mt-1">
          {nome ? `Olá, ${nome} 👋` : 'Physiobox 👋'}
        </h1>
        <p className="text-blue-200 text-sm mt-1">Bem-vindo ao teu painel</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-10">

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-2xl font-bold text-blue-600">{totalClientes ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-1">Clientes</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-2xl font-bold text-blue-600">{sessoesHoje ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-1">Hoje</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-2xl font-bold text-blue-600">{sessoesMes ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-1">Este mês</p>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Menu</p>

        <div className="flex flex-col gap-3 mb-6">
          <a href="/clientes" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: '#eff6ff' }}>👥</div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-800">Clientes</h2>
              <p className="text-sm text-gray-400">Gerir fichas e sessões</p>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </a>

          <a href="/calendario" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: '#eff6ff' }}>📅</div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-800">Calendário</h2>
              <p className="text-sm text-gray-400">Ver sessões do mês</p>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </a>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Ação rápida</p>

        <a href="/clientes" className="flex rounded-2xl p-5 shadow-sm hover:opacity-90 transition items-center gap-4 mb-8"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.15)' }}>⚡</div>
          <div className="flex-1">
            <h2 className="font-semibold text-white">Nova sessão</h2>
            <p className="text-sm text-blue-200">Escolhe um cliente e começa</p>
          </div>
          <span className="text-white text-lg">›</span>
        </a>

      </div>
    </main>
  )
}