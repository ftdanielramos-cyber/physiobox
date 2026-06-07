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
    <main style={{ minHeight: '100vh', background: '#030305', display: 'flex', flexDirection: 'column', padding: '40px 16px 100px', fontFamily: "'Space Mono', monospace", overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        .grid-bg-av {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMoveAv 20s linear infinite;
        }
        @keyframes gridMoveAv { 0% { transform: translateY(0); } 100% { transform: translateY(60px); } }
        .scanline-av {
          position: fixed; left: 0; right: 0; height: 2px; pointer-events: none; z-index: 0;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.25), transparent);
          animation: scanAv 8s linear infinite;
        }
        @keyframes scanAv { 0% { top: -2px; opacity: 0; } 5% { opacity: 1; } 95% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .pulse-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid;
          animation: ringPulse 3s ease-in-out infinite;
        }
        @keyframes ringPulse { 0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.4; } 50% { transform: translate(-50%,-50%) scale(1.08); opacity: 0.8; } }
        .badge-blink { animation: badgeBlink 2s ease-in-out infinite; }
        @keyframes badgeBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .em-breve-title {
          font-family: 'Bebas Neue', sans-serif;
          animation: fadeUpAv 0.8s ease 0.3s both;
        }
        @keyframes fadeUpAv { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="grid-bg-av" />
      <div className="scanline-av" />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <Voltar />

        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '1px solid #1a1a2a', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: cor, textTransform: 'uppercase', letterSpacing: '0.15em', background: `${cor}15`, border: `1px solid ${cor}30`, padding: '3px 10px', borderRadius: '6px' }}>
              {modelo.nome}
            </span>
            <span style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Avaliação Funcional
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', fontFamily: 'inherit' }}>
            {cliente?.nome || '...'}
          </h1>
        </div>

        {/* EM BREVE */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '40px', textAlign: 'center', position: 'relative' }}>

          {/* Anéis pulsantes */}
          <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '40px' }}>
            {[160, 120, 80].map((size, i) => (
              <div key={i} className="pulse-ring" style={{
                width: size, height: size,
                top: '50%', left: '50%',
                borderColor: `${cor}${i === 0 ? '15' : i === 1 ? '25' : '40'}`,
                animationDelay: `${i * 0.4}s`,
              }} />
            ))}
            {/* Ícone central */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '56px', height: '56px', borderRadius: '16px',
              background: `${cor}15`, border: `1px solid ${cor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="26" height="26" fill="none" stroke={cor} strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
          </div>

          <div className="badge-blink" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: cor, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '16px', border: `1px solid ${cor}30`, padding: '5px 14px', borderRadius: '2px', background: `${cor}08` }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: cor }} />
            Em Desenvolvimento
          </div>

          <h2 className="em-breve-title" style={{ fontSize: 'clamp(48px, 12vw, 72px)', color: '#fff', lineHeight: 0.9, letterSpacing: '-1px', marginBottom: '16px' }}>
            Em Breve
          </h2>

          <p style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '40px', maxWidth: '260px', lineHeight: 1.8 }}>
            Os testes do {modelo.nome} estão a ser configurados
          </p>

          {/* Linha decorativa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '280px', marginBottom: '40px' }}>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${cor}30)` }} />
            <span style={{ fontSize: '9px', color: '#2a2a3a', textTransform: 'uppercase', letterSpacing: '0.2em' }}>5 testes</span>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${cor}30)` }} />
          </div>

          {/* Testes placeholder */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0d0d0d', border: '1px solid #111', borderRadius: '10px', padding: '14px 16px', opacity: 0.4 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: `1px solid ${cor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: cor }}>{n}</span>
                </div>
                <div style={{ flex: 1, height: '8px', background: '#1a1a1a', borderRadius: '4px' }} />
                <div style={{ width: '40px', height: '8px', background: '#1a1a1a', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        </div>


      </div>
    </main>
  )
}