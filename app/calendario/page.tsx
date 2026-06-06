'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Agendamento = {
  id: string
  string
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

  useEffect(() => { carregarAgendamentos() }, [mesAtual])
  useEffect(() => { carregarClientes() }, [])

  async function carregarClientes() {
    const { data } = await supabase.from('clientes').select('id, nome').order('nome')
    setClientes(data || [])
  }

  async function carregarAgendamentos() {
    const inicio = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).toISOString().split('T')[0]
    const fim = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).toISOString().split('T')[0]
    const { data } = await supabase.from('agendamentos').select('*, clientes(nome)').gte('data', inicio).lte('data', fim).order('hora_inicio')
    setAgendamentos((data as any) || [])
  }

  async function criarAgendamento(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { { user } } = await supabase.auth.getUser()
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(diaSelected).padStart(2, '0')}`
    await supabase.from('agendamentos').insert({
      cliente_id: clienteId || null,
      fisio_id: user?.id,
      dataStr,
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

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const agendamentosDiaSelected = diaSelected ? agendamentosNoDia(diaSelected) : []
  const dataSelectedStr = diaSelected ? new Date(mesAtual.getFullYear(), mesAtual.getMonth(), diaSelected).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }) : ''

  const inputClass = "w-full bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#666] focus:outline-none focus:border-[#3b82f6]"

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-[#3b82f6] text-xs tracking-[0.15em] uppercase">← Dashboard</a>
        <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mt-2 mb-8">Calendário</h1>

        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))}
              className="text-[#888] hover:text-white transition text-2xl px-2">‹</button>
            <p className="text-sm font-bold text-white uppercase tracking-[0.15em]">
              {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
            </p>
            <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))}
              className="text-[#888] hover:text-white transition text-2xl px-2">›</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {diasSemana.map(d => (
              <div key={d} className="text-center text-[9px] text-[#666] tracking-widest uppercase py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: primeiroDiaSemana() }).map((_, i) => <div key={`v-${i}`} />)}
            {Array.from({ length: diasNoMes() }).map((_, i) => {
              const dia = i + 1
              const temAg = agendamentosNoDia(dia).length > 0
              const hoje = new Date()
              const isHoje = hoje.getDate() === dia && hoje.getMonth() === mesAtual.getMonth() && hoje.getFullYear() === mesAtual.getFullYear()
              const isSelected = diaSelected === dia

              return (
                <button key={dia} onClick={() => { setDiaSelected(dia); setMostrarForm(false) }}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold uppercase tracking-wider transition
                    ${isSelected ? 'bg-[#3b82f6] text-white' : isHoje ? 'bg-[#1a1a1a] text-[#3b82f6]' : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'}`}>
                  <span>{dia}</span>
                  {temAg && <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-[#3b82f6]'}`} />}
                </button>
              )
            })}
          </div>
        </div>

        {diaSelected && (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[#3b82f6] tracking-[0.15em] uppercase font-bold capitalize">{dataSelectedStr}</p>
              <button onClick={() => setMostrarForm(!mostrarForm)}
                className="bg-[#3b82f6] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl hover:bg-[#1d4ed8] transition">
                + Agendar
              </button>
            </div>

            {mostrarForm && (
              <form onSubmit={criarAgendamento} className="flex flex-col gap-3 mb-4 pb-4 border-b border-[#1a1a1a]">
                <select value={clienteId} onChange={e => setClienteId(e.target.value)} className={inputClass}>
                  <option value="">Sem Cliente Associado</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] text-[#666] tracking-widest uppercase mb-2">Hora Início</p>
                    <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <p className="text-[9px] text-[#666] tracking-widest uppercase mb-2">Hora Fim</p>
                    <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <input value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Tipo de Sessão" className={inputClass} />
                <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Notas" rows={2} className={`${inputClass} resize-none`} />
                <div className="flex gap-2">
                  <button type="submit" disabled={loading}
                    className="bg-[#3b82f6] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-[#1d4ed8] transition disabled:opacity-50">
                    Guardar
                  </button>
                  <button type="button" onClick={() => setMostrarForm(false)}
                    className="text-[#888] text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:text-white transition">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {agendamentosDiaSelected.length === 0 ? (
              <p className="text-[10px] text-[#666] uppercase tracking-wider">Sem agendamentos.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {agendamentosDiaSelected.map(a => (
                  <div key={a.id} className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-0.5 bg-[#3b82f6] rounded-full self-stretch" />
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{a.clientes?.nome || 'Sem Cliente'}</p>
                        {(a.hora_inicio || a.hora_fim) && (
                          <p className="text-[10px] text-[#666] uppercase tracking-wider mt-1">
                            {a.hora_inicio?.slice(0, 5)}{a.hora_fim ? ` → ${a.hora_fim.slice(0, 5)}` : ''}
                          </p>
                        )}
                        {a.tipo && <p className="text-[10px] text-[#666] uppercase tracking-wider">{a.tipo}</p>}
                        {a.notas && <p className="text-[10px] text-[#666] uppercase tracking-wider">{a.notas}</p>}
                      </div>
                    </div>
                    <button onClick={() => apagarAgendamento(a.id)} className="text-[#888] hover:text-red-500 transition text-xl ml-4">×</button>
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