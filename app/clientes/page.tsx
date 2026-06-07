'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useTranslation } from '@/lib/useTranslation'
import Voltar from '@/components/Voltar'

type Cliente = {
  id: string
  nome: string
  email: string
  telefone: string
  data_nasc: string
}

function formatarNome(nome: string): { apelido: string; proprio: string } {
  if (!nome) return { apelido: '', proprio: '' }
  const partes = nome.trim().split(' ')
  if (partes.length === 1) return { apelido: partes[0].toUpperCase(), proprio: '' }
  const proprio = partes[0]
  const apelido = partes.slice(1).join(' ').toUpperCase()
  return { apelido, proprio }
}

function Iniciais({ nome }: { nome: string }) {
  const partes = nome.trim().split(' ')
  const ini = partes.length >= 2
    ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
    : nome[0].toUpperCase()
  const cores = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']
  const cor = cores[nome.charCodeAt(0) % cores.length]
  return (
    <div style={{
      width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
      background: `${cor}18`, border: `1px solid ${cor}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: 800, color: cor, letterSpacing: '0.05em',
    }}>
      {ini}
    </div>
  )
}

export default function ClientesPage() {
  const { t } = useTranslation()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [pesquisa, setPesquisa] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const supabase = createClient()

  useEffect(() => { carregarClientes() }, [])

  async function carregarClientes() {
    const { data } = await supabase.from('clientes').select('*').order('nome')
    setClientes(data || [])
    setLoading(false)
  }

  function iniciarEdicao(c: Cliente) {
    setEditandoId(c.id); setNome(c.nome || ''); setEmail(c.email || '')
    setTelefone(c.telefone || ''); setDataNasc(c.data_nasc || ''); setMostrarForm(true)
  }

  function cancelarForm() {
    setMostrarForm(false); setEditandoId(null)
    setNome(''); setEmail(''); setTelefone(''); setDataNasc('')
  }

  async function guardarCliente(e: React.FormEvent) {
    e.preventDefault()
    if (editandoId) {
      const { error } = await supabase.from('clientes').update({ nome, email: email || null, telefone: telefone || null, data_nasc: dataNasc || null }).eq('id', editandoId)
      if (error) { alert(t.error + ': ' + error.message); return }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { error } = await supabase.from('clientes').insert({ nome, email: email || null, telefone: telefone || null, data_nasc: dataNasc || null, created_by: user.id })
      if (error) { alert(t.error + ': ' + error.message); return }
    }
    cancelarForm(); carregarClientes()
  }

  async function apagarCliente(clienteId: string) {
    if (!confirm(t.deleteClientConfirm)) return
    await supabase.from('clientes').delete().eq('id', clienteId)
    carregarClientes()
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.email?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.telefone?.includes(pesquisa)
  )

  const inputClass = "w-full bg-[#0d0d0d] border border-[#222] rounded-xl px-4 py-3 text-sm text-white tracking-wide placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#3b82f6] transition-colors"
  const labelClass = "block text-[10px] font-semibold text-[#555] uppercase tracking-[0.12em] mb-1.5"

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Voltar />

        <div className="flex items-center justify-between mb-6 border-b border-[#1a1a1a] pb-6">
          <div>
            <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>{t.clientsTitle}</p>
            <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight">{clientes.length} {t.clients.toLowerCase()}</h1>
          </div>
          <button onClick={() => { setEditandoId(null); setMostrarForm(true) }}
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1d4ed8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0, boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Pesquisa */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <svg width="15" height="15" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={pesquisa} onChange={e => setPesquisa(e.target.value)}
            placeholder={t.searchClients}
            style={{
              width: '100%', background: '#111', border: '1px solid #1e1e1e',
              borderRadius: '40px', padding: '13px 20px 13px 46px',
              fontSize: '13px', color: '#fff', outline: 'none', letterSpacing: '0.05em',
              boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
            onBlur={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
          />
          {pesquisa && (
            <button onClick={() => setPesquisa('')}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Lista */}
        {loading ? (
          <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.loading}</p>
        ) : clientesFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{pesquisa ? t.noResults : t.noClients}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {clientesFiltrados.map((c, i) => {
              const { apelido, proprio } = formatarNome(c.nome)
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center',
                  background: '#111',
                  border: '1px solid #1a1a1a',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s, transform 0.15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
                >
                  <a href={`/clientes/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0, padding: '14px 16px', textDecoration: 'none' }}>
                    {/* Iniciais coloridas */}
                    <Iniciais nome={c.nome} />

                    {/* Nome formatado */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {apelido}
                        </span>
                        {proprio && (
                          <>
                            <span style={{ fontSize: '12px', color: '#444', fontWeight: 400 }}>,</span>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#888', letterSpacing: '0.03em' }}>
                              {proprio}
                            </span>
                          </>
                        )}
                      </div>
                      {c.email && (
                        <p style={{ fontSize: '10px', color: '#333', marginTop: '2px', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.email}
                        </p>
                      )}
                    </div>

                    <svg width="16" height="16" fill="none" stroke="#2a2a2a" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </a>

                  {/* Acções */}
                  <div style={{ display: 'flex', borderLeft: '1px solid #1a1a1a' }}>
                    <button onClick={() => iniciarEdicao(c)}
                      style={{ width: '44px', height: '100%', minHeight: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#333', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#6366f1')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => apagarCliente(c.id)}
                      style={{ width: '44px', height: '100%', minHeight: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#333', transition: 'color 0.15s', borderLeft: '1px solid #1a1a1a' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {mostrarForm && (
        <div onClick={cancelarForm}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
      )}

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        transform: mostrarForm ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        background: '#111', borderTop: '1px solid #1e1e1e',
        borderRadius: '28px 28px 0 0', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
        </div>
        <div style={{ padding: '20px 24px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
            <div>
              <p style={{ fontSize: '10px', color: editandoId ? '#a855f7' : '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>
                {editandoId ? t.editRecord : t.newRecord}
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                {editandoId ? t.editClient : t.addClient}
              </h2>
            </div>
            <button onClick={cancelarForm}
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1a1a1a', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <form onSubmit={guardarCliente} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className={labelClass}>{t.fullName} *</label>
              <input value={nome} onChange={e => setNome(e.target.value)} required className={inputClass} placeholder="Ex: Daniel Ramos" />
            </div>
            <div>
              <label className={labelClass}>{t.email}</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email@exemplo.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t.phone}</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t.birthDate}</label>
              <input value={dataNasc} onChange={e => setDataNasc(e.target.value)} type="date" className={inputClass} />
            </div>
            <div style={{ height: '1px', background: '#1a1a1a', margin: '4px 0' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit"
                style={{ flex: 1, background: editandoId ? '#7c3aed' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '40px', padding: '14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = editandoId ? '#6d28d9' : '#1e40af')}
                onMouseLeave={e => (e.currentTarget.style.background = editandoId ? '#7c3aed' : '#1d4ed8')}>
                {editandoId ? t.updateClient : t.saveClient}
              </button>
              <button type="button" onClick={cancelarForm}
                style={{ padding: '14px 20px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '40px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', cursor: 'pointer' }}>
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}