'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Voltar from '@/components/Voltar'

type Set = {
  numero: number
  repeticoes: number
  carga: number
}

type SetDB = {
  id: string
  numero: number
  repeticoes: number
  carga: number
}

type Registo = {
  id: string
  tipo: string
  nome_exercicio: string
  descricao: string
  bilateral: boolean
  lado: string
  notas: string
  sets?: SetDB[]
}

type Sessao = {
  id: string
  data: string
  hora: string
  energia: number | null
  sono: number | null
  alimentacao: number | null
  predisposicao: number | null
}

const CORES = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
const LABELS = ['', 'Muito Mau', 'Mau', 'Regular', 'Bom', 'Muito Bom']

const METRICAS = [
  { key: 'energia',       label: 'Energia',      emoji: '⚡' },
  { key: 'sono',          label: 'Sono',         emoji: '🌙' },
  { key: 'alimentacao',   label: 'Alimentação',  emoji: '🥗' },
  { key: 'predisposicao', label: 'Predisposição',emoji: '💪' },
] as const

export default function SessaoPage() {
  const { id, sessaoId } = useParams()
  const router = useRouter()
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [registos, setRegistos] = useState<Registo[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [tipo, setTipo] = useState<'exercicio' | 'intervencao'>('exercicio')
  const [nomeExercicio, setNomeExercicio] = useState('')
  const [descricao, setDescricao] = useState('')
  const [bilateral, setBilateral] = useState(true)
  const [lado, setLado] = useState('esquerdo')
  const [notas, setNotas] = useState('')
  const [sets, setSets] = useState<Set[]>([{ numero: 1, repeticoes: 10, carga: 0 }])
  const supabase = createClient()

  const holdRef = useRef<any>(null)
  const touchUsadoRef = useRef(false)

  useEffect(() => { carregarDados() }, [sessaoId])

  async function carregarDados() {
    const { data: s } = await supabase.from('sessoes').select('id, data, hora, energia, sono, alimentacao, predisposicao').eq('id', sessaoId).single()
    setSessao(s)
    const { data } = await supabase.from('registos').select('*, sets(id, numero, repeticoes, carga)').eq('sessao_id', sessaoId).order('ordem')
    setRegistos((data as any) || [])
  }

  function adicionarSet() {
    const ultimo = sets[sets.length - 1]
    setSets([...sets, { numero: sets.length + 1, repeticoes: ultimo?.repeticoes || 10, carga: ultimo?.carga || 0 }])
  }

  function removerSet(index: number) {
    if (sets.length === 1) return
    setSets(sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, numero: i + 1 })))
  }

  function ajustarSet(index: number, campo: 'repeticoes' | 'carga', delta: number) {
    setSets(prev => {
      const novos = [...prev]
      novos[index] = { ...novos[index], [campo]: Math.max(0, novos[index][campo] + delta) }
      return novos
    })
  }

  function iniciarHold(index: number, campo: 'repeticoes' | 'carga', delta: number) {
    ajustarSet(index, campo, delta)
    let velocidade = 400
    function passo() {
      ajustarSet(index, campo, delta)
      velocidade = Math.max(50, velocidade - 60)
      holdRef.current = setTimeout(passo, velocidade)
    }
    holdRef.current = setTimeout(passo, velocidade)
  }

  function pararHold() {
    if (holdRef.current) {
      clearTimeout(holdRef.current)
      holdRef.current = null
    }
  }

  function iniciarEdicao(r: Registo) {
    setEditandoId(r.id)
    setTipo(r.tipo as 'exercicio' | 'intervencao')
    setNomeExercicio(r.nome_exercicio || '')
    setDescricao(r.descricao || '')
    setBilateral(r.bilateral ?? true)
    setLado(r.lado || 'esquerdo')
    setNotas(r.notas || '')
    if (r.sets && r.sets.length > 0) {
      setSets([...r.sets].sort((a, b) => a.numero - b.numero).map(s => ({ numero: s.numero, repeticoes: s.repeticoes, carga: s.carga })))
    } else {
      setSets([{ numero: 1, repeticoes: 10, carga: 0 }])
    }
    setMostrarForm(true)
  }

  function cancelarForm() {
    setMostrarForm(false)
    setEditandoId(null)
    setNomeExercicio('')
    setDescricao('')
    setBilateral(true)
    setLado('esquerdo')
    setNotas('')
    setSets([{ numero: 1, repeticoes: 10, carga: 0 }])
  }

  async function guardarRegisto(e: React.FormEvent) {
    e.preventDefault()
    if (editandoId) {
      await supabase.from('registos').update({
        tipo,
        nome_exercicio: tipo === 'exercicio' ? nomeExercicio : null,
        descricao: tipo === 'intervencao' ? descricao : null,
        bilateral: tipo === 'exercicio' ? bilateral : null,
        lado: tipo === 'exercicio' && !bilateral ? lado : null,
        notas: notas || null,
      }).eq('id', editandoId)
      if (tipo === 'exercicio') {
        await supabase.from('sets').delete().eq('registo_id', editandoId)
        await supabase.from('sets').insert(sets.map(s => ({ registo_id: editandoId, numero: s.numero, repeticoes: s.repeticoes, carga: s.carga })))
      }
    } else {
      const { data: registo } = await supabase.from('registos').insert({
        sessao_id: sessaoId, tipo,
        nome_exercicio: tipo === 'exercicio' ? nomeExercicio : null,
        descricao: tipo === 'intervencao' ? descricao : null,
        bilateral: tipo === 'exercicio' ? bilateral : null,
        lado: tipo === 'exercicio' && !bilateral ? lado : null,
        notas: notas || null,
        ordem: registos.length
      }).select().single()
      if (registo && tipo === 'exercicio') {
        await supabase.from('sets').insert(sets.map(s => ({ registo_id: registo.id, numero: s.numero, repeticoes: s.repeticoes, carga: s.carga })))
      }
    }
    cancelarForm()
    carregarDados()
  }

  async function apagarRegisto(registoId: string) {
    await supabase.from('registos').delete().eq('id', registoId)
    carregarDados()
  }

  const temQuestionario = sessao && (sessao.energia || sessao.sono || sessao.alimentacao || sessao.predisposicao)

  const c = {
    page: { minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 120px' } as React.CSSProperties,
    wrap: { maxWidth: '600px', margin: '0 auto' },
    input: { width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', color: '#fff', outline: 'none' } as React.CSSProperties,
    label: { fontSize: '9px', color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: '10px' },
    stepBtn: { width: '40px', height: '40px', borderRadius: '10px', background: '#1d1d1d', border: '1px solid #2a2a2a', color: '#fff', fontSize: '22px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, userSelect: 'none' as const, touchAction: 'manipulation' as const } as React.CSSProperties,
  }

  const tipoBtn = (ativo: boolean): React.CSSProperties => ({
    flex: 1, padding: '16px', borderRadius: '14px', fontSize: '13px', fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
    background: ativo ? '#1d4ed8' : '#0d0d0d', border: ativo ? '1px solid #2563eb' : '1px solid #1e1e1e',
    color: ativo ? '#fff' : '#666', transition: 'all 0.15s',
  })

  const ladoBtn = (ativo: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
    background: ativo ? '#1d4ed8' : '#0d0d0d', border: ativo ? '1px solid #2563eb' : '1px solid #1e1e1e',
    color: ativo ? '#fff' : '#666', transition: 'all 0.15s',
  })

  const holdProps = (index: number, campo: 'repeticoes' | 'carga', delta: number) => ({
    onMouseDown: () => { if (touchUsadoRef.current) return; iniciarHold(index, campo, delta) },
    onMouseUp: pararHold,
    onMouseLeave: pararHold,
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); touchUsadoRef.current = true; iniciarHold(index, campo, delta) },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); pararHold() },
  })

  return (
    <main style={c.page}>
      <div style={c.wrap}>
        <Voltar />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Sessão</h1>
            {sessao?.data && (
              <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                {new Date(sessao.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                {sessao.hora ? ` · ${sessao.hora.slice(0, 5)}` : ''}
              </p>
            )}
          </div>
          <button onClick={() => mostrarForm && !editandoId ? cancelarForm() : (setMostrarForm(!mostrarForm), setEditandoId(null))}
            style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: mostrarForm ? '#1a1a1a' : '#1d4ed8',
              border: mostrarForm ? '1px solid #2a2a2a' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0
            }} aria-label="Adicionar">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              style={{ transform: mostrarForm ? 'rotate(45deg)' : 'none', transition: 'transform 0.15s' }}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* CARD QUESTIONÁRIO */}
        {temQuestionario && (
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '16px' }}>
              Avaliação Inicial
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {METRICAS.map(({ key, label, emoji }) => {
                const val = sessao?.[key] as number | null
                if (!val) return null
                const cor = CORES[val]
                return (
                  <div key={key} style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px' }}>{emoji}</span>
                      <span style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</span>
                    </div>
                    <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '8px' }}>
                      <div style={{ height: '100%', width: `${(val / 5) * 100}%`, background: cor, borderRadius: '2px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: cor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{LABELS[val]}</span>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: cor }}>{val}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FORMULÁRIO */}
        {mostrarForm && (
          <form onSubmit={guardarRegisto} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '9px', color: editandoId ? '#a855f7' : '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
              {editandoId ? '✎ Editar Registo' : '+ Novo Registo'}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button type="button" onClick={() => setTipo('exercicio')} style={tipoBtn(tipo === 'exercicio')}>Exercício</button>
              <button type="button" onClick={() => setTipo('intervencao')} style={tipoBtn(tipo === 'intervencao')}>Intervenção</button>
            </div>

            {tipo === 'exercicio' ? (
              <>
                <p style={c.label}>Nome do Exercício</p>
                <input value={nomeExercicio} onChange={e => setNomeExercicio(e.target.value)}
                  placeholder="Ex: Agachamento" required style={{ ...c.input, marginBottom: '20px' }} />

                <p style={c.label}>Lateralidade</p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <button type="button" onClick={() => { setBilateral(true); setLado('') }} style={ladoBtn(bilateral)}>Bilateral</button>
                  <button type="button" onClick={() => { setBilateral(false); setLado('esquerdo') }} style={ladoBtn(!bilateral && lado === 'esquerdo')}>Esquerdo</button>
                  <button type="button" onClick={() => { setBilateral(false); setLado('direito') }} style={ladoBtn(!bilateral && lado === 'direito')}>Direito</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <p style={{ ...c.label, marginBottom: 0 }}>Séries</p>
                  <button type="button" onClick={adicionarSet}
                    style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    + Série
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '8px' }}>
                  {sets.map((set, i) => (
                    <div key={i} style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Série {set.numero}</span>
                        {sets.length > 1 && (
                          <button type="button" onClick={() => removerSet(i)}
                            style={{ background: 'none', border: 'none', color: '#444', fontSize: '18px', cursor: 'pointer' }}>×</button>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '8px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', textAlign: 'center' }}>Reps</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button type="button" {...holdProps(i, 'repeticoes', -1)} style={c.stepBtn}>−</button>
                            <span style={{ flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: 800, color: '#fff' }}>{set.repeticoes}</span>
                            <button type="button" {...holdProps(i, 'repeticoes', 1)} style={c.stepBtn}>+</button>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '8px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', textAlign: 'center' }}>Carga kg</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button type="button" {...holdProps(i, 'carga', -1)} style={c.stepBtn}>−</button>
                            <span style={{ flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: 800, color: '#fff' }}>{set.carga}</span>
                            <button type="button" {...holdProps(i, 'carga', 1)} style={c.stepBtn}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p style={c.label}>Descrição da Intervenção</p>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                  placeholder="Ex: Massagem, mobilização articular..." rows={3} required
                  style={{ ...c.input, resize: 'none', marginBottom: '8px' }} />
              </>
            )}

            <p style={{ ...c.label, marginTop: '20px' }}>Notas Adicionais</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Opcional..." rows={2} style={{ ...c.input, resize: 'none', marginBottom: '20px' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit"
                style={{ flex: 1, background: editandoId ? '#7c3aed' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer' }}>
                {editandoId ? 'Atualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={cancelarForm}
                style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '14px 20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* LISTA DE REGISTOS */}
        {registos.length === 0 ? (
          <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem registos nesta sessão.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {registos.map(r => (
              <div key={r.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '9px', padding: '4px 8px', borderRadius: '8px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        background: r.tipo === 'exercicio' ? 'rgba(29,78,216,0.2)' : 'rgba(147,51,234,0.2)',
                        color: r.tipo === 'exercicio' ? '#3b82f6' : '#a855f7',
                      }}>
                        {r.tipo === 'exercicio' ? 'Exercício' : 'Intervenção'}
                      </span>
                      {r.tipo === 'exercicio' && (
                        <span style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {r.bilateral ? 'Bilateral' : r.lado === 'esquerdo' ? 'Esquerdo' : 'Direito'}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{r.nome_exercicio || r.descricao}</p>
                    {r.tipo === 'exercicio' && r.sets && r.sets.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {[...r.sets].sort((a, b) => a.numero - b.numero).map(set => (
                          <span key={set.id} style={{ fontSize: '10px', color: '#aaa', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {set.repeticoes}×{set.carga}kg
                          </span>
                        ))}
                      </div>
                    )}
                    {r.notas && <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '8px' }}>{r.notas}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
                    <button onClick={() => iniciarEdicao(r)}
                      style={{ background: 'none', border: 'none', color: '#3b3b3b', fontSize: '15px', cursor: 'pointer', padding: '4px 6px', borderRadius: '8px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#6366f1')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#3b3b3b')}
                      aria-label="Editar">✎</button>
                    <button onClick={() => apagarRegisto(r.id)}
                      style={{ background: 'none', border: 'none', color: '#2a2a2a', fontSize: '20px', cursor: 'pointer', padding: '4px 6px', borderRadius: '8px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#2a2a2a')}
                      aria-label="Apagar">×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTÃO FIXO — Terminar Sessão */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(to top, #0a0a0a 60%, transparent)',
        zIndex: 30,
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              width: '100%', background: '#16a34a', color: '#fff',
              border: 'none', borderRadius: '14px', padding: '16px',
              fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.2em', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Terminar Sessão
          </button>
        </div>
      </div>
    </main>
  )
}