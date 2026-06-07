'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/useTranslation'
import Voltar from '@/components/Voltar'

type Exercicio = { id: string; nome: string; series: string; reps: string; duracao: string; notas: string }

function novoExercicio(): Exercicio {
  return { id: crypto.randomUUID(), nome: '', series: '', reps: '', duracao: '', notas: '' }
}

export default function NovoProtocoloPage() {
  const { t } = useTranslation()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('Geral')
  const [exercicios, setExercicios] = useState<Exercicio[]>([novoExercicio()])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const CATEGORIAS_LIST = [
    t.categories.knee, t.categories.shoulder, t.categories.spine,
    t.categories.hip, t.categories.ankle, t.categories.elbow,
    t.categories.cervical, t.categories.postSurgery, t.categories.general,
  ]

  function adicionarExercicio() { setExercicios(prev => [...prev, novoExercicio()]) }
  function removerExercicio(id: string) { setExercicios(prev => prev.filter(e => e.id !== id)) }
  function atualizarExercicio(id: string, campo: keyof Exercicio, valor: string) {
    setExercicios(prev => prev.map(e => e.id === id ? { ...e, [campo]: valor } : e))
  }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault()
    if (!nome.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const exerciciosLimpos = exercicios.filter(e => e.nome.trim()).map(({ id, ...rest }) => rest)
    const { error } = await supabase.from('protocolos').insert({ user_id: user.id, nome: nome.trim(), descricao: descricao.trim() || null, categoria, exercicios: exerciciosLimpos })
    if (error) { alert(t.error + ': ' + error.message); setSaving(false); return }
    router.push('/protocolos')
  }

  const inputStyle = { width: '100%', background: '#0d0d0d', border: '1px solid #222', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: '#fff', outline: 'none', letterSpacing: '0.05em', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '9px', color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px' }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 110px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Voltar />
        <div style={{ marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px' }}>
          <p style={{ fontSize: '10px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>{t.rehabilitation}</p>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1 }}>{t.newProtocol}</h1>
        </div>

        <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>{t.protocolName} *</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder={t.protocolNamePlaceholder} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t.description}</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder={t.protocolObjectives} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }} />
          </div>
          <div>
            <label style={labelStyle}>{t.category}</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} style={inputStyle}>
              {CATEGORIAS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>{t.exercises}</label>
              <span style={{ fontSize: '10px', color: '#444' }}>{exercicios.length} {t.exercises.toLowerCase()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exercicios.map((ex, idx) => (
                <div key={ex.id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.exerciseNumber} {idx + 1}</span>
                    {exercicios.length > 1 && (
                      <button type="button" onClick={() => removerExercicio(ex.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: '2px' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')} onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    )}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <input value={ex.nome} onChange={e => atualizarExercicio(ex.id, 'nome', e.target.value)} placeholder={t.exerciseName + ' *'} style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #1a1a1a' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '8px', marginBottom: '4px' }}>{t.setsLabel}</label>
                      <input value={ex.series} onChange={e => atualizarExercicio(ex.id, 'series', e.target.value)} placeholder="3" style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '9px 12px' }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '8px', marginBottom: '4px' }}>{t.repsLabel}</label>
                      <input value={ex.reps} onChange={e => atualizarExercicio(ex.id, 'reps', e.target.value)} placeholder="12" style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '9px 12px' }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '8px', marginBottom: '4px' }}>{t.duration}</label>
                      <input value={ex.duracao} onChange={e => atualizarExercicio(ex.id, 'duracao', e.target.value)} placeholder="30" style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '9px 12px' }} />
                    </div>
                  </div>
                  <input value={ex.notas} onChange={e => atualizarExercicio(ex.id, 'notas', e.target.value)} placeholder={t.exerciseNotes} style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #1a1a1a' }} />
                </div>
              ))}
            </div>
            <button type="button" onClick={adicionarExercicio}
              style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'rgba(16,185,129,0.06)', border: '1px dashed rgba(16,185,129,0.3)', borderRadius: '12px', color: '#10b981', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              {t.addExercise}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
            <button type="submit" disabled={saving || !nome.trim()}
              style={{ flex: 1, background: nome.trim() ? '#10b981' : '#1a1a1a', color: nome.trim() ? '#fff' : '#333', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: nome.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
              {saving ? t.saving : t.saveProtocol}
            </button>
            <button type="button" onClick={() => router.back()}
              style={{ padding: '16px 20px', background: '#111', border: '1px solid #222', borderRadius: '14px', color: '#555', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}