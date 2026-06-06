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
    await supabase.from('clientes').insert({ nome, email, telefone, data_nasc: dataNasc || null, created_by: user?.id })
    setNome(''); setEmail(''); setTelefone(''); setDataNasc('')
    setMostrarForm(false)
    carregarClientes()
  }

  async function apagarCliente(clienteId: string) {
    if (!confirm('Tens a certeza? Todos os dados do cliente serão apagados.')) return
    await supabase.from('clientes').delete().eq('id', clienteId)
    carregarClientes()
  }

  const inputClass = "w-full bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#333] focus:outline-none focus:border-[#3b82f6]"

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="flex items-end justify-between mb-8 border-b border-[#1a1a1a] pb-6">
          <div>
            <a href="/dashboard" className="text-[#3b82f6] text-xs tracking-[0.15em] uppercase">← Dashboard</a>
            <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mt-2">Clientes</h1>
          </div>
          <button onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-[#1e40af] transition">
            + Novo
          </button>
        </div>

        {mostrarForm && (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 mb-6">
            <p className="text-xs text-[#3b82f6] tracking-[0.15em] uppercase mb-4">Novo Cliente</p>
            <form onSubmit={adicionarCliente} className="flex flex-col gap-3">
              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome Completo" required className={inputClass} />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className={inputClass} />
              <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Telefone" className={inputClass} />
              <input value={dataNasc} onChange={e => setDataNasc(e.target.value)} type="date" className={inputClass} />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-[#1e40af] transition">
                  Guardar
                </button>
                <button type="button" onClick={() => setMostrarForm(false)} className="text-[#444] text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:text-white transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-[#333] text-xs tracking-widest uppercase">A carregar...</p>
        ) : clientes.length === 0 ? (
          <p className="text-[#333] text-xs tracking-widest uppercase">Sem clientes ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {clientes.map(c => (
              <div key={c.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl flex items-center hover:border-[#2a2a2a] transition">
                <a href={`/clientes/${c.id}`} className="flex-1 px-5 py-4">
                  <p className="text-sm font-bold text-white uppercase tracking-wider">{c.nome}</p>
                  <p className="text-[10px] text-[#333] uppercase tracking-wider mt-1">{c.telefone || c.email || '—'}</p>
                </a>
                <button onClick={() => apagarCliente(c.id)} className="px-4 text-[#2a2a2a] hover:text-red-500 transition text-xl">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}