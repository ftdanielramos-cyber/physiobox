'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Voltar from '@/components/Voltar'

type Teste = {
  id: string
  nome: string
  descricao: string
  tipo: 'score' | 'texto' | 'bilateral'
}

const MODELOS: Record<number, { nome: string; cor: string; testes: Teste[] }> = {
  1: {
    nome: 'Modelo 1',
    cor: '#3b82f6',
    testes: [
      { id: 't1', nome: 'Teste 1', descricao: 'A definir', tipo: 'score' },
      { id: 't2', nome: 'Teste 2', descricao: 'A definir', tipo: 'score' },
      { id: 't3', nome: 'Teste 3', descricao: 'A definir', tipo: 'bilateral' },
      { id: 't4', nome: 'Teste 4', descricao: 'A definir', tipo: 'score' },
      { id: 't5', nome: 'Teste 5', descricao: 'A definir', tipo: 'texto' },
    ],
  },
  2: {
    nome: 'Modelo 2',
    cor: '#a855f7',
    testes: [
      { id: 't1', nome: 'Teste 1', descricao: 'A definir', tipo: 'score' },
      { id: 't2', nome: 'Teste 2', descricao: 'A definir', tipo: 'score' },
      { id: 't3', nome: 'Teste 3', descricao: 'A definir', tipo: 'bilateral' },
      { id: 't4', nome: 'Teste 4', descricao: 'A definir', tipo: 'score' },
      { id: 't5', nome: 'Teste 5', descricao: 'A definir', tipo: 'texto' },
    ],
  },
  3: {
    nome: 'Modelo 3',
    cor: '#10b981',
    testes: [
      { id: 't1', nome: 'Teste 1', descricao: 'A definir', tipo: 'score' },
      { id: 't2', nome: 'Teste 2', descricao: 'A definir', tipo: 'score' },
      { id: 't3', nome: 'Teste 3', descricao: 'A definir', tipo: 'bilateral' },
      { id: 't4', nome: 'Teste 4', descricao: 'A definir', tipo: 'score' },
      { id: 't5', nome: 'Teste 5', descricao: 'A definir', tipo: 'texto' },
    ],
  },
}

const SCORES = [0, 1, 2, 3]
const SCORE_LABELS: Record<number, string> = { 0: 'Não Realiza', 1: 'Fraco', 2: 'Bom', 3: 'Excelente' }
const SCORE_CORES: Record<number, string> = { 0: '#ef4444', 1: '#f97316', 2: '#eab308', 3: '#22c55e' }

export default function AvaliacaoModeloPage() {
  const { clienteId, modeloId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const modelo = MODELOS[Number(modeloId)]

  const [cliente, setCliente] = useState<{ nome: string } | null>(null)
  const [respostas, setRespostas] = useState<Record<string, any>>({})
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [testeAtivo, setTesteAtivo] = useState(0)

  useEffect(() => {
    supabase.from('clientes').select('nome').eq('id', clienteId).single().then(({ data }) => setCliente(data))
  }, [clienteId])

  if (!modelo) return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase' }}>Modelo não encontrado.</p>
    </main>
  )

  const testes = modelo.testes
  const cor = modelo.cor
  const progresso = Math.round((Object.keys(respostas).length / testes.length) * 100)

  function setScore(testeId: string, valor: number) {
    setRespostas(prev => ({ ...prev, [testeId]: valor }))
  }

  function setBilateral(testeId: string, lado: 'esquerdo' | 'direito', valor: number) {
    setRespostas(prev => ({
      ...prev,
      [testeId]: { ...(prev[testeId] || {}), [lado]: valor }
    }))
  }

  function setTexto(testeId: string, valor: string) {
    setRespostas(prev => ({ ...prev, [testeId]: valor }))
  }

  async function guardarAvaliacao() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('avaliacoes').insert({
      cliente_id: clienteId,
      fisio_id: user?.id,
      modelo: Number(modeloId),
      respostas,
      notas: notas || null,
      data: new Date().toISOString().split('T')[0],
    })
    setLoading(false)
    router.push(`/clientes/${clienteId}`)
  }

  const inputStyle = { width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#fff', outline: 'none', resize: 'none' as const, letterSpacing: '0.05em' }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 120px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Voltar />

        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: cor, textTransform: 'uppercase', letterSpacing: '0.15em', background: `${cor}15`, border: `1px solid ${cor}30`, padding: '3px 10px', borderRadius: '6px' }}>
              {modelo.nome}
            </span>
            <span style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Avaliação Funcional
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
            {cliente?.nome || '...'}
          </h1>
        </div>

        {/* Barra de progresso */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progresso</span>
            <span style={{ fontSize: '9px', color: cor, fontWeight: 700 }}>{progresso}%</span>
          </div>
          <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${progresso}%`, background: cor, borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Tabs dos testes */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {testes.map((t, i) => {
            const feito = respostas[t.id] !== undefined
            return (
              <button key={t.id} onClick={() => setTesteAtivo(i)}
                style={{
                  flexShrink: 0, padding: '8px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
                  background: testeAtivo === i ? cor : feito ? '#1a1a1a' : '#0d0d0d',
                  border: testeAtivo === i ? `1px solid ${cor}` : feito ? `1px solid ${cor}40` : '1px solid #1e1e1e',
                  color: testeAtivo === i ? '#fff' : feito ? cor : '#444',
                  transition: 'all 0.15s',
                }}>
                {feito && testeAtivo !== i ? '✓ ' : ''}{i + 1}
              </button>
            )
          })}
        </div>

        {/* Teste ativo */}
        {testes.map((teste, i) => {
          if (i !== testeAtivo) return null
          return (
            <div key={teste.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <p style={{ fontSize: '9px', color: cor, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '6px' }}>
                Teste {i + 1} de {testes.length}
              </p>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>
                {teste.nome}
              </h2>
              <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px' }}>
                {teste.descricao}
              </p>

              {/* Score simples */}
              {teste.tipo === 'score' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {SCORES.map(s => (
                    <button key={s} onClick={() => setScore(teste.id, s)}
                      style={{
                        flex: 1, padding: '14px 4px', borderRadius: '12px', border: 'none',
                        cursor: 'pointer', fontWeight: 800, fontSize: '18px',
                        background: respostas[teste.id] === s ? SCORE_CORES[s] : '#1a1a1a',
                        color: respostas[teste.id] === s ? '#fff' : '#333',
                        transform: respostas[teste.id] === s ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.15s',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {teste.tipo === 'score' && respostas[teste.id] !== undefined && (
                <p style={{ fontSize: '10px', color: SCORE_CORES[respostas[teste.id]], textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '10px', fontWeight: 700 }}>
                  {SCORE_LABELS[respostas[teste.id]]}
                </p>
              )}

              {/* Bilateral */}
              {teste.tipo === 'bilateral' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(['esquerdo', 'direito'] as const).map(lado => (
                    <div key={lado}>
                      <p style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>{lado}</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {SCORES.map(s => (
                          <button key={s} onClick={() => setBilateral(teste.id, lado, s)}
                            style={{
                              flex: 1, padding: '12px 4px', borderRadius: '10px', border: 'none',
                              cursor: 'pointer', fontWeight: 800, fontSize: '16px',
                              background: respostas[teste.id]?.[lado] === s ? SCORE_CORES[s] : '#1a1a1a',
                              color: respostas[teste.id]?.[lado] === s ? '#fff' : '#333',
                              transform: respostas[teste.id]?.[lado] === s ? 'scale(1.05)' : 'scale(1)',
                              transition: 'all 0.15s',
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Texto */}
              {teste.tipo === 'texto' && (
                <textarea
                  value={respostas[teste.id] || ''}
                  onChange={e => setTexto(teste.id, e.target.value)}
                  placeholder="Observações..."
                  rows={4}
                  style={inputStyle}
                />
              )}

              {/* Navegação entre testes */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                {i > 0 && (
                  <button onClick={() => setTesteAtivo(i - 1)}
                    style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                    ← Anterior
                  </button>
                )}
                {i < testes.length - 1 && (
                  <button onClick={() => setTesteAtivo(i + 1)}
                    style={{ flex: 1, background: cor, color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                    Próximo →
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Notas gerais */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <p style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px' }}>Notas Gerais</p>
          <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observações finais..." rows={3} style={inputStyle} />
        </div>
      </div>

      {/* Botão fixo guardar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', background: 'linear-gradient(to top, #0a0a0a 60%, transparent)', zIndex: 30 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={guardarAvaliacao} disabled={loading || progresso < 100}
            style={{
              width: '100%',
              background: progresso === 100 ? cor : '#1a1a1a',
              color: progresso === 100 ? '#fff' : '#333',
              border: 'none', borderRadius: '14px', padding: '16px',
              fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.2em', cursor: progresso === 100 ? 'pointer' : 'not-allowed',
            }}>
            {loading ? 'A guardar...' : progresso < 100 ? `Completa todos os testes (${progresso}%)` : 'Guardar Avaliação'}
          </button>
        </div>
      </div>
    </main>
  )
}