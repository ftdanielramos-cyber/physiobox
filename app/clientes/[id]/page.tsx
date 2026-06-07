'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Voltar from '@/components/Voltar'

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
  const [sessoes, setSessoes] = useState<any[]>([])
  const [tab, setTab] = useState('visao')

  // Estado edição contacto
  const [editandoContacto, setEditandoContacto] = useState(false)
  const [cNome, setCNome] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cTelefone, setCTelefone] = useState('')
  const [cDataNasc, setCDataNasc] = useState('')

  // Estado edição ficha clínica
  const [editandoFicha, setEditandoFicha] = useState(false)
  const [historico, setHistorico] = useState('')
  const [patologias, setPatologias] = useState('')
  const [medicacao, setMedicacao] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const supabase = createClient()

  useEffect(() => { carregarDados() }, [id])

  async function carregarDados() {
    const { data: c } = await supabase.from('clientes').select('*').eq('id', id).single()
    setCliente(c)
    if (c) {
      setCNome(c.nome || '')
      setCEmail(c.email || '')
      setCTelefone(c.telefone || '')
      setCDataNasc(c.data_nasc || '')
    }
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

  async function guardarContacto(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('clientes').update({
      nome: cNome,
      email: cEmail || null,
      telefone: cTelefone || null,
      data_nasc: cDataNasc || null,
    }).eq('id', id as string)
    if (error) { alert('Erro ao atualizar: ' + error.message); return }
    setEditandoContacto(false)
    carregarDados()
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

  const tabs = [
    { id: 'visao', label: 'Visão Geral' },
    { id: 'perfil', label: 'Perfil' },
    { id: 'registos', label: 'Registos' },
    { id: 'progresso', label: 'Progresso' },
  ]

  const inputClass = "w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#333] focus:outline-none focus:border-[#3b82f6] resize-none"
  const labelClass = "block text-[9px] font-semibold text-[#444] uppercase tracking-[0.12em] mb-1.5"

  if (!cliente) return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>A carregar...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <Voltar />

        <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mb-6">{cliente.nome}</h1>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #1a1a1a', marginBottom: '24px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '8px 12px', fontSize: '10px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                background: 'none', border: 'none',
                borderBottom: tab === t.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: tab === t.id ? '#3b82f6' : '#444',
                transition: 'all 0.15s',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* VISÃO GERAL */}
        {tab === 'visao' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '12px' }}>Resumo</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total de Sessões</p>
                  <p style={{ fontSize: '10px', color: '#fff', fontWeight: 700 }}>{sessoes.length}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Última Sessão</p>
                  <p style={{ fontSize: '10px', color: '#fff', fontWeight: 700 }}>
                    {sessoes.length > 0
                      ? new Date(sessoes[0].data + 'T00:00:00').toLocaleDateString('pt-PT')
                      : '—'}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ficha Clínica</p>
                  <p style={{ fontSize: '10px', color: ficha ? '#3b82f6' : '#444', fontWeight: 700 }}>{ficha ? 'Completa' : 'Por preencher'}</p>
                </div>
              </div>
            </div>

            <a href={`/clientes/${id}/nova-sessao`}
              style={{ background: '#1d4ed8', border: '1px solid #2563eb', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nova Sessão</p>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px' }}>›</span>
            </a>
          </div>
        )}

        {/* PERFIL */}
        {tab === 'perfil' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* CONTACTO */}
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Contacto</p>
                <button onClick={() => setEditandoContacto(!editandoContacto)}
                  style={{ fontSize: '9px', color: editandoContacto ? '#ef4444' : '#555', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  {editandoContacto ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {editandoContacto ? (
                <form onSubmit={guardarContacto} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className={labelClass}>Nome Completo *</label>
                    <input value={cNome} onChange={e => setCNome(e.target.value)} required placeholder="Nome" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input value={cEmail} onChange={e => setCEmail(e.target.value)} type="email" placeholder="email@exemplo.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Telefone</label>
                    <input value={cTelefone} onChange={e => setCTelefone(e.target.value)} placeholder="+351 900 000 000" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Data de Nascimento</label>
                    <input value={cDataNasc} onChange={e => setCDataNasc(e.target.value)} type="date" className={inputClass} />
                  </div>
                  <button type="submit"
                    style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '4px' }}>
                    Guardar Alterações
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Nome', valor: cliente.nome },
                    { label: 'Email', valor: cliente.email },
                    { label: 'Telefone', valor: cliente.telefone },
                    { label: 'Data Nascimento', valor: cliente.data_nasc ? new Date(cliente.data_nasc + 'T00:00:00').toLocaleDateString('pt-PT') : null },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{item.label}</p>
                      <p style={{ fontSize: '13px', color: item.valor ? '#fff' : '#333', fontWeight: 700, textTransform: 'uppercase' }}>{item.valor || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FICHA CLÍNICA */}
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Ficha Clínica</p>
                <button onClick={() => setEditandoFicha(!editandoFicha)}
                  style={{ fontSize: '9px', color: editandoFicha ? '#ef4444' : '#555', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  {editandoFicha ? 'Cancelar' : ficha ? 'Editar' : '+ Adicionar'}
                </button>
              </div>

              {editandoFicha ? (
                <form onSubmit={guardarFicha} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label className={labelClass}>Histórico Médico</label>
                    <textarea value={historico} onChange={e => setHistorico(e.target.value)} placeholder="Histórico Médico" rows={3} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Patologias</label>
                    <textarea value={patologias} onChange={e => setPatologias(e.target.value)} placeholder="Patologias" rows={2} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Medicação</label>
                    <textarea value={medicacao} onChange={e => setMedicacao(e.target.value)} placeholder="Medicação" rows={2} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Observações</label>
                    <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações" rows={3} className={inputClass} />
                  </div>
                  <button type="submit"
                    style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '4px' }}>
                    Guardar
                  </button>
                </form>
              ) : ficha ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Histórico Médico', valor: ficha.historico_medico },
                    { label: 'Patologias', valor: ficha.patologias },
                    { label: 'Medicação', valor: ficha.medicacao },
                    { label: 'Observações', valor: ficha.observacoes },
                  ].filter(i => i.valor).map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{item.label}</p>
                      <p style={{ fontSize: '13px', color: '#aaa', textTransform: 'uppercase' }}>{item.valor}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem ficha clínica ainda.</p>
              )}
            </div>
          </div>
        )}

        {/* REGISTOS */}
        {tab === 'registos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <a href={`/clientes/${id}/nova-sessao`}
                style={{ background: '#1d4ed8', color: '#fff', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
                + Nova Sessão
              </a>
            </div>

            {sessoes.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem sessões ainda.</p>
            ) : (
              sessoes.map(s => (
                <div key={s.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', display: 'flex', alignItems: 'center' }}>
                  <a href={`/clientes/${id}/sessoes/${s.id}`}
                    style={{ flex: 1, padding: '16px 20px', textDecoration: 'none' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {new Date(s.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    {s.hora && <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', marginTop: '4px' }}>{s.hora.slice(0, 5)}</p>}
                    {s.notas && <p style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', marginTop: '4px' }}>{s.notas}</p>}
                  </a>
                  <button onClick={() => apagarSessao(s.id)}
                    style={{ background: 'none', border: 'none', color: '#2a2a2a', fontSize: '20px', cursor: 'pointer', padding: '0 16px' }}>×</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROGRESSO */}
        {tab === 'progresso' && (
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
            <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '12px' }}>Progresso</p>
            <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Em breve — gráficos de evolução e métricas.</p>
          </div>
        )}

      </div>
    </main>
  )
}