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

export default function CalendarioPage() {
  const [mesAtual, setMesAtual] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [diaSelected, setDiaSelected] = useState<number | null>(new Date().getDate())
  const [mostrarForm, setMostrarForm] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [tipo, setTipo] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
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

  async function criarAgendamento(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(diaSelected).padStart(2, '0')}`
    await supabase.from('agendamentos').insert({
      cliente_id: clienteId || null,
      fisio_id: user?.id,
      data: dataStr,
      hora_inicio: horaInicio || null,
      hora_fim: horaFim || null,
      tipo: tipo || null,
      notas: notas || null,
    })
    setClienteId(''); setHoraInicio(''); setHoraFim(''); setTipo(''); setNotas('')
    setMostrarForm(false)
    setLoading(false)
    carregarAgendamentos()
  }

  async function apagarAgendamento(id: string) {
    if (!confirm('Apagar este agendamento?')) return
    await supabase.from('agendamentos').delete().eq('id', id)
    carregarAgendamentos()
  }

  function agendamentosNoDia(dia: number) {
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return agendamentos.filter(a => a.data === dataStr)
  }

  function diasNoMes() {
    return new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate()
  }

  function primeiroDiaSemana() {
    const d = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay()
    return d === 0 ? 6 : d - 1
  }

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const diasSemana = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const agendamentosDiaSelected = diaSelected ? agendamentosNoDia(diaSelected) : []
  const hoje = new Date()
  const dataSelectedStr = diaSelected
    ? new Date(mesAtual.getFullYear(), mesAtual.getMonth(), diaSelected)
        .toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 100px' } as React.CSSProperties,
    title: { fontSize: '32px', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '-0.01em', marginBottom: '24px', marginTop: '0' },
    card: { background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '16px', marginBottom: '12px' },
    navRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
    navBtn: { background: 'none', border: 'none', color: '#555', fontSize: '20px', cursor: 'pointer', padding: '0 4px' },
    mesLabel: { fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' as const, letterSpacing: '0.15em' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
    dayLabel: { textAlign: 'center' as const, fontSize: '9px', color: '#444', textTransform: 'uppercase' as const, letterSpacing: '0.1em', padding: '4px 0' },
    input: { width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.05em', outline: 'none', marginBottom: '0' } as React.CSSProperties,
    btnBlue: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer' } as React.CSSProperties,
    btnGhost: { background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer' } as React.CSSProperties,
  }

  return (
    <main style={s.page}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        <Voltar />
        <h1 style={s.title}>Calendário</h1>

        <div style={s.card}>
          <div style={s.navRow}>
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
                  onClick={() => { setDiaSelected(dia); setMostrarForm(false) }}
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

        {diaSelected && (
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dataSelectedStr}</span>
              <button style={s.btnGhost} onClick={() => setMostrarForm(!mostrarForm)}>+ Agendar</button>
            </div>

            {mostrarForm && (
              <form onSubmit={criarAgendamento} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #1a1a1a' }}>
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
                  <button type="submit" disabled={loading} style={s.btnBlue}>Guardar</button>
                  <button type="button" onClick={() => setMostrarForm(false)} style={s.btnGhost}>Cancelar</button>
                </div>
              </form>
            )}

            {agendamentosDiaSelected.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem agendamentos.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {agendamentosDiaSelected.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <a href={a.cliente_id ? `/clientes/${a.cliente_id}` : '#'}
                      style={{ display: 'flex', gap: '10px', textDecoration: 'none', flex: 1 }}>
                      <div style={{ width: '2px', background: '#3b82f6', borderRadius: '1px', alignSelf: 'stretch' }} />
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {a.clientes?.nome || 'Sem Cliente'} →
                        </p>
                        {(a.hora_inicio || a.hora_fim) && (
                          <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                            {a.hora_inicio?.slice(0, 5)}{a.hora_fim ? ` → ${a.hora_fim.slice(0, 5)}` : ''}
                          </p>
                        )}
                        {a.tipo && <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase' }}>{a.tipo}</p>}
                        {a.notas && <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase' }}>{a.notas}</p>}
                      </div>
                    </a>
                    <button onClick={() => apagarAgendamento(a.id)} style={{ background: 'none', border: 'none', color: '#333', fontSize: '20px', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}