'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Voltar from '@/components/Voltar'

export default function NovaSessaoPage() {
  const { id } = useParams()
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function criarSessao(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: sessao } = await supabase.from('sessoes').insert({
      cliente_id: id,
      fisio_id: user?.id,
      data,
      hora: hora || null,
      notas: notas || null
    }).select().single()
    if (sessao) window.location.href = `/clientes/${id}/sessoes/${sessao.id}`
    setLoading(false)
  }

  function definirData(offset: number) {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    setData(d.toISOString().split('T')[0])
  }

  const hoje = new Date().toISOString().split('T')[0]
  const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 100px' } as React.CSSProperties,
    wrap: { maxWidth: '600px', margin: '0 auto' },
    title: { fontSize: '32px', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '-0.01em', marginBottom: '28px' },
    label: { fontSize: '9px', color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: '10px' },
    card: { background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', marginBottom: '12px' },
    input: { width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', color: '#fff', outline: 'none' } as React.CSSProperties,
    chip: (ativo: boolean) => ({
      flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
      textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer',
      background: ativo ? '#1d4ed8' : '#0d0d0d',
      border: ativo ? '1px solid #2563eb' : '1px solid #1e1e1e',
      color: ativo ? '#fff' : '#666', transition: 'all 0.15s',
    }),
    horaChip: (ativo: boolean) => ({
      padding: '10px 0', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
      cursor: 'pointer', background: ativo ? '#1d4ed8' : '#0d0d0d',
      border: ativo ? '1px solid #2563eb' : '1px solid #1e1e1e',
      color: ativo ? '#fff' : '#666', transition: 'all 0.15s', textAlign: 'center' as const,
    }),
  }

  const horasRapidas = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']

  return (
    <main style={s.page}>
      <div style={s.wrap}>
        <Voltar />
        <h1 style={s.title}>Nova Sessão</h1>

        <form onSubmit={criarSessao}>

          {/* DATA */}
          <div style={s.card}>
            <p style={s.label}>Data</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button type="button" onClick={() => definirData(0)} style={s.chip(data === hoje)}>Hoje</button>
              <button type="button" onClick={() => definirData(1)} style={s.chip(data === amanha)}>Amanhã</button>
            </div>
            <input type="date" value={data} onChange={e => setData(e.target.value)} required style={s.input} />
          </div>

          {/* HORA */}
          <div style={s.card}>
            <p style={s.label}>Hora</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {horasRapidas.map(h => (
                <button key={h} type="button" onClick={() => setHora(h)} style={s.horaChip(hora === h)}>{h}</button>
              ))}
            </div>
            <input type="time" value={hora} onChange={e => setHora(e.target.value)} style={s.input} />
          </div>

          {/* NOTAS */}
          <div style={s.card}>
            <p style={s.label}>Notas</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3}
              placeholder="Observações gerais sobre a sessão..."
              style={{ ...s.input, resize: 'none' }} />
          </div>

          <button type="submit" disabled={loading || !data}
            style={{
              width: '100%', background: data ? '#1d4ed8' : '#1a1a1a',
              color: data ? '#fff' : '#444', border: 'none', borderRadius: '14px',
              padding: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.2em', cursor: data ? 'pointer' : 'not-allowed',
              marginTop: '4px', transition: 'all 0.15s',
            }}>
            {loading ? 'A criar...' : 'Criar Sessão'}
          </button>
        </form>
      </div>
    </main>
  )
}