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

  useEffect(() => {
    carregarDados()
  }, [id])

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

  if (!cliente) return <p className="p-8 text-gray-400">A carregar...</p>

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <a href="/clientes" className="text-sm text-gray-400 hover:text-gray-600">← Clientes</a>

        <div className="bg-white rounded-2xl p-6 shadow-sm mt-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{cliente.nome}</h1>
          <div className="mt-3 flex flex-col gap-1">
            {cliente.email && <p className="text-sm text-gray-500">📧 {cliente.email}</p>}
            {cliente.telefone && <p className="text-sm text-gray-500">📞 {cliente.telefone}</p>}
            {cliente.data_nasc && <p className="text-sm text-gray-500">🎂 {new Date(cliente.data_nasc).toLocaleDateString('pt-PT')}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-800">Ficha clínica</h2>
            <button onClick={() => setEditandoFicha(!editandoFicha)}
              className="text-sm text-blue-600 hover:text-blue-700">
              {editandoFicha ? 'Cancelar' : ficha ? 'Editar' : '+ Adicionar'}
            </button>
          </div>

          {editandoFicha ? (
            <form onSubmit={guardarFicha} className="flex flex-col gap-3">
              <textarea value={historico} onChange={e => setHistorico(e.target.value)}
                placeholder="Histórico médico" rows={3}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <textarea value={patologias} onChange={e => setPatologias(e.target.value)}
                placeholder="Patologias" rows={2}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <textarea value={medicacao} onChange={e => setMedicacao(e.target.value)}
                placeholder="Medicação" rows={2}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)}
                placeholder="Observações livres" rows={3}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition w-fit">
                Guardar
              </button>
            </form>
          ) : ficha ? (
            <div className="flex flex-col gap-3">
              {ficha.historico_medico && <div><p className="text-xs text-gray-400 mb-1">Histórico médico</p><p className="text-sm text-gray-700">{ficha.historico_medico}</p></div>}
              {ficha.patologias && <div><p className="text-xs text-gray-400 mb-1">Patologias</p><p className="text-sm text-gray-700">{ficha.patologias}</p></div>}
              {ficha.medicacao && <div><p className="text-xs text-gray-400 mb-1">Medicação</p><p className="text-sm text-gray-700">{ficha.medicacao}</p></div>}
              {ficha.observacoes && <div><p className="text-xs text-gray-400 mb-1">Observações</p><p className="text-sm text-gray-700">{ficha.observacoes}</p></div>}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sem ficha clínica ainda.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-800">Sessões</h2>
            <a href={`/clientes/${id}/nova-sessao`} className="text-sm text-blue-600 hover:text-blue-700">
              + Nova sessão
            </a>
          </div>
          {sessoes.length === 0 ? (
            <p className="text-sm text-gray-400">Sem sessões ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sessoes.map(s => (
                <a key={s.id} href={`/clientes/${id}/sessoes/${s.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(s.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    {s.hora && <p className="text-xs text-gray-400">{s.hora.slice(0, 5)}</p>}
                  </div>
                  <span className="text-gray-300">→</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}