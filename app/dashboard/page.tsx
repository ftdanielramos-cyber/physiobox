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

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 110px' } as React.CSSProperties,
    wrap: { maxWidth: '600px', margin: '0 auto' },
    avatar: { width: '56px', height: '56px', borderRadius: '16px', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, color: '#fff', flexShrink: 0 } as React.CSSProperties,
    statCard: { background: '#141414', border: '1px solid #222', borderRadius: '14px', padding: '18px 8px', textAlign: 'center' as const },
    statNum: { fontSize: '34px', fontWeight: 800, color: '#3b82f6', lineHeight: 1 },
    statLbl: { fontSize: '9px', color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginTop: '6px' },
    sectionLbl: { fontSize: '9px', color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginBottom: '10px' },
    card: { background: '#141414', border: '1px solid #222', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' } as React.CSSProperties,
    iconBox: { width: '42px', height: '42px', borderRadius: '11px', background: '#1d1d1d', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 } as React.CSSProperties,
    cardTitle: { fontSize: '15px', fontWeight: 700, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
    cardSub: { fontSize: '10px', color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: '3px' },
    arrow: { color: '#444', fontSize: '22px', marginLeft: 'auto' },
  }

  return (
    <main style={s.page}>
      <div style={s.wrap}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px' }}>
          <div style={s.avatar}>{inicial}</div>
          <div>
            <p style={{ color: '#3b82f6', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>{hoje}</p>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1 }}>
              {nome ? `Olá, ${nome}` : 'Physiobox'}
            </h1>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '32px' }}>
          {[
            { valor: totalClientes, label: 'Clientes' },
            { valor: sessoesHoje, label: 'Hoje' },
            { valor: sessoesMes, label: 'Este Mês' },
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <p style={s.statNum}>{st.valor ?? '—'}</p>
              <p style={s.statLbl}>{st.label}</p>
            </div>
          ))}
        </div>

        {/* PRÓXIMOS AGENDAMENTOS */}
        {proximos.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <p style={s.sectionLbl}>Próximos Agendamentos</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {proximos.map(a => (
                <a key={a.id} href={a.cliente_id ? `/clientes/${a.cliente_id}` : '/calendario'} style={s.card}>
                  <div style={{ width: '4px', height: '40px', background: '#3b82f6', borderRadius: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.cardTitle}>{a.clientes?.nome || 'Sem Cliente'}</p>
                    <p style={s.cardSub}>
                      {new Date(a.data + 'T00:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                      {a.hora_inicio ? ` · ${a.hora_inicio.slice(0, 5)}` : ''}
                      {a.tipo ? ` · ${a.tipo}` : ''}
                    </p>
                  </div>
                  <span style={s.arrow}>›</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* NAVEGAÇÃO */}
        <p style={s.sectionLbl}>Navegação</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          <a href="/clientes" style={s.card}>
            <div style={s.iconBox}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={s.cardTitle}>Clientes</p>
              <p style={s.cardSub}>Fichas e sessões</p>
            </div>
            <span style={s.arrow}>›</span>
          </a>

          <a href="/calendario" style={s.card}>
            <div style={s.iconBox}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={s.cardTitle}>Agendamentos</p>
              <p style={s.cardSub}>Agenda e calendário</p>
            </div>
            <span style={s.arrow}>›</span>
          </a>
        </div>

        {/* ACESSO RÁPIDO */}
        <p style={s.sectionLbl}>Acesso Rápido</p>
        <a href="/clientes" style={{ ...s.card, background: '#1d4ed8', border: '1px solid #2563eb' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={s.cardTitle}>Nova Sessão</p>
            <p style={{ ...s.cardSub, color: 'rgba(147,197,253,0.7)' }}>Iniciar agora</p>
          </div>
          <span style={{ ...s.arrow, color: 'rgba(255,255,255,0.4)' }}>›</span>
        </a>

      </div>
    </main>
  )
}