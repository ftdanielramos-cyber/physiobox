'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Voltar from '@/components/Voltar'

type Exercicio = {
  id: string
  nome: string
  series: string
  reps: string
  duracao: string
  notas: string
}

const CATEGORIAS = ['Joelho', 'Ombro', 'Coluna', 'Anca', 'Tornozelo', 'Cotovelo', 'Cervical', 'Pós-Cirúrgico', 'Geral']

function novoExercicio(): Exercicio {
  return { id: crypto.randomUUID(), nome: '', series: '', reps: '', duracao: '', notas: '' }
}

export default function NovoProtocoloPage() {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('Geral')
  const [exercicios, setExercicios] = useState<Exercicio[]>([novoExercicio()])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function adicionarExercicio() {
    setExercicios(prev => [...prev, novoExercicio()])
  }

  function removerExercicio(id: string) {
    setExercicios(prev => prev.filter(e => e.id !== id))
  }

  function atualizarExercicio(id: string, campo: keyof Exercicio, valor: string) {
    setExercicios(prev => prev.map(e => e.id === id ? { ...e, [campo]: valor } : e))
  }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault()
    if (!nome.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const exerciciosLimpos = exercicios
      .filter(e => e.nome.trim())
      .map(({ id, ...rest }) => rest)

    const { error } = await supabase.from('protocolos').insert({
      user_id: user.id,
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      categoria,
      exercicios: exerciciosLimpos,
    })

    if (error) { alert('Erro ao guardar: ' + error.message); setSaving(false); return }
    router.push('/protocolos')
  }

  const inputStyle = {
    width: '100%', background: '#0d0d0d', border: '1px solid #222',
    borderRadius: '10px', padding: '11px 14px', fontSize: '13px',
    color: '#fff', outline: 'none', letterSpacing: '0.05em', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    display: 'block', fontSize: '9px', color: '#555',
    textTransform: 'uppercase' as const, letterSpacing: '0.15em',
    fontWeight: 700, marginBottom: '8px',
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 110px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Voltar />

        <div style={{ marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px' }}>
          <p style={{ fontSize: '10px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>
            Reabilitação
          </p>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1 }}>
            Novo Protocolo
          </h1>
        </div>

        <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Nome */}
          <div>
            <label style={labelStyle}>Nome do Protocolo *</label>
            <input value={nome} onChange={e => setNome(e.target.value)}
              placeholder="Ex: Reabilitação Pós-Operatória LCA"
              required style={inputStyle} />
          </div>

          {/* Descrição */}
          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
              placeholder="Objetivos, indicações, observações..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }} />
          </div>

          {/* Categoria */}
          <div>
            <label style={labelStyle}>Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} style={inputStyle}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Exercícios */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Exercícios</label>
              <span style={{ fontSize: '10px', color: '#444', letterSpacing: '0.08em' }}>
                {exercicios.length} exercício{exercicios.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exercicios.map((ex, idx) => (
                <div key={ex.id} style={{
                  background: '#111', border: '1px solid #1e1e1e',
                  borderRadius: '14px', padding: '16px',
                  position: 'relative',
                }}>
                  {/* Número + remover */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Exercício {idx + 1}
                    </span>
                    {exercicios.length > 1 && (
                      <button type="button" onClick={() => removerExercicio(ex.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: '2px' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Nome do exercício */}
                  <div style={{ marginBottom: '10px' }}>
                    <input value={ex.nome}
                      onChange={e => atualizarExercicio(ex.id, 'nome', e.target.value)}
                      placeholder="Nome do exercício *"
                      style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #1a1a1a', marginBottom: 0 }} />
                  </div>

                  {/* Séries / Reps / Duração */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '8px', marginBottom: '4px' }}>Séries</label>
                      <input value={ex.series}
                        onChange={e => atualizarExercicio(ex.id, 'series', e.target.value)}
                        placeholder="3"
                        style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '9px 12px' }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '8px', marginBottom: '4px' }}>Reps</label>
                      <input value={ex.reps}
                        onChange={e => atualizarExercicio(ex.id, 'reps', e.target.value)}
                        placeholder="12"
                        style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '9px 12px' }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '8px', marginBottom: '4px' }}>Duração (s)</label>
                      <input value={ex.duracao}
                        onChange={e => atualizarExercicio(ex.id, 'duracao', e.target.value)}
                        placeholder="30"
                        style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '9px 12px' }} />
                    </div>
                  </div>

                  {/* Notas */}
                  <input value={ex.notas}
                    onChange={e => atualizarExercicio(ex.id, 'notas', e.target.value)}
                    placeholder="Notas / instruções específicas"
                    style={{ ...inputStyle, background: '#0a0a0a', border: '1px solid #1a1a1a' }} />
                </div>
              ))}
            </div>

            {/* Adicionar exercício */}
            <button type="button" onClick={adicionarExercicio}
              style={{
                width: '100%', marginTop: '10px', padding: '12px',
                background: 'rgba(16,185,129,0.06)', border: '1px dashed rgba(16,185,129,0.3)',
                borderRadius: '12px', color: '#10b981', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Adicionar Exercício
            </button>
          </div>

          {/* Guardar */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
            <button type="submit" disabled={saving || !nome.trim()}
              style={{
                flex: 1, background: nome.trim() ? '#10b981' : '#1a1a1a',
                color: nome.trim() ? '#fff' : '#333',
                border: 'none', borderRadius: '14px', padding: '16px',
                fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.15em', cursor: nome.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}>
              {saving ? 'A guardar...' : 'Guardar Protocolo'}
            </button>
            <button type="button" onClick={() => router.back()}
              style={{
                padding: '16px 20px', background: '#111', border: '1px solid #222',
                borderRadius: '14px', color: '#555', fontSize: '12px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
              }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}