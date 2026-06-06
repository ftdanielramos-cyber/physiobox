'use client'
 
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Voltar from '@/components/Voltar'
 
type Cliente = {
  id: string
  nome: string
  email: string
  telefone: string
  data_nasc: string
}
 
export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [pesquisa, setPesquisa] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [dropdownAberto, setDropdownAberto] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
 
  useEffect(() => { carregarClientes() }, [])
 
  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAberto(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
 
  async function carregarClientes() {
    const { data } = await supabase.from('clientes').select('*').order('nome')
    setClientes(data || [])
    setLoading(false)
  }
 
  async function adicionarCliente(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Sessão expirada. Faz login outra vez.')
      window.location.href = '/login'
      return
    }
    const { error } = await supabase.from('clientes').insert({
      nome, email: email || null, telefone: telefone || null,
      data_nasc: dataNasc || null, created_by: user.id
    })
    if (error) {
      alert('Erro ao guardar: ' + error.message)
      return
    }
    setNome(''); setEmail(''); setTelefone(''); setDataNasc('')
    setMostrarForm(false)
    carregarClientes()
  }
 
  async function apagarCliente(clienteId: string) {
    setDropdownAberto(null)
    if (!confirm('Tens a certeza? Todos os dados do cliente serão apagados.')) return
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
          <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight">Clientes</h1>
          <button
            onClick={() => setMostrarForm(true)}
            style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: '#1d4ed8',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', transition: 'background 0.15s', flexShrink: 0
            }}
            aria-label="Novo cliente">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
 
        {/* PESQUISA */}
        <div className="relative mb-4">
          <svg width="15" height="15" fill="none" stroke="#444" strokeWidth="2" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={pesquisa} onChange={e => setPesquisa(e.target.value)}
            placeholder="Pesquisar cliente..."
            style={{ paddingLeft: '40px' }}
            className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-white tracking-wider placeholder:text-[#444] focus:outline-none focus:border-[#3b82f6] transition-colors" />
        </div>
 
        {/* LISTA */}
        {loading ? (
          <p className="text-[#333] text-xs uppercase tracking-widest">A carregar...</p>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-[#333] text-xs uppercase tracking-widest">{pesquisa ? 'Nenhum cliente encontrado.' : 'Sem clientes ainda.'}</p>
        ) : (
          <div className="flex flex-col gap-2" ref={dropdownRef}>
            {clientesFiltrados.map(c => (
              <div key={c.id} className="relative group flex items-center bg-[#111] border border-[#1a1a1a] rounded-xl hover:border-[#252525] transition-colors">
                <a href={`/clientes/${c.id}`} className="flex items-center gap-3 flex-1 min-w-0 px-4 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wider truncate text-white">{c.nome}</p>
                  </div>
                </a>
 
                {/* CHEVRON + DROPDOWN */}
                <div className="relative px-3">
                  <button
                    onClick={() => setDropdownAberto(dropdownAberto === c.id ? null : c.id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-[#444] hover:text-white hover:bg-[#1a1a1a] transition-all"
                    aria-label="Opções">
                    <svg
                      width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"
                      style={{ transform: dropdownAberto === c.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
 
                  {dropdownAberto === c.id && (
                    <div
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 50,
                        background: '#161616', border: '1px solid #222', borderRadius: '12px',
                        padding: '6px', minWidth: '140px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        animation: 'fadeIn 0.12s ease'
                      }}>
                      <a
                        href={`/clientes/${c.id}`}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-[#aaa] hover:text-white hover:bg-[#1e1e1e] rounded-lg transition-colors uppercase tracking-wider"
                        onClick={() => setDropdownAberto(null)}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Abrir
                      </a>
                      <div style={{ height: '1px', background: '#1e1e1e', margin: '4px 0' }} />
                      <button
                        onClick={() => apagarCliente(c.id)}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-[#aaa] hover:text-red-400 hover:bg-[#1e1e1e] rounded-lg transition-colors uppercase tracking-wider">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
 
      {/* SLIDE-IN PANEL — Novo Cliente */}
      {/* Backdrop */}
      {mostrarForm && (
        <div
          onClick={() => setMostrarForm(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', zIndex: 40,
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}
 
      {/* Panel */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        transform: mostrarForm ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        background: '#111',
        borderTop: '1px solid #1e1e1e',
        borderRadius: '20px 20px 0 0',
        padding: '0',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
        </div>
 
        <div style={{ padding: '20px 24px 40px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
            <div>
              <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>
                Novo Registo
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                Adicionar Cliente
              </h2>
            </div>
            <button
              onClick={() => setMostrarForm(false)}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#1a1a1a', border: '1px solid #222',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#555', transition: 'all 0.15s'
              }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
 
          {/* Form */}
          <form onSubmit={adicionarCliente} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className={labelClass}>Nome Completo *</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Ex: João Silva" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@exemplo.com" type="email" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)}
                placeholder="+351 900 000 000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Data de Nascimento</label>
              <input value={dataNasc} onChange={e => setDataNasc(e.target.value)}
                type="date" className={inputClass} />
            </div>
 
            {/* Divider */}
            <div style={{ height: '1px', background: '#1a1a1a', margin: '4px 0' }} />
 
            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  flex: 1, background: '#1d4ed8', color: '#fff',
                  border: 'none', borderRadius: '12px', padding: '14px',
                  fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1e40af')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1d4ed8')}>
                Guardar Cliente
              </button>
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                style={{
                  padding: '14px 20px', background: '#1a1a1a',
                  border: '1px solid #222', borderRadius: '12px',
                  fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: '#555', cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#333' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#222' }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
 
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </main>
  )
}
 