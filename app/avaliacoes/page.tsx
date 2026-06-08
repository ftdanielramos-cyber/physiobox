'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Voltar from '@/components/Voltar'

type Cliente = { id: string; nome: string }

const MODELOS = [
  {
    id: 1,
    nome: 'Avaliacao Funcional Base',
    tag: 'Qualquer populacao',
    desc: 'Postura, equilibrio, mobilidade e capacidade funcional basica. Indicado para sedentarios, populacao geral e reabilitacao.',
    testes: ['Postura estatica', 'Equilibrio unipodal', 'Sit-to-Stand 30s', 'Sit & Reach', 'Marcha observacional'],
    cor: '#3b82f6',
    corBg: 'rgba(59,130,246,0.08)',
    corBorder: 'rgba(59,130,246,0.2)',
  },
  {
    id: 2,
    nome: 'Avaliacao Funcional Intermedia',
    tag: 'Populacao ativa',
    desc: 'Padrao de movimento, forca e estabilidade. Indicado para pessoas com atividade fisica regular.',
    testes: ['Overhead Squat', 'Single Leg Squat', 'Push-Up Test', 'Plank Estatico', 'Shoulder Mobility (FMS)'],
    cor: '#a855f7',
    corBg: 'rgba(168,85,247,0.08)',
    corBorder: 'rgba(168,85,247,0.2)',
  },
  {
    id: 3,
    nome: 'Avaliacao Funcional Avancada',
    tag: 'Atletas / Treinados',
    desc: 'Performance, potencia e capacidade aerobia. Indicado para atletas e praticantes de desporto regular.',
    testes: ['CMJ Salto Vertical', 'T-Test Agilidade', 'Grip Strength', 'YYIRT Nivel 1', 'VO2max estimado'],
    cor: '#10b981',
    corBg: 'rgba(16,185,129,0.08)',
    corBorder: 'rgba(16,185,129,0.2)',
  },
]

export default function AvaliacoesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [modeloId, setModeloId] = useState<number | null>(null)
  const [pesquisa, setPesquisa] = useState('')
  const [mostrarDropdown, setMostrarDropdown] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('clientes').select('id, nome').order('nome').then(({ data }) => setClientes(data || []))
  }, [])

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(pesquisa.toLowerCase())
  )

  function selecionarCliente(c: Cliente) {
    setClienteId(c.id)
    setClienteNome(c.nome)
    setPesquisa(c.nome)
    setMostrarDropdown(false)
  }

  function avancar() {
    if (!clienteId || !modeloId) return
    router.push(`/avaliacoes/${clienteId}/modelo/${modeloId}`)
  }

  const modeloSelecionado = MODELOS.find(m => m.id === modeloId)

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 100px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Voltar />

        <div style={{ marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px' }}>
          <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>Avaliacao Funcional</p>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Nova Avaliacao</h1>
        </div>

        {/* STEP 1 — Cliente (campo tipo input com dropdown) */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '12px' }}>1 · Cliente</p>
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" fill="none" stroke="#444" strokeWidth="2" viewBox="0 0 24 24"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              value={pesquisa}
              onChange={e => { setPesquisa(e.target.value); setMostrarDropdown(true); if (e.target.value !== clienteNome) { setClienteId(''); setClienteNome('') } }}
              onFocus={() => setMostrarDropdown(true)}
              placeholder="Escreve o nome do cliente..."
              style={{ width: '100%', background: clienteId ? 'rgba(59,130,246,0.06)' : '#0d0d0d', border: clienteId ? '1px solid rgba(59,130,246,0.4)' : '1px solid #1e1e1e', borderRadius: '14px', padding: '14px 16px 14px 42px', fontSize: '14px', color: '#fff', outline: 'none', letterSpacing: '0.05em', boxSizing: 'border-box' as const, transition: 'all 0.15s' }}
            />
            {clienteId && (
              <svg width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="2.5" viewBox="0 0 24 24"
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}

            {/* Dropdown */}
            {mostrarDropdown && pesquisa && !clienteId && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', overflow: 'hidden', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                {clientesFiltrados.length === 0 ? (
                  <p style={{ padding: '14px 16px', fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nenhum cliente encontrado</p>
                ) : clientesFiltrados.map((c, i) => (
                  <button key={c.id} onClick={() => selecionarCliente(c)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', background: 'none', border: 'none', borderTop: i > 0 ? '1px solid #1a1a1a' : 'none', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.nome}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {clienteId && (
            <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px', paddingLeft: '4px' }}>
              ✓ {clienteNome} selecionado
            </p>
          )}
        </div>

        {/* STEP 2 — Modelo */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '12px' }}>2 · Modelo de Avaliacao</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {MODELOS.map(m => (
              <button key={m.id} onClick={() => setModeloId(m.id)}
                style={{ display: 'flex', flexDirection: 'column', background: modeloId === m.id ? m.corBg : '#111', border: modeloId === m.id ? `1px solid ${m.corBorder}` : '1px solid #1a1a1a', borderRadius: '16px', padding: '18px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: modeloId === m.id ? m.corBg : '#1a1a1a', border: `1px solid ${modeloId === m.id ? m.corBorder : '#222'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: modeloId === m.id ? m.cor : '#444' }}>{m.id}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: modeloId === m.id ? m.cor : '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{m.nome}</p>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: modeloId === m.id ? m.cor : '#555', textTransform: 'uppercase', letterSpacing: '0.1em', background: modeloId === m.id ? `${m.cor}18` : '#1a1a1a', padding: '2px 8px', borderRadius: '20px' }}>{m.tag}</span>
                  </div>
                  {modeloId === m.id && <svg width="16" height="16" fill="none" stroke={m.cor} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <p style={{ fontSize: '11px', color: modeloId === m.id ? '#aaa' : '#444', lineHeight: 1.5, marginBottom: '10px' }}>{m.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                  {m.testes.map(t => (
                    <span key={t} style={{ fontSize: '9px', color: modeloId === m.id ? m.cor : '#555', background: modeloId === m.id ? `${m.cor}12` : '#1a1a1a', border: `1px solid ${modeloId === m.id ? `${m.cor}30` : '#222'}`, borderRadius: '6px', padding: '3px 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={avancar} disabled={!clienteId || !modeloId}
          style={{ width: '100%', background: clienteId && modeloId ? (modeloSelecionado?.cor || '#3b82f6') : '#1a1a1a', color: clienteId && modeloId ? '#fff' : '#333', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: clienteId && modeloId ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
          {clienteId && modeloId ? `Iniciar ${modeloSelecionado?.nome}` : 'Seleciona Cliente e Modelo'}
        </button>
      </div>
    </main>
  )
}