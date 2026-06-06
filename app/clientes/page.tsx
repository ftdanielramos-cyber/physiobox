'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')

    setClientes(data || [])
    setLoading(false)
  }

  async function adicionarCliente(e: React.FormEvent) {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('clientes').insert({
      nome,
      email,
      telefone,
      data_nasc: dataNasc || null,
      created_by: user?.id
    })

    setNome('')
    setEmail('')
    setTelefone('')
    setDataNasc('')
    setMostrarForm(false)

    carregarClientes()
  }

  async function apagarCliente(clienteId: string) {
    if (!confirm('Tens a certeza?')) return

    await supabase
      .from('clientes')
      .delete()
      .eq('id', clienteId)

    carregarClientes()
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* HEADER */}
        <div className="flex items-end justify-between mb-8 border-b border-[#1a1a1a] pb-6">
          <div>
            <Link
              href="/dashboard"
              className="text-[#666] hover:text-white text-xs tracking-[0.15em] uppercase transition"
            >
              ← Dashboard
            </Link>

            <h1 className="text-3xl font-bold mt-2 uppercase tracking-tight">
              Clientes
            </h1>
          </div>

          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-white text-black text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-[#e5e5e5] transition"
          >
            + Novo
          </button>
        </div>

        {/* FORM */}
        {mostrarForm && (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 mb-6">
            <p className="text-xs text-[#666] uppercase tracking-widest mb-4">
              Novo Cliente
            </p>

            <form onSubmit={adicionarCliente} className="flex flex-col gap-3">
              <input
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Nome"
                required
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-white/30"
              />

              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-white/30"
              />

              <input
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="Telefone"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-white/30"
              />

              <input
                value={dataNasc}
                onChange={e => setDataNasc(e.target.value)}
                type="date"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
              />

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-white text-black text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-[#e5e5e5] transition"
                >
                  Guardar
                </button>

                <button
                  type="button"
                  onClick={() => setMostrarForm(false)}
                  className="text-[#666] text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:text-white transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LIST */}
        {loading ? (
          <p className="text-[#555] text-xs uppercase tracking-widest">
            A carregar...
          </p>
        ) : clientes.length === 0 ? (
          <p className="text-[#555] text-xs uppercase tracking-widest">
            Sem clientes ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {clientes.map(c => (
              <div
                key={c.id}
                className="
                  group flex items-center justify-between
                  bg-[#111] border border-[#1a1a1a]
                  rounded-xl px-4 py-4
                  hover:bg-[#141414] hover:border-[#2a2a2a]
                  transition
                "
              >
                <Link
                  href={`/clientes/${c.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xs font-bold text-white">
                    {c.nome?.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-wider truncate">
                      {c.nome}
                    </p>

                    <p className="text-[11px] text-[#666] uppercase tracking-wider mt-1 truncate">
                      {c.telefone || c.email || 'Sem contacto'}
                    </p>
                  </div>
                </Link>

                <div className="text-[#444] group-hover:text-white transition">
                  →
                </div>

                <button
                  onClick={() => apagarCliente(c.id)}
                  className="ml-4 text-[#444] hover:text-red-500 transition text-xl"
                >
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