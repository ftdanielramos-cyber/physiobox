'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Voltar from '@/components/Voltar'

type Set = {
  id?: string
  numero: number
  repeticoes: string
  carga: string
}

type SetDB = {
  id: string
  numero: number
  repeticoes: number
  carga: number
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

  useEffect(() => { carregarRegistos() }, [sessaoId])

  async function carregarRegistos() {
    const { data } = await supabase.from('registos').select('*, sets(id, numero, repeticoes, carga)').eq('sessao_id', sessaoId).order('ordem')
    setRegistos((data as any) || [])
  }

  function adicionarSet() {
    setSets([...sets, { numero: sets.length + 1, repeticoes: '', carga: '' }])
  }

  function removerSet(index: number) {
    if (sets.length === 1) return
    setSets(sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, numero: i + 1 })))
  }

  function atualizarSet(index: number, campo: 'repeticoes' | 'carga', valor: string) {
    const novos = [...sets]
    novos[index][campo] = valor
    setSets(novos)
  }

  async function adicionarRegisto(e: React.FormEvent) {
    e.preventDefault()
    const { data: registo } = await supabase.from('registos').insert({
      sessao_id: sessaoId,
      tipo,
      nome_exercicio: tipo === 'exercicio' ? nomeExercicio : null,
      descricao: tipo === 'intervencao' ? descricao : null,
      bilateral: tipo === 'exercicio' ? bilateral : null,
      lado: tipo === 'exercicio' && !bilateral ? lado : null,
      notas: notas || null,
      ordem: registos.length
    }).select().single()

    if (registo && tipo === 'exercicio') {
      await supabase.from('sets').insert(
        sets.map(s => ({
          registo_id: registo.id,
          numero: s.numero,
          repeticoes: s.repeticoes ? parseInt(s.repeticoes) : null,
          carga: s.carga ? parseFloat(s.carga) : null,
        }))
      )
    }

    setNomeExercicio(''); setDescricao(''); setBilateral(true)
    setLado('esquerdo'); setNotas('')
    setSets([{ numero: 1, repeticoes: '', carga: '' }])
    setMostrarForm(false)
    carregarRegistos()
  }

  async function apagarRegisto(registoId: string) {
    await supabase.from('registos').delete().eq('id', registoId)
    carregarRegistos()
  }

  const inputClass = "w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#333] focus:outline-none focus:border-[#3b82f6]"
  const btnTipo = (ativo: boolean) => `flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition ${ativo ? 'bg-[#1d4ed8] text-white' : 'bg-[#0d0d0d] text-[#444] border border-[#1e1e1e]'}`
  const btnLado = (ativo: boolean) => `px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition ${ativo ? 'bg-[#1d4ed8] text-white' : 'bg-[#0d0d0d] text-[#444] border border-[#1e1e1e]'}`

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Voltar />
        <div className="flex items-center justify-between mb-8 border-b border-[#1a1a1a] pb-6">
          <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight">Sessão</h1>
          <button onClick={() => setMostrarForm(!mostrarForm)}
            style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: mostrarForm ? '#1a1a1a' : '#1d4ed8',
              border: mostrarForm ? '1px solid #2a2a2a' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', transition: 'all 0.15s', flexShrink: 0
            }}
            aria-label="Adicionar">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              style={{ transform: mostrarForm ? 'rotate(45deg)' : 'none', transition: 'transform 0.15s' }}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={adicionarRegisto} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-6 flex flex-col gap-4">
            <div className="flex gap-2">
              <button type="button" onClick={() => setTipo('exercicio')} className={btnTipo(tipo === 'exercicio')}>Exercício</button>
              <button type="button" onClick={() => setTipo('intervencao')} className={btnTipo(tipo === 'intervencao')}>Intervenção</button>
            </div>

            {tipo === 'exercicio' ? (
              <>
                <input value={nomeExercicio} onChange={e => setNomeExercicio(e.target.value)}
                  placeholder="Nome do Exercício" required className={inputClass} />

                <div>
                  <p className="text-[9px] text-[#333] tracking-widest uppercase mb-2">Lateralidade</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setBilateral(true); setLado('') }} className={btnLado(bilateral)}>Bilateral</button>
                    <button type="button" onClick={() => { setBilateral(false); setLado('esquerdo') }} className={btnLado(!bilateral && lado === 'esquerdo')}>Esquerdo</button>
                    <button type="button" onClick={() => { setBilateral(false); setLado('direito') }} className={btnLado(!bilateral && lado === 'direito')}>Direito</button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] text-[#333] tracking-widest uppercase">Séries</p>
                    <button type="button" onClick={adicionarSet} className="text-[10px] text-[#3b82f6] uppercase tracking-widest hover:text-white transition">
                      + Série
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <p className="text-[9px] text-[#333] tracking-widest uppercase text-center">Série</p>
                    <p className="text-[9px] text-[#333] tracking-widest uppercase text-center">Reps</p>
                    <p className="text-[9px] text-[#333] tracking-widest uppercase text-center">Carga kg</p>
                  </div>
                  {sets.map((s, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#444] w-4 text-center">{s.numero}</span>
                        <button type="button" onClick={() => removerSet(i)} className="text-[#2a2a2a] hover:text-red-500 transition text-lg">×</button>
                      </div>
                      <input type="number" value={s.repeticoes} onChange={e => atualizarSet(i, 'repeticoes', e.target.value)}
                        placeholder="0" className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-[#3b82f6]" />
                      <input type="number" step="0.5" value={s.carga} onChange={e => atualizarSet(i, 'carga', e.target.value)}
                        placeholder="0" className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-[#3b82f6]" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                placeholder="Descrição da Intervenção" rows={3} required
                className={`${inputClass} resize-none`} />
            )}

            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Notas Adicionais" rows={2}
              className={`${inputClass} resize-none`} />

            <div className="flex gap-2">
              <button type="submit" className="bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-[#1e40af] transition">
                Guardar
              </button>
              <button type="button" onClick={() => setMostrarForm(false)} className="text-[#444] text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:text-white transition">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {registos.length === 0 ? (
          <p className="text-[#333] text-xs tracking-widest uppercase">Sem registos nesta sessão.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {registos.map(r => (
              <div key={r.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] px-2 py-1 rounded-lg font-bold uppercase tracking-widest ${r.tipo === 'exercicio' ? 'bg-[#1d4ed8]/20 text-[#3b82f6]' : 'bg-purple-900/20 text-purple-400'}`}>
                        {r.tipo === 'exercicio' ? 'Exercício' : 'Intervenção'}
                      </span>
                      {r.tipo === 'exercicio' && (
                        <span className="text-[9px] text-[#333] uppercase tracking-widest">
                          {r.bilateral ? 'Bilateral' : r.lado === 'esquerdo' ? 'Esquerdo' : 'Direito'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">{r.nome_exercicio || r.descricao}</p>
                    {r.tipo === 'exercicio' && r.sets && r.sets.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {[...r.sets].sort((a, b) => a.numero - b.numero).map(s => (
                          <p key={s.id} className="text-[10px] text-[#444] uppercase tracking-wider">
                            Série {s.numero}{s.repeticoes ? ` · ${s.repeticoes} reps` : ''}{s.carga ? ` · ${s.carga}kg` : ''}
                          </p>
                        ))}
                      </div>
                    )}
                    {r.notas && <p className="text-[10px] text-[#333] uppercase tracking-wider mt-2">{r.notas}</p>}
                  </div>
                  <button onClick={() => apagarRegisto(r.id)} className="text-[#2a2a2a] hover:text-red-500 transition ml-4 text-xl">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}