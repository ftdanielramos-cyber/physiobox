'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Sessao = {
  id: string
  data: string
  hora: string
  notas: string
  clientes: { nome: string }
}

export default function CalendarioPage() {
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [mesAtual, setMesAtual] = useState(new Date())
  const supabase = createClient()

  useEffect(() => {
    carregarSessoes()
  }, [mesAtual])

  async function carregarSessoes() {
    const inicio = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).toISOString().split('T')[0]
    const fim = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('sessoes')
      .select('id, data, hora, notas, clientes(nome)')
      .gte('data', inicio)
      .lte('data', fim)
      .order('data')

    setSessoes((data as any) || [])
  }

  function diasNoMes() {
    return new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate()
  }

  function primeiroDiaSemana() {
    const d = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay()
    return d === 0 ? 6 : d - 1
  }

  function sessoesNoDia(dia: number) {
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return sessoes.filter(s => s.data === dataStr)
  }

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

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
              const sessoesHoje = sessoesNoDia(dia)
              const hoje = new Date()
              const isHoje = hoje.getDate() === dia &&
                hoje.getMonth() === mesAtual.getMonth() &&
                hoje.getFullYear() === mesAtual.getFullYear()

              return (
                <div key={dia} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm relative
                  ${isHoje ? 'bg-blue-600 text-white font-medium' : 'hover:bg-gray-50'}`}>
                  <span>{dia}</span>
                  {sessoesHoje.length > 0 && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isHoje ? 'bg-white' : 'bg-blue-500'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-medium text-gray-700 text-sm">Sessões este mês</h2>
          {sessoes.length === 0 ? (
            <p className="text-sm text-gray-400">Sem sessões este mês.</p>
          ) : (
            sessoes.map(s => (
              <div key={s.id} className="bg-white rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{s.clientes?.nome}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(s.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {s.hora && ` · ${s.hora.slice(0, 5)}`}
                  </p>
                </div>
                <span className="text-gray-300">→</span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}