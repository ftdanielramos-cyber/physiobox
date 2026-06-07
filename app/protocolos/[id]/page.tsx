'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Voltar from '@/components/Voltar'

type Protocolo = {
  id: string
  nome: string
  descricao: string | null
  categoria: string
  exercicios: any[]
  created_at: string
}

type Atribuicao = {
  id: string
  cliente_id: string
  data_inicio: string
  data_fim: string | null
  estado: string
  notas: string | null
  clientes: { nome: string } | null
}

type Cliente = { id: string; nome: string }

const COR_ESTADO: Record<string, string> = {
  ativo: '#10b981',
  concluido: '#3b82f6',
  pausado: '#f59e0b',
}

export default function ProtocoloDetalhe() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [protocolo, setProtocolo] = useState<Protocolo | null>(null)
  const [atribuicoes, setAtribuicoes] = useState<Atribuicao[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0])
  const [dataFim, setDataFim] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { carregar() }, [id])

  async function carregar() {
    const { data: p } = await supabase.from('protocolos').select('*').eq('id', id).single()
    setProtocolo(p)

    const { data: at } = await supabase
      .from('paciente_protocolos')
      .select('*, clientes(nome)')
      .eq('protocolo_id', id)
      .order('created_at', { ascending: false })
    setAtribuicoes(at || [])

    const { data: cl } = await supabase.from('clientes').select('id, nome').order('nome')
    setClientes(cl || [])
  }

  async function atribuir(ev: React.FormEvent) {
    ev.preventDefault()
    if (!clienteId || !dataInicio) return
    setSaving(true)
    const { error } = await supabase.from('paciente_protocolos').insert({
      protocolo_id: id,
      cliente_id: clienteId,
      data_inicio: dataInicio,
      data_fim: dataFim || null,
      estado: 'ativo',
      notas: notas || null,
    })
    if (error) { alert('Erro: ' + error.message); setSaving(false); return }
    setModalAberto(false)
    setClienteId(''); setDataInicio(new Date().toISOString().split('T')[0]); setDataFim(''); setNotas('')
    setSaving(false)
    carregar()
  }

  async function alterarEstado(atId: string, estado: string) {
    await supabase.from('paciente_protocolos').update({ estado }).eq('id', atId)
    carregar()
  }

  if (!protocolo) return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>A carregar...</p>
    </main>
  )

  const inputStyle = {
    width: '100%', background: '#0d0d0d', border: '1px solid #222', borderRadius: '10px',
    padding: '11px 14px', fontSize: '13px', color: '#fff', outline: 'none',
    letterSpacing: '0.05em', boxSizing: 'border-box' as const,
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 110px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Voltar />

        {/* Header */}
        <div style={{ marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: '#10b981',
                background: 'rgba(16,185,129,0.1)', padding: '3px 10px', borderRadius: '10px',
                display: 'inline-block', marginBottom: '10px',
              }}>
                {protocolo.categoria}
              </span>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                {protocolo.nome}
              </h1>
              {protocolo.descricao && (
                <p style={{ fontSize: '12px', color: '#555', marginTop: '8px', lineHeight: 1.6 }}>
                  {protocolo.descricao}
                </p>
              )}
            </div>
            <a href={`/protocolos/${id}/editar`}
              style={{
                width: '40px', height: '40px', flexShrink: 0, borderRadius: '12px',
                background: '#1a1a1a', border: '1px solid #222',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#555', textDecoration: 'none',
              }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Exercícios */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '12px' }}>
            Exercícios · {protocolo.exercicios?.length ?? 0}
          </p>
          {(!protocolo.exercicios || protocolo.exercicios.length === 0) ? (
            <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem exercícios definidos.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {protocolo.exercicios.map((ex: any, i: number) => (
                <div key={i} style={{
                  background: '#111', border: '1px solid #1a1a1a', borderRadius: '14px', padding: '14px 16px',
                  display: 'flex', gap: '14px', alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: '11px', fontWeight: 800, color: '#10b981',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      {ex.nome}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
                      {ex.series && <span style={{ fontSize: '10px', color: '#555' }}>{ex.series} séries</span>}
                      {ex.reps && <span style={{ fontSize: '10px', color: '#555' }}>{ex.reps} reps</span>}
                      {ex.duracao && <span style={{ fontSize: '10px', color: '#555' }}>{ex.duracao}s</span>}
                    </div>
                    {ex.notas && (
                      <p style={{ fontSize: '11px', color: '#444', marginTop: '6px', fontStyle: 'italic' }}>{ex.notas}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pacientes com este protocolo */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
              Pacientes · {atribuicoes.length}
            </p>
            <button onClick={() => setModalAberto(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '10px', padding: '6px 12px',
                color: '#10b981', fontSize: '10px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
              }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Atribuir
            </button>
          </div>

          {atribuicoes.length === 0 ? (
            <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Ainda não atribuído a nenhum paciente.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {atribuicoes.map(at => {
                const corEstado = COR_ESTADO[at.estado] || '#555'
                return (
                  <div key={at.id} style={{
                    background: '#111', border: '1px solid #1a1a1a', borderRadius: '14px',
                    padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {at.clientes?.nome || '—'}
                      </p>
                      <p style={{ fontSize: '10px', color: '#444' }}>
                        Início: {new Date(at.data_inicio + 'T00:00:00').toLocaleDateString('pt-PT')}
                        {at.data_fim ? ` · Fim: ${new Date(at.data_fim + 'T00:00:00').toLocaleDateString('pt-PT')}` : ''}
                      </p>
                    </div>
                    {/* Selector de estado */}
                    <select
                      value={at.estado}
                      onChange={e => alterarEstado(at.id, e.target.value)}
                      style={{
                        background: `${corEstado}15`, border: `1px solid ${corEstado}40`,
                        borderRadius: '8px', padding: '5px 10px',
                        color: corEstado, fontSize: '10px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        outline: 'none', cursor: 'pointer',
                      }}>
                      <option value="ativo">Ativo</option>
                      <option value="pausado">Pausado</option>
                      <option value="concluido">Concluído</option>
                    </select>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Atribuição */}
      {modalAberto && (
        <>
          <div onClick={() => setModalAberto(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            background: '#111', borderTop: '1px solid #1e1e1e',
            borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
            </div>
            <div style={{ padding: '20px 24px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '10px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>
                    Protocolo
                  </p>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', margin: 0 }}>
                    Atribuir a Paciente
                  </h2>
                </div>
                <button onClick={() => setModalAberto(false)}
                  style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1a1a1a', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <form onSubmit={atribuir} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px' }}>
                    Paciente *
                  </label>
                  <select value={clienteId} onChange={e => setClienteId(e.target.value)} required style={inputStyle}>
                    <option value="">Selecionar paciente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px' }}>
                      Data Início *
                    </label>
                    <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px' }}>
                      Data Fim
                    </label>
                    <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px' }}>
                    Notas
                  </label>
                  <textarea value={notas} onChange={e => setNotas(e.target.value)}
                    placeholder="Observações para este paciente..."
                    rows={3} style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: '1.5' }} />
                </div>
                <button type="submit" disabled={saving || !clienteId}
                  style={{
                    width: '100%', background: clienteId ? '#10b981' : '#1a1a1a',
                    color: clienteId ? '#fff' : '#333',
                    border: 'none', borderRadius: '14px', padding: '16px',
                    fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.15em', cursor: clienteId ? 'pointer' : 'not-allowed',
                  }}>
                  {saving ? 'A atribuir...' : 'Atribuir Protocolo'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </main>
  )
}