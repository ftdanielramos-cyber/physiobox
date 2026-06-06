'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

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
  const supabase = createClient()

  useEffect(() => { carregarClientes() }, [])

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
    if (!confirm('Tens a certeza? Todos os dados do cliente serão apagados.')) return
    await supabase.from('clientes').delete().eq('id', clienteId)
    carregarClientes()
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.email?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.telefone?.includes(pesquisa)
  )

  const inputClass = "w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#444] focus:outline-none focus:border-[#3b82f6]"

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="flex items-end justify-between mb-6 border-b border-[#1a1a1a] pb-6">
          <div>
            <a href="/dashboard" className="text-[#3b82f6] text-xs tracking-[0.15em] uppercase font-bold">← Dashboard</a>
            <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mt-2">Clientes</h1>
          </div>
          <button onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-[#1e40af] transition">
            + Novo
          </button>
        </div>

        {/* PESQUISA */}
        <div className="relative mb-4">
          <svg width="16" height="16" fill="none" stroke="#444" strokeWidth="2" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={pesquisa} onChange={e => setPesquisa(e.target.value)}
            placeholder="Pesquisar cliente..."
            style={{ paddingLeft: '40px' }}
            className="w-full bg-[#111] border border-[#1a1a1a] rounded-lg px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#444] focus:outline-none focus:border-[#3b82f6]" />
        </div>

        {/* FORM */}
        {mostrarForm && (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 mb-6">
            <p className="text-xs text-[#3b82f6] uppercase tracking-[0.15em] font-bold mb-4">Novo Cliente</p>
            <form onSubmit={adicionarCliente} className="flex flex-col gap-3">
              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome Completo" required className={inputClass} />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className={inputClass} />
              <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Telefone" className={inputClass} />
              <input value={dataNasc} onChange={e => setDataNasc(e.target.value)} type="date" className={inputClass} />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-[#1e40af] transition">
                  Guardar
                </button>
                <button type="button" onClick={() => setMostrarForm(false)} className="text-[#444] text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg hover:text-white transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTA */}
        {loading ? (
          <p className="text-[#333] text-xs uppercase tracking-widest">A carregar...</p>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-[#333] text-xs uppercase tracking-widest">{pesquisa ? 'Nenhum cliente encontrado.' : 'Sem clientes ainda.'}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {clientesFiltrados.map(c => (
              <div key={c.id} className="group flex items-center bg-[#111] border border-[#1a1a1a] rounded-xl hover:border-[#2a2a2a] transition">
                <a href={`/clientes/${c.id}`} className="flex items-center gap-3 flex-1 min-w-0 px-4 py-4">
                  <div className="w-11 h-11 rounded-xl bg-[#1d4ed8] flex items-center justify-center text-sm font-extrabold text-white uppercase shrink-0">
                    {c.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wider truncate text-white">{c.nome}</p>
                    <p className="text-[10px] text-[#444] uppercase tracking-wider mt-1 truncate">
                      {c.telefone || c.email || 'Sem contacto'}
                    </p>
                  </div>
                </a>
                <button onClick={() => apagarCliente(c.id)}
                  className="text-[#2a2a2a] hover:text-red-500 transition text-xl px-4">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}