'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Agendamento = {
  id: string
  data: string
  hora_inicio: string
  hora_fim: string
  tipo: string
  notas: string
  clientes: { nome: string } | null
}

type Cliente = {
  id: string
  nome: string
}

export default function CalendarioPage() {
  const [mesAtual, setMesAtual] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [diaSelected, setDiaSelected] = useState<number | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [tipo, setTipo] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    carregarAgendamentos()
  }, [mesAtual])

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    const { data } = await supabase.from('clientes').select('id, nome').order('nome')
    setClientes(data || [])
  }

  async function carregarAgendamentos() {
    const inicio = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).toISOString().split('T')[0]
    const fim = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).toISOString().split('T')[0]
    const { data } = await supabase
      .from('agendamentos')
      .select('*, clientes(nome)')
      .gte('data', inicio)
      .lte('data', fim)
      .order('hora_inicio')
    setAgendamentos((data as any) || [])
  }

  async function criarAgendamento(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(diaSelected).padStart(2, '0')}`
    await supabase.from('agendamentos').insert({
      cliente_id: clienteId || null,
      fisio_id: user?.id,
      data: dataStr,
      hora_inicio: horaInicio || null,
      hora_fim: horaFim || null,
      tipo: tipo || null,
      notas: notas || null,
    })
    setClienteId(''); setHoraInicio(''); setHoraFim(''); setTipo(''); setNotas('')
    setMostrarForm(false)
    setLoading(false)
    carregarAgendamentos()
  }

  async function apagarAgendamento(id: string) {
    if (!confirm('Apagar este agendamento?')) return
    await supabase.from('agendamentos').delete().eq('id', id)
    carregarAgendamentos()
  }

  function agendamentosNoDia(dia: number) {
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return agendamentos.filter(a => a.data === dataStr)
  }

  function diasNoMes() {
    return new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate()
  }

  function primeiroDiaSemana() {
    const d = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay()
    return d === 0 ? 6 : d - 1
  }

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  const agendamentosDiaSelected = diaSelected ? agendamentosNoDia(diaSelected) : []
  const dataSelectedStr = diaSelected
    ? new Date(mesAtual.getFullYear(), mesAtual.getMonth(), diaSelected)
        .toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</a>
        <h1 className="text-2xl font-semibold text-gray-800 mt-1 mb-6">Calendário</h1>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))}
              className="text-gray-400 hover:text-gray-600 text-xl px-2">‹</button>
            <h2 className="font-medium text-gray-800">
              {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
            </h2>
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))}
              className="text-gray-400 hover:text-gray-600 text-xl px-2">›</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {diasSemana.map(d => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: primeiroDiaSemana() }).map((_, i) => (
              <div key={`vazio-${i}`} />
            ))}
            {Array.from({ length: diasNoMes() }).map((_, i) => {
              const dia = i + 1
              const temAgendamentos = agendamentosNoDia(dia).length > 0
              const hoje = new Date()
              const isHoje = hoje.getDate() === dia && hoje.getMonth() === mesAtual.getMonth() && hoje.getFullYear() === mesAtual.getFullYear()
              const isSelected = diaSelected === dia

              return (
                <button key={dia} onClick={() => { setDiaSelected(dia); setMostrarForm(false) }}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition
                    ${isSelected ? 'bg-blue-600 text-white' : isHoje ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                  <span>{dia}</span>
                  {temAgendamentos && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {diaSelected && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-800 capitalize">{dataSelectedStr}</h2>
              <button onClick={() => setMostrarForm(!mostrarForm)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                + Agendar
              </button>
            </div>

            {mostrarForm && (
              <form onSubmit={criarAgendamento} className="flex flex-col gap-3 mb-4 pb-4 border-b border-gray-100">
                <select value={clienteId} onChange={e => setClienteId(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Sem cliente associado</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Hora início</label>
                    <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Hora fim</label>
                    <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <input value={tipo} onChange={e => setTipo(e.target.value)}
                  placeholder="Tipo de sessão (ex: Reabilitação, Avaliação...)"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea value={notas} onChange={e => setNotas(e.target.value)}
                  placeholder="Notas (opcional)" rows={2}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                <div className="flex gap-2">
                  <button type="submit" disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                    Guardar
                  </button>
                  <button type="button" onClick={() => setMostrarForm(false)}
                    className="text-gray-500 px-4 py-2 rounded-xl text-sm hover:bg-gray-100 transition">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {agendamentosDiaSelected.length === 0 ? (
              <p className="text-sm text-gray-400">Sem agendamentos para este dia.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {agendamentosDiaSelected.map(a => (
                  <div key={a.id} className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-1 bg-blue-500 rounded-full self-stretch" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {a.clientes?.nome || 'Sem cliente'}
                        </p>
                        {(a.hora_inicio || a.hora_fim) && (
                          <p className="text-xs text-gray-400">
                            {a.hora_inicio?.slice(0, 5)}{a.hora_fim ? ` → ${a.hora_fim.slice(0, 5)}` : ''}
                          </p>
                        )}
                        {a.tipo && <p className="text-xs text-gray-400">{a.tipo}</p>}
                        {a.notas && <p className="text-xs text-gray-400 italic">{a.notas}</p>}
                      </div>
                    </div>
                    <button onClick={() => apagarAgendamento(a.id)}
                      className="text-gray-300 hover:text-red-400 transition text-xl leading-none ml-4">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}