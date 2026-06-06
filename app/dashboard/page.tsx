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
      const { data: ag } = await supabase.from('agendamentos').select('*, clientes(nome)').gte('data', hoje).order('data').order('hora_inicio').limit(3)
      setProximos(ag || [])
    }
    carregarStats()
  }, [])

  const hoje = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
  const inicial = nome ? nome.charAt(0).toUpperCase() : 'P'
  const hojeStr = new Date().toISOString().split('T')[0]

  return (
    <main className="min-h-screen bg-background px-4 pt-10 pb-28">
      <div className="max-w-[600px] mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-7 pb-6 border-b border-white/[0.06]">
          <div className="w-13 h-13 rounded-2xl bg-blue-900/40 flex items-center justify-center text-xl font-medium text-blue-300 shrink-0">
            {inicial}
          </div>
          <div>
            <p className="text-[11px] text-blue-400 tracking-widest uppercase mb-1">{hoje}</p>
            <h1 className="text-[26px] font-medium text-white tracking-tight leading-none">
              {nome ? `Olá, ${nome}` : 'Physiobox'}
            </h1>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-2.5 mb-7">
          {[
            { valor: totalClientes, label: 'Clientes' },
            { valor: sessoesHoje, label: 'Hoje' },
            { valor: sessoesMes, label: 'Este Mês' },
          ].map(st => (
            <div key={st.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl py-4 px-2 text-center">
              <p className="text-[32px] font-medium text-blue-400 leading-none">{st.valor ?? '—'}</p>
              <p className="text-[10px] text-white/30 tracking-widest uppercase mt-1.5">{st.label}</p>
            </div>
          ))}
        </div>

        {/* PRÓXIMOS AGENDAMENTOS */}
        {proximos.length > 0 && (
          <div className="mb-7">
            <p className="text-[10px] text-white/25 tracking-[0.16em] uppercase mb-2.5">Próximos agendamentos</p>
            <div className="flex flex-col gap-2.5">
              {proximos.map(a => {
                const isHoje = a.data === hojeStr
                return (
                  
                    key={a.id}
                    href={a.cliente_id ? `/clientes/${a.cliente_id}` : '/calendario'}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 flex items-center gap-3.5 no-underline hover:border-white/[0.12] transition-colors"
                  >
                    <div className="w-1 h-10 bg-blue-500/60 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-white uppercase tracking-[0.04em]">
                        {a.clientes?.nome || 'Sem Cliente'}
                      </p>
                      <p className="text-[11px] text-white/30 uppercase tracking-[0.06em] mt-0.5">
                        {new Date(a.data + 'T00:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                        {a.hora_inicio ? ` · ${a.hora_inicio.slice(0, 5)}` : ''}
                        {a.tipo ? ` · ${a.tipo}` : ''}
                      </p>
                    </div>
                    {isHoje && (
                      <span className="text-[10px] bg-blue-500/15 text-blue-400 rounded-md px-2 py-0.5 tracking-[0.06em] uppercase">
                        Hoje
                      </span>
                    )}
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* NAVEGAÇÃO */}
        <p className="text-[10px] text-white/25 tracking-[0.16em] uppercase mb-2.5">Navegação</p>
        <div className="flex flex-col gap-2.5">
          <a href="/clientes" className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 flex items-center gap-3.5 no-underline hover:border-white/[0.12] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-blue-400 shrink-0">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="flex-1 text-[14px] font-medium text-white uppercase tracking-[0.04em]">Clientes</p>
            <span className="text-white/25 text-xl">›</span>
          </a>

          <a href="/calendario" className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 flex items-center gap-3.5 no-underline hover:border-white/[0.12] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-blue-400 shrink-0">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="flex-1 text-[14px] font-medium text-white uppercase tracking-[0.04em]">Agendamentos</p>
            <span className="text-white/25 text-xl">›</span>
          </a>
        </div>

      </div>
    </main>
  )
}
