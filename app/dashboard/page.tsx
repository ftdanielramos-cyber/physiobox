'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Dashboard() {
  const [totalClientes, setTotalClientes] = useState<number | null>(null)
  const [sessoesHoje, setSessoesHoje] = useState<number | null>(null)
  const [sessoesMes, setSessoesMes] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [proximos, setProximos] = useState<any[]>([])
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

      const { data: ag } = await supabase
        .from('agendamentos')
        .select('*, clientes(nome)')
        .gte('data', hoje)
        .order('data')
        .order('hora_inicio')
        .limit(3)
      setProximos(ag || [])
    }
    carregarStats()
  }, [])

  const hoje = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
  const inicial = nome ? nome.charAt(0).toUpperCase() : 'P'

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8 border-b border-[#1a1a1a] pb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#1d4ed8] flex items-center justify-center text-xl font-extrabold text-white shrink-0">
            {inicial}
          </div>
          <div>
            <p className="text-[#3b82f6] text-[10px] tracking-[0.15em] uppercase mb-1 capitalize">{hoje}</p>
            <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight leading-none">
              {nome ? `Olá, ${nome}` : 'Physiobox'}
            </h1>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { valor: totalClientes, label: 'Clientes' },
            { valor: sessoesHoje, label: 'Hoje' },
            { valor: sessoesMes, label: 'Este Mês' },
          ].map(s => (
            <div key={s.label} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 text-center">
              <p className="text-3xl font-extrabold text-[#3b82f6]">{s.valor ?? '—'}</p>
              <p className="text-[9px] text-[#444] tracking-[0.12em] uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* PRÓXIMOS AGENDAMENTOS */}
        {proximos.length > 0 && (
          <>
            <p className="text-[9px] text-[#2a2a2a] tracking-[0.18em] uppercase mb-3">Próximos Agendamentos</p>
            <div className="flex flex-col gap-2 mb-8">
              {proximos.map(a => (
                <a key={a.id} href={a.cliente_id ? `/clientes/${a.cliente_id}` : '/calendario'}
                  className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 flex items-center gap-3 hover:border-[#2a2a2a] transition">
                  <div className="w-1 h-10 bg-[#3b82f6] rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white uppercase tracking-wider truncate">{a.clientes?.nome || 'Sem cliente'}</p>
                    <p className="text-[10px] text-[#444] uppercase tracking-wider mt-0.5">
                      {new Date(a.data + 'T00:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                      {a.hora_inicio ? ` · ${a.hora_inicio.slice(0, 5)}` : ''}
                      {a.tipo ? ` · ${a.tipo}` : ''}
                    </p>
                  </div>
                  <span className="text-[#333] text-xl">›</span>
                </a>
              ))}
            </div>
          </>
        )}

        {/* NAVEGAÇÃO */}
        <p className="text-[9px] text-[#2a2a2a] tracking-[0.18em] uppercase mb-3">Navegação</p>
        <div className="flex flex-col gap-2 mb-6">
          <a href="/clientes" className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 flex items-center gap-4 hover:border-[#2a2a2a] transition">
            <div className="w-10 h-10 rounded-lg bg-[#161616] border border-[#242424] flex items-center justify-center text-[#3b82f6]">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white uppercase tracking-wider">Clientes</p>
              <p className="text-[10px] text-[#444] uppercase tracking-wider mt-0.5">Fichas e sessões</p>
            </div>
            <span className="text-[#333] text-xl">›</span>
          </a>

          <a href="/calendario" className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 flex items-center gap-4 hover:border-[#2a2a2a] transition">
            <div className="w-10 h-10 rounded-lg bg-[#161616] border border-[#242424] flex items-center justify-center text-[#3b82f6]">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white uppercase tracking-wider">Agendamentos</p>
              <p className="text-[10px] text-[#444] uppercase tracking-wider mt-0.5">Agenda e calendário</p>
            </div>
            <span className="text-[#333] text-xl">›</span>
          </a>
        </div>

        {/* ACESSO RÁPIDO */}
        <p className="text-[9px] text-[#2a2a2a] tracking-[0.18em] uppercase mb-3">Acesso Rápido</p>
        <a href="/clientes" className="bg-[#1d4ed8] border border-[#2563eb] rounded-xl p-4 flex items-center gap-4 hover:bg-[#1e40af] transition">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white uppercase tracking-wider">Nova Sessão</p>
            <p className="text-[10px] text-blue-300/60 uppercase tracking-wider mt-0.5">Iniciar agora</p>
          </div>
          <span className="text-white/30 text-xl">›</span>
        </a>

      </div>
    </main>
  )
}