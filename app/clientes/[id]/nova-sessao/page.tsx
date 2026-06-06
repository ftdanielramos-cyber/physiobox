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

    if (sessao) {
      window.location.href = `/clientes/${id}/sessoes/${sessao.id}`
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white text-black font-sans uppercase tracking-wider">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <a href={`/clientes/${id}`} className="text-sm font-bold text-black hover:opacity-70 transition block mb-4">
          ← Cliente
        </a>
        
        <h1 className="text-3xl font-black text-black tracking-tighter italic mb-6">
          Nova sessão
        </h1>

        <form onSubmit={criarSessao} className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <label className="text-xs font-black text-black mb-1 block">Data</label>
            <input 
              type="date" 
              value={data} 
              onChange={e => setData(e.target.value)} 
              required
              className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black uppercase" 
            />
          </div>
          
          <div>
            <label className="text-xs font-black text-black mb-1 block">Hora</label>
            <input 
              type="time" 
              value={hora} 
              onChange={e => setHora(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black uppercase" 
            />
          </div>
          
          <div>
            <label className="text-xs font-black text-black mb-1 block">Notas gerais</label>
            <textarea 
              value={notas} 
              onChange={e => setNotas(e.target.value)} 
              rows={3}
              placeholder="Observações sobre a sessão..."
              className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black resize-none uppercase" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-black text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-neutral-800 transition disabled:opacity-50 shadow-md mt-2"
          >
            {loading ? 'A criar...' : 'Criar sessão'}
          </button>
        </form>
      </div>
    </main>
  )
}