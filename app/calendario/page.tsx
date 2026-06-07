'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Voltar from '@/components/Voltar'

type Agendamento = {
  id: string
  data: string
  hora_inicio: string
  hora_fim: string
  tipo: string
  notas: string
  cliente_id: string | null
  clientes: { nome: string } | null
}

type Cliente = {
  id: string
  nome: string
}

type ClientePopup = {
  id: string | null
  nome: string
}

export default function CalendarioPage() {
  const [mesAtual, setMesAtual] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [diaSelected, setDiaSelected] = useState<number | null>(new Date().getDate())
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [clienteId, setClienteId] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [tipo, setTipo] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [clientePopup, setClientePopup] = useState<ClientePopup | null>(null)
  const [enviandoLembrete, setEnviandoLembrete] = useState<string | null>(null) // id do agendamento a enviar
  const [lembreteEnviado, setLembreteEnviado] = useState<string | null>(null) // id do agendamento enviado
  const supabase = createClient()

  useEffect(() => { carregarAgendamentos() }, [mesAtual])
  useEffect(() => { carregarClientes() }, [])

  async function carregarClientes() {
    const { data } = await supabase.from('clientes').select('id, nome').order('nome')
    setClientes(data || [])
  }

  async function carregarAgendamentos() {
    const inicio = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).toISOString().split('T')[0]
    const fim = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).toISOString().split('T')[0]
    const { data } = await supabase.from('agendamentos').select('*, clientes(nome)').gte('data', inicio).lte('data', fim).order('hora_inicio')
    setAgendamentos((data as any) || [])
  }

  function iniciarEdicao(a: Agendamento) {
    setClientePopup(null)
    setEditandoId(a.id)
    setClienteId(a.cliente_id || '')
    setHoraInicio(a.hora_inicio || '')
    setHoraFim(a.hora_fim || '')
    setTipo(a.tipo || '')
    setNotas(a.notas || '')
    setMostrarForm(true)
  }

  function cancelarForm() {
    setMostrarForm(false)
    setEditandoId(null)
    setClienteId(''); setHoraInicio(''); setHoraFim(''); setTipo(''); setNotas('')
  }

  async function guardarAgendamento(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(diaSelected).padStart(2, '0')}`
    if (editandoId) {
      await supabase.from('agendamentos').update({
        cliente_id: clienteId || null,
        data: dataStr,
        hora_inicio: horaInicio || null,
        hora_fim: horaFim || null,
        tipo: tipo || null,
        notas: notas || null,
      }).eq('id', editandoId)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('agendamentos').insert({
        cliente_id: clienteId || null,
        fisio_id: user?.id,
        data: dataStr,
        hora_inicio: horaInicio || null,
        hora_fim: horaFim || null,
        tipo: tipo || null,
        notas: notas || null,
      })
    }
    cancelarForm()
    setLoading(false)
    carregarAgendamentos()
  }

  async function apagarAgendamento(id: string) {
    if (!confirm('Apagar este agendamento?')) return
    await supabase.from('agendamentos').delete().eq('id', id)
    setClientePopup(null)
    carregarAgendamentos()
  }

  function agendamentosNoDia(dia: number) {
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return agendamentos.filter(a => a.data === dataStr)
  }

  function clientesNoDia(dia: number): { cliente: ClientePopup; ags: Agendamento[] }[] {
    const ags = agendamentosNoDia(dia)
    const mapa = new Map<string, { cliente: ClientePopup; ags: Agendamento[] }>()
    ags.forEach(a => {
      const key = a.cliente_id || 'sem-cliente'
      if (!mapa.has(key)) {
        mapa.set(key, { cliente: { id: a.cliente_id, nome: a.clientes?.nome || 'Sem Cliente' }, ags: [] })
      }
      mapa.get(key)!.ags.push(a)
    })
    return Array.from(mapa.values()).sort((a, b) => a.cliente.nome.localeCompare(b.cliente.nome))
  }

  function diasNoMes() {
    return new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate()
  }

  function primeiroDiaSemana() {
    const d = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay()
    return d === 0 ? 6 : d - 1
  }

  async function enviarLembrete(a: Agendamento) {
    setEnviandoLembrete(a.id)
    try {
      const res = await fetch('/api/lembrete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNome: clientePopup?.nome || 'Cliente',
          data: a.data,
          horaInicio: a.hora_inicio,
          horaFim: a.hora_fim,
          tipo: a.tipo,
          notas: a.notas,
        }),
      })
      if (res.ok) {
        setLembreteEnviado(a.id)
        setTimeout(() => setLembreteEnviado(null), 3000)
      } else {
        alert('Erro ao enviar lembrete.')
      }
    } catch {
      alert('Erro ao enviar lembrete.')
    }
    setEnviandoLembrete(null)
  }

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const diasSemana = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const hoje = new Date()
  const dataSelectedStr = diaSelected
    ? new Date(mesAtual.getFullYear(), mesAtual.getMonth(), diaSelected)
        .toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''
  const clientesDoDia = diaSelected ? clientesNoDia(diaSelected) : []
  const agendamentosDoClientePopup = clientePopup
    ? agendamentosNoDia(diaSelected!).filter(a => (a.cliente_id ?? null) === clientePopup.id)
    : []

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 100px' } as React.CSSProperties,
    title: { fontSize: '32px', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '-0.01em', marginBottom: '24px', marginTop: '0' },
    card: { background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '16px', marginBottom: '12px' },
    navBtn: { background: 'none', border: 'none', color: '#555', fontSize: '20px', cursor: 'pointer', padding: '0 4px' },
    mesLabel: { fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' as const, letterSpacing: '0.15em' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
    dayLabel: { textAlign: 'center' as const, fontSize: '9px', color: '#444', textTransform: 'uppercase' as const, letterSpacing: '0.1em', padding: '4px 0' },
    input: { width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.05em', outline: 'none' } as React.CSSProperties,
    btnBlue: (edit: boolean) => ({ background: edit ? '#7c3aed' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer' } as React.CSSProperties),
    btnGhost: { background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer' } as React.CSSProperties,
  }

  return (
    <main style={s.page}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Voltar />
        <h1 style={s.title}>Calendário</h1>

        {/* CALENDÁRIO */}
        <div style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button style={s.navBtn} onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))}>‹</button>
            <span style={s.mesLabel}>{meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}</span>
            <button style={s.navBtn} onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))}>›</button>
          </div>
          <div style={s.grid}>
            {diasSemana.map((d, i) => <div key={i} style={s.dayLabel}>{d}</div>)}
          </div>
          <div style={s.grid}>
            {Array.from({ length: primeiroDiaSemana() }).map((_, i) => <div key={`v-${i}`} />)}
            {Array.from({ length: diasNoMes() }).map((_, i) => {
              const dia = i + 1
              const temAg = agendamentosNoDia(dia).length > 0
              const isHoje = hoje.getDate() === dia && hoje.getMonth() === mesAtual.getMonth() && hoje.getFullYear() === mesAtual.getFullYear()
              const isSelected = diaSelected === dia
              return (
                <button key={dia}
                  onClick={() => { setDiaSelected(dia); cancelarForm(); setClientePopup(null) }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    aspectRatio: '1/1', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    background: isSelected ? '#3b82f6' : isHoje ? '#1a1a1a' : 'transparent',
                    color: isSelected ? '#fff' : isHoje ? '#fff' : '#888',
                  }}>
                  <span>{dia}</span>
                  {temAg && <div style={{ width: '4px', height: '4px', borderRadius: '50%', marginTop: '2px', background: isSelected ? '#fff' : '#3b82f6' }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* DIA SELECIONADO */}
        {diaSelected && (
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dataSelectedStr}</span>
              <button style={s.btnGhost} onClick={() => { cancelarForm(); setMostrarForm(true) }}>+ Agendar</button>
            </div>

            {mostrarForm && (
              <form onSubmit={guardarAgendamento} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #1a1a1a' }}>
                <p style={{ fontSize: '9px', color: editandoId ? '#a855f7' : '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, margin: 0 }}>
                  {editandoId ? '✎ Editar Agendamento' : '+ Novo Agendamento'}
                </p>
                <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={s.input}>
                  <option value="">Sem Cliente Associado</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Hora Início</p>
                    <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} style={s.input} />
                  </div>
                  <div>
                    <p style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Hora Fim</p>
                    <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} style={s.input} />
                  </div>
                </div>
                <input value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Tipo de Sessão" style={s.input} />
                <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Notas" rows={2} style={{ ...s.input, resize: 'none' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={loading} style={s.btnBlue(!!editandoId)}>
                    {editandoId ? 'Atualizar' : 'Guardar'}
                  </button>
                  <button type="button" onClick={cancelarForm} style={s.btnGhost}>Cancelar</button>
                </div>
              </form>
            )}

            {clientesDoDia.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem agendamentos.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {clientesDoDia.map(({ cliente, ags }) => (
                  <button
                    key={cliente.id || 'sem-cliente'}
                    onClick={() => setClientePopup(clientePopup?.id === cliente.id ? null : cliente)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '12px',
                      padding: '14px 16px', cursor: 'pointer', width: '100%', textAlign: 'left',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '3px', height: '32px', background: '#3b82f6', borderRadius: '2px' }} />
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                          {cliente.nome}
                        </p>
                        <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, marginTop: '2px' }}>
                          {ags.length} agendamento{ags.length !== 1 ? 's' : ''}
                          {ags[0]?.hora_inicio ? ` · ${ags[0].hora_inicio.slice(0, 5)}` : ''}
                        </p>
                      </div>
                    </div>
                    <span style={{ color: '#444', fontSize: '18px', transition: 'transform 0.15s', transform: clientePopup?.id === cliente.id ? 'rotate(90deg)' : 'none' }}>›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BACKDROP */}
      {clientePopup && (
        <div onClick={() => setClientePopup(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 40 }} />
      )}

      {/* POPUP AGENDAMENTOS DO CLIENTE */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        transform: clientePopup ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        background: '#111', borderTop: '1px solid #1e1e1e',
        borderRadius: '24px 24px 0 0', maxHeight: '80vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
        </div>
        {clientePopup && (
          <div style={{ padding: '20px 24px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>
                  {dataSelectedStr}
                </p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                  {clientePopup.nome}
                </h2>
              </div>
              <button onClick={() => setClientePopup(null)}
                style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1a1a1a', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {agendamentosDoClientePopup
                .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
                .map(a => (
                  <div key={a.id} style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        {(a.hora_inicio || a.hora_fim) && (
                          <p style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                            {a.hora_inicio?.slice(0, 5)}{a.hora_fim ? ` → ${a.hora_fim.slice(0, 5)}` : ''}
                          </p>
                        )}
                        {a.tipo && <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{a.tipo}</p>}
                        {a.notas && <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase' }}>{a.notas}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
                        <button onClick={() => iniciarEdicao(a)}
                          style={{ background: 'none', border: 'none', color: '#555', fontSize: '15px', cursor: 'pointer', padding: '4px 6px', borderRadius: '8px' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#6366f1')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                          aria-label="Editar">✎</button>
                        <button onClick={() => apagarAgendamento(a.id)}
                          style={{ background: 'none', border: 'none', color: '#333', fontSize: '20px', cursor: 'pointer', padding: '4px 6px', borderRadius: '8px' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#333')}
                          aria-label="Apagar">×</button>
                        <button
                          onClick={() => enviarLembrete(a)}
                          disabled={enviandoLembrete === a.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '8px', fontSize: '15px', color: lembreteEnviado === a.id ? '#22c55e' : '#555' }}
                          onMouseEnter={e => { if (lembreteEnviado !== a.id) e.currentTarget.style.color = '#3b82f6' }}
                          onMouseLeave={e => { if (lembreteEnviado !== a.id) e.currentTarget.style.color = '#555' }}
                          aria-label="Enviar Lembrete">
                          {enviandoLembrete === a.id ? '...' : lembreteEnviado === a.id ? '✓' : '✉'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {clientePopup.id && (
              <a href={`/clientes/${clientePopup.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', padding: '12px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '12px', textDecoration: 'none', color: '#555', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Ver Perfil do Cliente <span style={{ fontSize: '16px' }}>›</span>
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  )
}