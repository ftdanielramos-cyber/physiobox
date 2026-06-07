'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Voltar from '@/components/Voltar'

type Protocolo = {
  id: string
  nome: string
  descricao: string | null
  categoria: string
  exercicios: any[]
  created_at: string
}

const CATEGORIAS = ['Todas', 'Joelho', 'Ombro', 'Coluna', 'Anca', 'Tornozelo', 'Cotovelo', 'Cervical', 'Pós-Cirúrgico', 'Geral']

const COR_CATEGORIA: Record<string, string> = {
  'Joelho': '#3b82f6',
  'Ombro': '#a855f7',
  'Coluna': '#f59e0b',
  'Anca': '#10b981',
  'Tornozelo': '#ef4444',
  'Cotovelo': '#06b6d4',
  'Cervical': '#f97316',
  'Pós-Cirúrgico': '#ec4899',
  'Geral': '#6b7280',
}

export default function ProtocolosPage() {
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas')
  const [pesquisa, setPesquisa] = useState('')
  const supabase = createClient()

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('protocolos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setProtocolos(data || [])
    setLoading(false)
  }

  async function apagar(id: string) {
    if (!confirm('Apagar este protocolo? Esta ação não pode ser desfeita.')) return
    await supabase.from('protocolos').delete().eq('id', id)
    carregar()
  }

  const filtrados = protocolos.filter(p => {
    const matchCat = categoriaAtiva === 'Todas' || p.categoria === categoriaAtiva
    const matchPes = p.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      (p.descricao?.toLowerCase().includes(pesquisa.toLowerCase()) ?? false)
    return matchCat && matchPes
  })

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 110px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Voltar />

        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '10px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>
              Reabilitação
            </p>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1 }}>
              Protocolos
            </h1>
          </div>
          <a href="/protocolos/novo"
            style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: '#10b981', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', textDecoration: 'none', flexShrink: 0,
            }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </a>
        </div>

        {/* Pesquisa */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <svg width="16" height="16" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={pesquisa} onChange={e => setPesquisa(e.target.value)}
            placeholder="Pesquisar protocolos..."
            style={{
              width: '100%', background: '#111', border: '1px solid #1e1e1e',
              borderRadius: '12px', padding: '12px 16px 12px 40px',
              fontSize: '13px', color: '#fff', outline: 'none', letterSpacing: '0.05em',
              boxSizing: 'border-box',
            }} />
        </div>

        {/* Filtros por categoria */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px', scrollbarWidth: 'none' }}>
          {CATEGORIAS.map(cat => {
            const ativa = categoriaAtiva === cat
            const cor = COR_CATEGORIA[cat] || '#6b7280'
            return (
              <button key={cat} onClick={() => setCategoriaAtiva(cat)}
                style={{
                  flexShrink: 0, padding: '6px 14px',
                  background: ativa ? (cat === 'Todas' ? '#3b82f6' : cor) : '#111',
                  border: `1px solid ${ativa ? (cat === 'Todas' ? '#3b82f6' : cor) : '#222'}`,
                  borderRadius: '20px', color: ativa ? '#fff' : '#555',
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {cat}
              </button>
            )
          })}
        </div>

        {/* Lista */}
        {loading ? (
          <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>A carregar...</p>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.3 }}>📋</div>
            <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {pesquisa || categoriaAtiva !== 'Todas' ? 'Nenhum protocolo encontrado.' : 'Ainda sem protocolos. Cria o primeiro!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtrados.map(p => {
              const cor = COR_CATEGORIA[p.categoria] || '#6b7280'
              return (
                <div key={p.id} style={{
                  background: '#111', border: '1px solid #1a1a1a',
                  borderRadius: '16px', overflow: 'hidden',
                  transition: 'border-color 0.15s',
                }}>
                  <a href={`/protocolos/${p.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px', textDecoration: 'none',
                  }}>
                    {/* indicador de categoria */}
                    <div style={{
                      width: '4px', height: '44px', background: cor,
                      borderRadius: '2px', flexShrink: 0, opacity: 0.8,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {p.nome}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.1em', color: cor,
                          background: `${cor}18`, padding: '2px 8px', borderRadius: '10px',
                        }}>
                          {p.categoria}
                        </span>
                        <span style={{ fontSize: '10px', color: '#444', letterSpacing: '0.05em' }}>
                          {p.exercicios?.length ?? 0} exercício{p.exercicios?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {p.descricao && (
                        <p style={{ fontSize: '11px', color: '#555', marginTop: '6px', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.descricao}
                        </p>
                      )}
                    </div>
                    <span style={{ color: '#333', fontSize: '22px' }}>›</span>
                  </a>
                  {/* Ações rápidas */}
                  <div style={{ display: 'flex', borderTop: '1px solid #1a1a1a' }}>
                    <a href={`/protocolos/${p.id}/editar`}
                      style={{
                        flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '6px', color: '#555', fontSize: '10px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none',
                        borderRight: '1px solid #1a1a1a', transition: 'color 0.15s',
                      }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editar
                    </a>
                    <button onClick={() => apagar(p.id)}
                      style={{
                        flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '6px', color: '#555', fontSize: '10px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                      Apagar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}