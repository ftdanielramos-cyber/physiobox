'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/useTranslation'
import Voltar from '@/components/Voltar'

type Questionario = {
  energia: number
  sono: number
  alimentacao: number
  predisposicao: number
}

const CORES = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

export default function NovaSessaoPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarQ, setMostrarQ] = useState(false)
  const [q, setQ] = useState<Questionario>({ energia: 3, sono: 3, alimentacao: 3, predisposicao: 3 })

  const supabase = createClient()

  const PERGUNTAS: { key: keyof Questionario; label: string; emoji: string }[] = [
    { key: 'energia',       label: t.energy,    emoji: '⚡' },
    { key: 'sono',          label: t.sleep,     emoji: '🌙' },
    { key: 'alimentacao',   label: t.nutrition, emoji: '🥗' },
    { key: 'predisposicao', label: t.readiness, emoji: '💪' },
  ]

  const LABELS = ['', t.veryBad, t.bad, t.regular, t.good, t.veryGood]

  function abrirQuestionario(e: React.FormEvent) {
    e.preventDefault(); e.stopPropagation(); setMostrarQ(true)
  }

  async function criarSessao(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: sessao, error } = await supabase.from('sessoes').insert({
        cliente_id: id, fisio_id: user?.id, data, hora: hora || null,
        notas: notas || null, energia: q.energia, sono: q.sono,
        alimentacao: q.alimentacao, predisposicao: q.predisposicao,
      }).select().single()
      if (error) { alert(t.error + ': ' + error.message); setLoading(false); return }
      router.push(`/clientes/${id}/sessoes/${sessao.id}`)
    } catch (err) {
      console.error(err); setLoading(false)
    }
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
    label: { fontSize: '9px', color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: '10px' },
    card: { background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', marginBottom: '12px' },
    input: { width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', color: '#fff', outline: 'none' } as React.CSSProperties,
    chip: (ativo: boolean) => ({ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', background: ativo ? '#1d4ed8' : '#0d0d0d', border: ativo ? '1px solid #2563eb' : '1px solid #1e1e1e', color: ativo ? '#fff' : '#666', transition: 'all 0.15s' }),
    horaChip: (ativo: boolean) => ({ padding: '10px 0', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: ativo ? '#1d4ed8' : '#0d0d0d', border: ativo ? '1px solid #2563eb' : '1px solid #1e1e1e', color: ativo ? '#fff' : '#666', transition: 'all 0.15s', textAlign: 'center' as const }),
  }

  const horasRapidas = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']

  return (
    <main style={s.page}>
      <div style={s.wrap}>
        <Voltar />
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '28px' }}>
          {t.newSession}
        </h1>

        <form onSubmit={abrirQuestionario}>
          <div style={s.card}>
            <p style={s.label}>{t.date}</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button type="button" onClick={() => definirData(0)} style={s.chip(data === hoje)}>{t.today}</button>
              <button type="button" onClick={() => definirData(1)} style={s.chip(data === amanha)}>{t.tomorrow}</button>
            </div>
            <input type="date" value={data} onChange={e => setData(e.target.value)} required style={s.input} />
          </div>

          <div style={s.card}>
            <p style={s.label}>{t.time}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {horasRapidas.map(h => (
                <button key={h} type="button" onClick={() => setHora(h)} style={s.horaChip(hora === h)}>{h}</button>
              ))}
            </div>
            <input type="time" value={hora} onChange={e => setHora(e.target.value)} style={s.input} />
          </div>

          <div style={s.card}>
            <p style={s.label}>{t.notes}</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3}
              placeholder={t.generalNotes}
              style={{ ...s.input, resize: 'none' }} />
          </div>

          <button type="submit" disabled={loading || !data}
            style={{ width: '100%', background: data ? '#1d4ed8' : '#1a1a1a', color: data ? '#fff' : '#444', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: data ? 'pointer' : 'not-allowed', marginTop: '4px', transition: 'all 0.15s' }}>
            {t.createSession}
          </button>
        </form>
      </div>

      {mostrarQ && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 40 }} />
      )}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, transform: mostrarQ ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)', background: '#111', borderTop: '1px solid #1e1e1e', borderRadius: '24px 24px 0 0', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
        </div>
        <div style={{ padding: '20px 24px 40px' }}>
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>{t.initialAssessment}</p>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>{t.howAreYou}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
            {PERGUNTAS.map(({ key, label, emoji }) => {
              const val = q[key]
              const cor = CORES[val]
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{emoji}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: cor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{LABELS[val]}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setQ(prev => ({ ...prev, [key]: n }))}
                        style={{ flex: 1, height: '44px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '16px', transition: 'all 0.15s', background: val === n ? CORES[n] : '#1a1a1a', color: val === n ? '#fff' : '#333', transform: val === n ? 'scale(1.08)' : 'scale(1)' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <button type="button" onClick={criarSessao} disabled={loading}
            style={{ width: '100%', background: loading ? '#1a3a8f' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? t.creating : t.confirmCreate}
          </button>
        </div>
      </div>
    </main>
  )
}