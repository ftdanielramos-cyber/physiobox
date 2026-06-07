'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/useTranslation'
import Voltar from '@/components/Voltar'

type Cliente = { id: string; nome: string }

export default function AvaliacoesPage() {
  const { t } = useTranslation()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState('')
  const [modeloId, setModeloId] = useState<number | null>(null)
  const [pesquisa, setPesquisa] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const MODELOS = [
    { id: 1, nome: `${t.model} 1`, descricao: t.baseAssessment, cor: '#3b82f6', corBg: 'rgba(59,130,246,0.08)', corBorder: 'rgba(59,130,246,0.2)' },
    { id: 2, nome: `${t.model} 2`, descricao: t.intermediateAssessment, cor: '#a855f7', corBg: 'rgba(168,85,247,0.08)', corBorder: 'rgba(168,85,247,0.2)' },
    { id: 3, nome: `${t.model} 3`, descricao: t.advancedAssessment, cor: '#10b981', corBg: 'rgba(16,185,129,0.08)', corBorder: 'rgba(16,185,129,0.2)' },
  ]

  useEffect(() => {
    supabase.from('clientes').select('id, nome').order('nome').then(({ data }) => setClientes(data || []))
  }, [])

  const clientesFiltrados = clientes.filter(c => c.nome.toLowerCase().includes(pesquisa.toLowerCase()))

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
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
            {t.newAssessmentTitle}
          </h1>
          <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
            {t.functionalAssessment}
          </p>
        </div>

        {/* STEP 1 */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '12px' }}>
            {t.selectClient}
          </p>
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <svg width="14" height="14" fill="none" stroke="#444" strokeWidth="2" viewBox="0 0 24 24"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={pesquisa} onChange={e => setPesquisa(e.target.value)}
              placeholder={t.searchClient}
              style={{ width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '12px 16px 12px 40px', fontSize: '13px', color: '#fff', outline: 'none', letterSpacing: '0.05em' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
            {clientesFiltrados.map(c => (
              <button key={c.id} onClick={() => setClienteId(c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: clienteId === c.id ? 'rgba(59,130,246,0.1)' : '#111', border: clienteId === c.id ? '1px solid rgba(59,130,246,0.4)' : '1px solid #1a1a1a', borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: clienteId === c.id ? '#3b82f6' : '#222', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: clienteId === c.id ? '#fff' : '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.nome}</span>
                {clienteId === c.id && (
                  <svg width="14" height="14" fill="none" stroke="#3b82f6" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
            {clientesFiltrados.length === 0 && (
              <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 0' }}>{t.noClientFound}</p>
            )}
          </div>
        </div>

        {/* STEP 2 */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '12px' }}>
            {t.chooseModel}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MODELOS.map(m => (
              <button key={m.id} onClick={() => setModeloId(m.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', background: modeloId === m.id ? m.corBg : '#111', border: modeloId === m.id ? `1px solid ${m.corBorder}` : '1px solid #1a1a1a', borderRadius: '14px', padding: '18px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: modeloId === m.id ? m.corBg : '#1a1a1a', border: `1px solid ${modeloId === m.id ? m.corBorder : '#222'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: modeloId === m.id ? m.cor : '#444' }}>{m.id}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: modeloId === m.id ? m.cor : '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{m.nome}</p>
                  <p style={{ fontSize: '10px', color: modeloId === m.id ? m.cor : '#333', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>{m.descricao}</p>
                </div>
                {modeloId === m.id && (
                  <svg width="16" height="16" fill="none" stroke={m.cor} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <button onClick={avancar} disabled={!clienteId || !modeloId}
          style={{ width: '100%', background: clienteId && modeloId ? (modeloSelecionado?.cor || '#3b82f6') : '#1a1a1a', color: clienteId && modeloId ? '#fff' : '#333', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: clienteId && modeloId ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
          {clienteId && modeloId ? `${t.startModel} ${modeloSelecionado?.nome}` : t.selectClientAndModel}
        </button>
      </div>
    </main>
  )
}