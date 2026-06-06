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

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    const { data } = await supabase.from('clientes').select('*').order('nome')
    setClientes(data || [])
    setLoading(false)
  }

  async function adicionarCliente(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('clientes').insert({
      nome, email, telefone, data_nasc: dataNasc || null,
      created_by: user?.id
    })
    setNome(''); setEmail(''); setTelefone(''); setDataNasc('')
    setMostrarForm(false)
    carregarClientes()
  }

  async function apagarCliente(clienteId: string) {
    if (!confirm('Tens a certeza? Todos os dados do cliente serão apagados.')) return
    await supabase.from('clientes').delete().eq('id', clienteId)
    carregarClientes()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</a>
            <h1 className="text-2xl font-semibold text-gray-800 mt-1">Clientes</h1>
          </div>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            + Novo cliente
          </button>
        </div>
        {mostrarForm && (
          <form onSubmit={adicionarCliente} className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex flex-col gap-4">
            <h2 className="font-medium text-gray-800">Novo cliente</h2>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" required
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Telefone"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={dataNasc} onChange={e => setDataNasc(e.target.value)} type="date"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Guardar
              </button>
              <button type="button" onClick={() => setMostrarForm(false)} className="text-gray-500 px-4 py-2 rounded-xl text-sm hover:bg-gray-100 transition">
                Cancelar
              </button>
            </div>
          </form>
        )}
        {loading ? (
          <p className="text-gray-400 text-sm">A carregar...</p>
        ) : clientes.length === 0 ? (
          <p className="text-gray-400 text-sm">Ainda não tens clientes.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {clientes.map(c => (
              <div key={c.id} className="bg-white rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition flex items-center justify-between">
                <a href={`/clientes/${c.id}`} className="flex-1">
                  <p className="font-medium text-gray-800">{c.nome}</p>
                  <p className="text-sm text-gray-400">{c.telefone || c.email || '—'}</p>
                </a>
                <button onClick={() => apagarCliente(c.id)}
                  className="text-gray-300 hover:text-red-400 transition ml-4 text-xl leading-none">
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