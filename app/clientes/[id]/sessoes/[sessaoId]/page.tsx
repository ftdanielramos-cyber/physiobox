'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

type Set = {
  id?: string
  numero: number
  repeticoes: string
  carga: string
}

type Registo = {
  id: string
  tipo: string
  nome_exercicio: string
  descricao: string
  bilateral: boolean
  lado: string
  notas: string
  sets?: SetDB[]
}

type SetDB = {
  id: string
  numero: number
  repeticoes: number
  carga: number
}

export default function SessaoPage() {
  const { id, sessaoId } = useParams()
  const [registos, setRegistos] = useState<Registo[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [tipo, setTipo] = useState<'exercicio' | 'intervencao'>('exercicio')
  const [nomeExercicio, setNomeExercicio] = useState('')
  const [descricao, setDescricao] = useState('')
  const [bilateral, setBilateral] = useState(true)
  const [lado, setLado] = useState('esquerdo')
  const [notas, setNotas] = useState('')
  const [sets, setSets] = useState<Set[]>([{ numero: 1, repeticoes: '', carga: '' }])
  const supabase = createClient()

  useEffect(() => {
    carregarRegistos()
  }, [sessaoId])

  async function carregarRegistos() {
    const { data } = await supabase
      .from('registos')
      .select('*, sets(id, numero, repeticoes, carga)')
      .eq('sessao_id', sessaoId)
      .order('ordem')

    setRegistos((data as any) || [])
  }

  function adicionarSet() {
    setSets([...sets, { numero: sets.length + 1, repeticoes: '', carga: '' }])
  }

  function removerSet(index: number) {
    if (sets.length === 1) return
    const novos = sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, numero: i + 1 }))
    setSets(novos)
  }

  function atualizarSet(index: number, campo: 'repeticoes' | 'carga', valor: string) {
    const novos = [...sets]
    novos[index][campo] = valor
    setSets(novos)
  }

  async function adicionarRegisto(e: React.FormEvent) {
    e.preventDefault()

    try {
      const dadosParaInserir: any = {
        sessao_id: sessaoId,
        tipo,
        nome_exercicio: tipo === 'exercicio' ? nomeExercicio : null,
        descricao: tipo === 'intervencao' ? descricao : null,
        bilateral: tipo === 'exercicio' ? bilateral : null,
        lado: tipo === 'exercicio' && !bilateral ? lado : null,
        notas: notas || null
      }

      if (registos) {
        dadosParaInserir.ordem = registos.length
      }

      const { data: registo, error: erroRegisto } = await supabase
        .from('registos')
        .insert(dadosParaInserir)
        .select()

      if (erroRegisto) {
        console.error("Erro ao inserir no Supabase (registos):", erroRegisto.message)
        alert("Erro ao guardar o registo: " + erroRegisto.message.toUpperCase())
        return
      }

      if (registo && registo.length > 0 && tipo === 'exercicio') {
        const registoCriado = registo[0]
        
        const setsParaInserir = sets.map(s => ({
          registo_id: registoCriado.id,
          numero: s.numero,
          repeticoes: s.repeticoes ? parseInt(s.repeticoes) : null,
          carga: s.carga ? parseFloat(s.carga) : null,
        }))

        const { error: erroSets } = await supabase
          .from('sets')
          .insert(setsParaInserir)

        if (erroSets) {
          console.error("Erro ao inserir os sets no Supabase:", erroSets.message)
          alert("Registo guardado, mas erro nas séries: " + erroSets.message.toUpperCase())
        }
      }

      setNomeExercicio('')
      setDescricao('')
      setBilateral(true)
      setLado('esquerdo')
      setNotas('')
      setSets([{ numero: 1, repeticoes: '', carga: '' }])
      setMostrarForm(false)
      carregarRegistos()

    } catch (err) {
      console.error("Erro inesperado na aplicação:", err)
    }
  }

  async function apagarRegisto(registoId: string) {
    await supabase.from('registos').delete().eq('id', registoId)
    carregarRegistos()
  }

  async function fecharEGravarSessao() {
    try {
      // Redireciona com segurança sem tentar atualizar colunas inexistentes no Supabase
      window.location.href = `/clientes/${id}`
    } catch (err) {
      console.error("Erro inesperado ao fechar sessão:", err)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black font-sans uppercase tracking-wider">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <a href={`/clientes/${id}`} className="text-sm font-bold text-black hover:opacity-70 transition block mb-4">
          ← Cliente
        </a>
        
        <div className="flex items-center justify-between mt-1 mb-6 border-b-2 border-black pb-2">
          <h1 className="text-3xl font-black text-black tracking-tighter italic">Sessão</h1>
          <button 
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition"
          >
            {mostrarForm ? 'Cancelar' : '+ Adicionar'}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={adicionarRegisto} className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm mb-6 flex flex-col gap-4">
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setTipo('exercicio')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition border-2 ${tipo === 'exercicio' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
              >
                Exercício
              </button>
              <button 
                type="button" 
                onClick={() => setTipo('intervencao')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition border-2 ${tipo === 'intervencao' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
              >
                Intervenção
              </button>
            </div>

            {tipo === 'exercicio' ? (
              <>
                <input 
                  value={nomeExercicio} 
                  onChange={e => setNomeExercicio(e.target.value)}
                  placeholder="Nome do exercício" 
                  required
                  className="bg-white border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black uppercase w-full" 
                />

                <div>
                  <label className="text-xs font-black text-black mb-2 block">Lateralidade</label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => { setBilateral(true); setLado('') }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border-2 ${bilateral ? 'bg-black text-white border-black' : 'bg-white text-black border-black/20'}`}
                    >
                      Bilateral
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setBilateral(false); setLado('esquerdo') }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border-2 ${!bilateral && lado === 'esquerdo' ? 'bg-black text-white border-black' : 'bg-white text-black border-black/20'}`}
                    >
                      Esquerdo
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setBilateral(false); setLado('direito') }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border-2 ${!bilateral && lado === 'direito' ? 'bg-black text-white border-black' : 'bg-white text-black border-black/20'}`}
                    >
                      Direito
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-black">Séries</label>
                    <button 
                      type="button" 
                      onClick={adicionarSet}
                      className="text-xs font-black text-black underline hover:opacity-70"
                    >
                      + Adicionar série
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2 mb-1">
                      <span className="text-xs font-black text-black text-center">Série</span>
                      <span className="text-xs font-black text-black text-center">Reps</span>
                      <span className="text-xs font-black text-black text-center">Carga (kg)</span>
                    </div>
                    {sets.map((s, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-black w-6 text-center">{s.numero}</span>
                          <button 
                            type="button" 
                            onClick={() => removerSet(i)}
                            className="text-black hover:text-red-600 transition font-black text-lg"
                          >
                            ×
                          </button>
                        </div>
                        <input 
                          type="number" 
                          value={s.repeticoes} 
                          onChange={e => atualizarSet(i, 'repeticoes', e.target.value)}
                          placeholder="10"
                          className="bg-white border-2 border-black rounded-xl px-3 py-2 text-sm font-bold text-black text-center focus:outline-none focus:ring-2 focus:ring-black uppercase w-full" 
                        />
                        <input 
                          type="number" 
                          step="0.5" 
                          value={s.carga} 
                          onChange={e => atualizarSet(i, 'carga', e.target.value)}
                          placeholder="0"
                          className="bg-white border-2 border-black rounded-xl px-3 py-2 text-sm font-bold text-black text-center focus:outline-none focus:ring-2 focus:ring-black uppercase w-full" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <textarea 
                value={descricao} 
                onChange={e => setDescricao(e.target.value)}
                placeholder="Descrição da intervenção" 
                rows={3} 
                required
                className="bg-white border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black resize-none uppercase w-full" 
              />
            )}

            <textarea 
              value={notas} 
              onChange={e => setNotas(e.target.value)}
              placeholder="Notes adicionais (opcional)" 
              rows={2}
              className="bg-white border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black resize-none uppercase w-full" 
            />

            <div className="flex gap-2 mt-2">
              <button 
                type="submit" 
                className="bg-black text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition shadow-md"
              >
                Guardar
              </button>
              <button 
                type="button" 
                onClick={() => setMostrarForm(false)} 
                className="text-black border-2 border-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* LISTA DE REGISTOS JÁ GRAVADOS */}
        <div className="flex flex-col gap-4">
          {registos.length === 0 ? (
            <p className="text-center text-sm font-bold text-neutral-400 py-8">Nenhum registo adicionado a esta sessão.</p>
          ) : (
            registos.map((registo) => (
              <div key={registo.id} className="bg-white border-2 border-black rounded-2xl p-5 shadow-sm flex flex-col gap-3 relative">
                <button 
                  onClick={() => apagarRegisto(registo.id)} 
                  className="absolute top-4 right-4 text-xs font-black text-black hover:text-red-600 transition underline"
                >
                  Apagar
                </button>
                
                <div>
                  <span className="text-[10px] px-2 py-1 rounded-md font-black bg-black text-white uppercase tracking-widest">
                    {registo.tipo === 'exercicio' ? 'Exercício' : 'Intervenção'}
                  </span>
                  <h3 className="text-xl font-black text-black tracking-tight mt-2.5 italic">
                    {registo.tipo === 'exercicio' ? registo.nome_exercicio : 'Intervenção Clínica'}
                  </h3>
                  {registo.tipo === 'exercicio' && (
                    <span className="text-xs font-bold text-neutral-400 block mt-0.5">
                      {registo.bilateral ? 'Bilateral' : `Lado ${registo.lado}`}
                    </span>
                  )}
                </div>

                {registo.tipo === 'intervencao' && registo.descricao && (
                  <p className="text-sm font-bold text-black bg-white p-3 rounded-xl border-2 border-black">{registo.descricao}</p>
                )}

                {registo.tipo === 'exercicio' && registo.sets && registo.sets.length > 0 && (
                  <div className="border-t-2 border-black pt-3 mt-1">
                    <div className="flex flex-col gap-1.5">
                      {registo.sets.map((set) => (
                        <div key={set.id} className="flex items-center justify-between text-sm text-black bg-white border border-black/10 px-4 py-2 rounded-xl">
                          <span className="font-bold text-neutral-400">Série {set.numero}</span>
                          <span className="font-black text-black">{set.repeticoes} reps × {set.carga || 0} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {registo.notas && (
                  <div className="text-xs font-bold text-black italic mt-1">
                    <strong>Notas:</strong> {registo.notas}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* BOTÃO PARA GRAVAR E FINALIZAR A SESSÃO */}
        <div className="mt-10 pt-6 border-t-2 border-black">
          <button
            onClick={fecharEGravarSessao}
            className="w-full bg-black text-white px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-neutral-800 transition shadow-md flex items-center justify-center gap-2"
          >
            💾 Gravar e Finalizar Sessão
          </button>
        </div>

      </div>
    </main>
  )
}