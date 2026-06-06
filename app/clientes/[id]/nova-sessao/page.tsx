'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function NovaSessaoPage() {
  const { id } = useParams()
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function criarSessao(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: sessao } = await supabase.from('sessoes').insert({
      cliente_id: id,
      fisio_id: user?.id,
      data,
      hora: hora || null,
      notas: notas || null
    }).select().single()
    if (sessao) window.location.href = `/clientes/${id}/sessoes/${sessao.id}`
    setLoading(false)
  }

  const inputClass = "w-full bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#333] focus:outline-none focus:border-[#3b82f6]"

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <a href={`/clientes/${id}`} className="text-[#3b82f6] text-xs tracking-[0.15em] uppercase">← Cliente</a>
        <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mt-2 mb-8">Nova Sessão</h1>

        <form onSubmit={criarSessao} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 flex flex-col gap-4">
          <div>
            <p className="text-[9px] text-[#333] tracking-widest uppercase mb-2">Data</p>
            <input type="date" value={data} onChange={e => setData(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <p className="text-[9px] text-[#333] tracking-widest uppercase mb-2">Hora</p>
            <input type="time" value={hora} onChange={e => setHora(e.target.value)} className={inputClass} />
          </div>
          <div>
            <p className="text-[9px] text-[#333] tracking-widest uppercase mb-2">Notas</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3}
              placeholder="Observações gerais..."
              className={`${inputClass} resize-none`} />
          </div>
          <button type="submit" disabled={loading}
            className="bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-[#1e40af] transition disabled:opacity-50 mt-2">
            {loading ? 'A criar...' : 'Criar Sessão'}
          </button>
        </form>
      </div>
    </main>
  )
}