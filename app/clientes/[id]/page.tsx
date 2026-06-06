'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

type Cliente = {
  id: string
  nome: string
  email: string
  telefone: string
  data_nasc: string
}

export default function ClientePage() {
  const params = useParams()
  const supabase = createClient()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    carregarCliente()
  }, [])

  async function carregarCliente() {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', params.id)
      .single()

    setCliente(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-[#555] text-xs uppercase tracking-widest">
          A carregar...
        </p>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-[#555] text-xs uppercase tracking-widest">
          Cliente não encontrado
        </p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* HEADER */}
        <div className="mb-6">
          <a
            href="/clientes"
            className="text-[#555] hover:text-white text-xs uppercase tracking-widest"
          >
            ← Clientes
          </a>

          <h1 className="text-2xl font-bold uppercase mt-3">
            {cliente.nome}
          </h1>

          <p className="text-xs text-[#666] uppercase tracking-widest mt-1">
            Ficha de cliente
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-3 border-b border-[#1a1a1a] mb-6">
          {['overview', 'contacto', 'treinos', 'progresso'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`
                px-3 py-2 text-xs uppercase tracking-widest transition
                ${tab === t
                  ? 'text-white border-b border-white'
                  : 'text-[#555] hover:text-white'
                }
              `}
            >
              {t}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-3">
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
              <p className="text-xs text-[#666] uppercase">
                Resumo
              </p>

              <p className="text-sm mt-2 text-[#ccc]">
                Cliente registado no sistema. Sem dados de treino ainda.
              </p>
            </div>
          </div>
        )}

        {/* CONTACTO (OCULTO POR DEFAULT) */}
        {tab === 'contacto' && (
          <div className="space-y-3">
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
              <p className="text-xs text-[#666] uppercase">Email</p>
              <p className="text-sm mt-1">{cliente.email || '—'}</p>

              <p className="text-xs text-[#666] uppercase mt-4">Telefone</p>
              <p className="text-sm mt-1">{cliente.telefone || '—'}</p>

              <p className="text-xs text-[#666] uppercase mt-4">Nascimento</p>
              <p className="text-sm mt-1">{cliente.data_nasc || '—'}</p>
            </div>

            <p className="text-xs text-[#555] uppercase tracking-widest">
              Informação privada
            </p>
          </div>
        )}

        {/* TREINOS */}
        {tab === 'treinos' && (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 text-sm text-[#666]">
            Ainda não existem treinos para este cliente.
          </div>
        )}

        {/* PROGRESSO */}
        {tab === 'progresso' && (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 text-sm text-[#666]">
            Sem dados de progresso ainda.
          </div>
        )}

      </div>
    </main>
  )
}