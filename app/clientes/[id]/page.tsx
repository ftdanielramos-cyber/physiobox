'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

type Cliente = {
  id: string
  nome: string
  email: string
  telefone: string
  data_nasc: string
}

type Ficha = {
  id: string
  historico_medico: string
  patologias: string
  medicacao: string
  observacoes: string
}

export default function ClientePage() {
  const { id } = useParams()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [editandoFicha, setEditandoFicha] = useState(false)
  const [historico, setHistorico] = useState('')
  const [patologias, setPatologias] = useState('')
  const [medicacao, setMedicacao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [sessoes, setSessoes] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => { carregarDados() }, [id])

  async function carregarDados() {
    const { data: c } = await supabase.from('clientes').select('*').eq('id', id).single()
    setCliente(c)
    const { data: f } = await supabase.from('fichas').select('*').eq('cliente_id', id).single()
    if (f) {
      setFicha(f)
      setHistorico(f.historico_medico || '')
      setPatologias(f.patologias || '')
      setMedicacao(f.medicacao || '')
      setObservacoes(f.observacoes || '')
    }
    const { data: s } = await supabase.from('sessoes').select('*').eq('cliente_id', id).order('data', { ascending: false })
    setSessoes(s || [])
  }

  async function guardarFicha(e: React.FormEvent) {
    e.preventDefault()
    const dados = { historico_medico: historico, patologias, medicacao, observacoes, updated_at: new Date().toISOString() }
    if (ficha) {
      await supabase.from('fichas').update(dados).eq('id', ficha.id)
    } else {
      await supabase.from('fichas').insert({ ...dados, cliente_id: id })
    }
    setEditandoFicha(false)
    carregarDados()
  }

  async function apagarSessao(sessaoId: string) {
    if (!confirm('Apagar esta sessão?')) return
    await supabase.from('sessoes').delete().eq('id', sessaoId)
    carregarDados()
  }

  const inputClass = "w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#333] focus:outline-none focus:border-[#3b82f6] resize-none"

  if (!cliente) return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-[#333] text-xs tracking-widest uppercase">A carregar...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <a href="/clientes" className="text-[#3b82f6] text-xs tracking-[0.15em] uppercase">← Clientes</a>

        <div className="border-b border-[#1a1a1a] pb-6 mt-4 mb-6">
          <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight">{cliente.nome}</h1>
          <div className="flex flex-col gap-1 mt-3">
            {cliente.email && <p className="text-[10px] text-[#333] uppercase tracking-wider">{cliente.email}</p>}
            {cliente.telefone && <p className="text-[10px] text-[#333] uppercase tracking-wider">{cliente.telefone}</p>}
            {cliente.data_nasc && <p className="text-[10px] text-[#333] uppercase tracking-wider">{new Date(cliente.data_nasc).toLocaleDateString('pt-PT')}</p>}
          </div>
        </div>

        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[#3b82f6] tracking-[0.15em] uppercase font-bold">Avaliação</p>
            <button onClick={() => setEditandoFicha(!editandoFicha)}
              className="text-[10px] text-[#444] uppercase tracking-widest hover:text-white transition">
              {editandoFicha ? 'Cancelar' : ficha ? 'Editar' : '+ Adicionar'}
            </button>
          </div>
          {editandoFicha ? (
            <form onSubmit={guardarFicha} className="flex flex-col gap-3">
              <textarea value={historico} onChange={e => setHistorico(e.target.value)} placeholder="Histórico Médico" rows={3} className={inputClass} />
              <textarea value={patologias} onChange={e => setPatologias(e.target.value)} placeholder="Patologias" rows={2} className={inputClass} />
              <textarea value={medicacao} onChange={e => setMedicacao(e.target.value)} placeholder="Medicação" rows={2} className={inputClass} />
              <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações" rows={3} className={inputClass} />
              <button type="submit" className="bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-[#1e40af] transition w-fit mt-1">
                Guardar
              </button>
            </form>
          ) : ficha ? (
            <div className="flex flex-col gap-4">
              {ficha.historico_medico && <div><p className="text-[9px] text-[#333] tracking-widest uppercase mb-1">Histórico Médico</p><p className="text-sm text-[#aaa] uppercase tracking-wide">{ficha.historico_medico}</p></div>}
              {ficha.patologias && <div><p className="text-[9px] text-[#333] tracking-widest uppercase mb-1">Patologias</p><p className="text-sm text-[#aaa] uppercase tracking-wide">{ficha.patologias}</p></div>}
              {ficha.medicacao && <div><p className="text-[9px] text-[#333] tracking-widest uppercase mb-1">Medicação</p><p className="text-sm text-[#aaa] uppercase tracking-wide">{ficha.medicacao}</p></div>}
              {ficha.observacoes && <div><p className="text-[9px] text-[#333] tracking-widest uppercase mb-1">Observações</p><p className="text-sm text-[#aaa] uppercase tracking-wide">{ficha.observacoes}</p></div>}
            </div>
          ) : (
            <p className="text-[10px] text-[#333] uppercase tracking-wider">Sem avaliação ainda.</p>
          )}
        </div>

        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[#3b82f6] tracking-[0.15em] uppercase font-bold">Sessões</p>
            <a href={`/clientes/${id}/nova-sessao`} className="text-[10px] text-[#444] uppercase tracking-widest hover:text-white transition">
              + Nova
            </a>
          </div>
          {sessoes.length === 0 ? (
            <p className="text-[10px] text-[#333] uppercase tracking-wider">Sem sessões ainda.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {sessoes.map(s => (
                <div key={s.id} className="flex items-center border-b border-[#161616] last:border-0">
                  <a href={`/clientes/${id}/sessoes/${s.id}`} className="flex-1 py-3">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                      {new Date(s.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    {s.hora && <p className="text-[10px] text-[#333] uppercase tracking-wider mt-0.5">{s.hora.slice(0, 5)}</p>}
                  </a>
                  <button onClick={() => apagarSessao(s.id)} className="text-[#2a2a2a] hover:text-red-500 transition text-xl px-2">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}