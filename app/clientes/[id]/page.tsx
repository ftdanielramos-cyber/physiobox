'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Voltar from '@/components/Voltar'
import GerarReportButton from '@/components/reports/GerarReportButton'

type Cliente = {
  id: string; nome: string; email: string; telefone: string
  data_nasc: string; peso: number | null; altura: number | null
}
type Ficha = { id: string; historico_medico: string; patologias: string; medicacao: string; observacoes: string }

function calcularIdade(dataNasc: string | null): number | null {
  if (!dataNasc) return null
  const nasc = new Date(dataNasc)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

export default function ClientePage() {
  const rawParams = useParams()
  const [id, setId] = useState<string>('')
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [sessoes, setSessoes] = useState<any[]>([])
  const [tab, setTab] = useState('visao')
  const [editandoContacto, setEditandoContacto] = useState(false)
  const [editandoFicha, setEditandoFicha] = useState(false)
  const [cNome, setCNome] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cTelefone, setCTelefone] = useState('')
  const [cDataNasc, setCDataNasc] = useState('')
  const [cPeso, setCPeso] = useState('')
  const [cAltura, setCAltura] = useState('')
  const [historico, setHistorico] = useState('')
  const [patologias, setPatologias] = useState('')
  const [medicacao, setMedicacao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const rawId = rawParams?.id
    const resolvedId = Array.isArray(rawId) ? rawId[0] : typeof rawId === 'string' ? rawId : ''
    if (!resolvedId || resolvedId === 'undefined') return
    setId(resolvedId)
  }, [rawParams])

  useEffect(() => { if (!id) return; carregarDados() }, [id])

  async function carregarDados() {
    try {
      const { data: c, error: ce } = await supabase.from('clientes').select('*').eq('id', id).single()
      if (ce) { setErro(true); return }
      setCliente(c)
      if (c) {
        setCNome(c.nome || ''); setCEmail(c.email || ''); setCTelefone(c.telefone || '')
        setCDataNasc(c.data_nasc || ''); setCPeso(c.peso ? String(c.peso) : ''); setCAltura(c.altura ? String(c.altura) : '')
      }
      const { data: f } = await supabase.from('fichas').select('*').eq('cliente_id', id).single()
      if (f) { setFicha(f); setHistorico(f.historico_medico || ''); setPatologias(f.patologias || ''); setMedicacao(f.medicacao || ''); setObservacoes(f.observacoes || '') }
      const { data: s } = await supabase.from('sessoes').select('*').eq('cliente_id', id).order('data', { ascending: false })
      setSessoes(s || [])
    } catch (e) { setErro(true) }
  }

  async function guardarContacto(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('clientes').update({
      nome: cNome, email: cEmail || null, telefone: cTelefone || null,
      data_nasc: cDataNasc || null,
      peso: cPeso ? parseFloat(cPeso) : null,
      altura: cAltura ? parseFloat(cAltura) : null,
    }).eq('id', id)
    if (error) { alert('Erro: ' + error.message); return }
    setEditandoContacto(false); carregarDados()
  }

  async function guardarFicha(e: React.FormEvent) {
    e.preventDefault()
    const dados = { historico_medico: historico, patologias, medicacao, observacoes, updated_at: new Date().toISOString() }
    if (ficha) { await supabase.from('fichas').update(dados).eq('id', ficha.id) }
    else { await supabase.from('fichas').insert({ ...dados, cliente_id: id }) }
    setEditandoFicha(false); carregarDados()
  }

  async function apagarSessao(sessaoId: string) {
    if (!confirm('Apagar esta sessao?')) return
    await supabase.from('sessoes').delete().eq('id', sessaoId); carregarDados()
  }

  const tabs = [
    { id: 'visao', label: 'Visao Geral' },
    { id: 'perfil', label: 'Perfil' },
    { id: 'registos', label: 'Registos' },
    { id: 'progresso', label: 'Progresso' },
  ]

  const inputClass = "w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#333] focus:outline-none focus:border-[#3b82f6] resize-none"
  const labelClass = "block text-[9px] font-semibold text-[#444] uppercase tracking-[0.12em] mb-1.5"

  const idade = cliente ? calcularIdade(cliente.data_nasc) : null

  if (erro) return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <p style={{ color: '#ef4444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Erro ao carregar cliente</p>
      <button onClick={() => { setErro(false); carregarDados() }} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer' }}>Tentar novamente</button>
    </main>
  )

  if (!cliente) return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>A carregar...</p>
    </main>
  )

  // métricas preenchidas: idade, peso, altura
  const metricas = [
    idade !== null ? { label: 'Idade', valor: String(idade), unidade: 'anos', cor: '#3b82f6' } : null,
    cliente.peso ? { label: 'Peso', valor: String(cliente.peso), unidade: 'kg', cor: '#8b5cf6' } : null,
    cliente.altura ? { label: 'Altura', valor: String(cliente.altura), unidade: 'cm', cor: '#10b981' } : null,
  ].filter(Boolean) as { label: string; valor: string; unidade: string; cor: string }[]

  // dados contacto preenchidos
  const dadosContacto = [
    cliente.email ? { label: 'Email', valor: cliente.email } : null,
    cliente.telefone ? { label: 'Telefone', valor: cliente.telefone } : null,
    cliente.data_nasc ? { label: 'Data Nascimento', valor: new Date(cliente.data_nasc + 'T00:00:00').toLocaleDateString('pt-PT') } : null,
  ].filter(Boolean) as { label: string; valor: string }[]

  // dados ficha preenchidos
  const dadosFicha = ficha ? [
    ficha.historico_medico ? { label: 'Historico Medico', valor: ficha.historico_medico } : null,
    ficha.patologias ? { label: 'Patologias', valor: ficha.patologias } : null,
    ficha.medicacao ? { label: 'Medicacao', valor: ficha.medicacao } : null,
    ficha.observacoes ? { label: 'Observacoes', valor: ficha.observacoes } : null,
  ].filter(Boolean) as { label: string; valor: string }[] : []

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Voltar />
        <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mb-6">{cliente.nome}</h1>

        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #1a1a1a', marginBottom: '24px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '8px 12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #3b82f6' : '2px solid transparent', color: tab === t.id ? '#3b82f6' : '#444', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* VISAO GERAL */}
        {tab === 'visao' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '12px' }}>Resumo</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total de Sessoes</p>
                  <p style={{ fontSize: '10px', color: '#fff', fontWeight: 700 }}>{sessoes.length}</p>
                </div>
                {sessoes.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ultima Sessao</p>
                    <p style={{ fontSize: '10px', color: '#fff', fontWeight: 700 }}>{new Date(sessoes[0].data + 'T00:00:00').toLocaleDateString('pt-PT')}</p>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ficha Clinica</p>
                  <p style={{ fontSize: '10px', color: ficha ? '#3b82f6' : '#444', fontWeight: 700 }}>{ficha ? 'Completa' : 'Por preencher'}</p>
                </div>
              </div>
            </div>
            <a href={`/clientes/${id}/nova-sessao`} style={{ background: '#1d4ed8', border: '1px solid #2563eb', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nova Sessao</p>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px' }}>›</span>
            </a>
          </div>
        )}

        {/* PERFIL */}
        {tab === 'perfil' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* METRICAS — só aparecem se preenchidas */}
            {metricas.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${metricas.length}, 1fr)`, gap: '10px' }}>
                {metricas.map(m => (
                  <div key={m.label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: m.cor, opacity: 0.6 }} />
                    <p style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>{m.label}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{m.valor}</span>
                      <span style={{ fontSize: '11px', color: '#444', fontWeight: 600 }}>{m.unidade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* INFORMACOES */}
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editandoContacto || dadosContacto.length > 0 ? '16px' : '0' }}>
                <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Informacoes</p>
                <button onClick={() => setEditandoContacto(!editandoContacto)}
                  style={{ fontSize: '9px', color: editandoContacto ? '#ef4444' : '#555', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  {editandoContacto ? 'Cancelar' : 'Editar Informacoes'}
                </button>
              </div>

              {editandoContacto ? (
                <form onSubmit={guardarContacto} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div><label className={labelClass}>Nome Completo *</label><input value={cNome} onChange={e => setCNome(e.target.value)} required className={inputClass} /></div>
                  <div><label className={labelClass}>Email</label><input value={cEmail} onChange={e => setCEmail(e.target.value)} type="email" className={inputClass} /></div>
                  <div><label className={labelClass}>Telefone</label><input value={cTelefone} onChange={e => setCTelefone(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Data de Nascimento</label><input value={cDataNasc} onChange={e => setCDataNasc(e.target.value)} type="date" className={inputClass} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><label className={labelClass}>Peso (kg)</label><input value={cPeso} onChange={e => setCPeso(e.target.value)} type="number" step="0.1" min="0" placeholder="70.5" className={inputClass} /></div>
                    <div><label className={labelClass}>Altura (cm)</label><input value={cAltura} onChange={e => setCAltura(e.target.value)} type="number" step="0.1" min="0" placeholder="175" className={inputClass} /></div>
                  </div>
                  <button type="submit" style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '4px' }}>Guardar</button>
                </form>
              ) : dadosContacto.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dadosContacto.map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{item.label}</p>
                      <p style={{ fontSize: '13px', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>{item.valor}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem informacoes. Clica em Editar para adicionar.</p>
              )}
            </div>

            {/* FICHA CLINICA */}
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editandoFicha || dadosFicha.length > 0 ? '16px' : '0' }}>
                <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Avaliacao Clinica</p>
                <button onClick={() => setEditandoFicha(!editandoFicha)}
                  style={{ fontSize: '9px', color: editandoFicha ? '#ef4444' : '#555', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  {editandoFicha ? 'Cancelar' : ficha ? 'Editar Avaliacao' : '+ Adicionar Avaliacao'}
                </button>
              </div>

              {editandoFicha ? (
                <form onSubmit={guardarFicha} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div><label className={labelClass}>Historico Medico</label><textarea value={historico} onChange={e => setHistorico(e.target.value)} rows={3} className={inputClass} /></div>
                  <div><label className={labelClass}>Patologias</label><textarea value={patologias} onChange={e => setPatologias(e.target.value)} rows={2} className={inputClass} /></div>
                  <div><label className={labelClass}>Medicacao</label><textarea value={medicacao} onChange={e => setMedicacao(e.target.value)} rows={2} className={inputClass} /></div>
                  <div><label className={labelClass}>Observacoes</label><textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3} className={inputClass} /></div>
                  <button type="submit" style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '4px' }}>Guardar</button>
                </form>
              ) : dadosFicha.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dadosFicha.map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{item.label}</p>
                      <p style={{ fontSize: '13px', color: '#aaa', textTransform: 'uppercase' }}>{item.valor}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem avaliacao clinica. Clica em Adicionar para criar.</p>
              )}
            </div>
          </div>
        )}

        {/* REGISTOS */}
        {tab === 'registos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <GerarReportButton clienteId={cliente.id} nomeCliente={cliente.nome} emailCliente={cliente.email} sessoes={sessoes} />
              <a href={`/clientes/${id}/nova-sessao`} style={{ background: '#1d4ed8', color: '#fff', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
                + Nova Sessao
              </a>
            </div>
            {sessoes.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem sessoes ainda.</p>
            ) : sessoes.map(s => (
              <div key={s.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', display: 'flex', alignItems: 'center' }}>
                <a href={`/clientes/${id}/sessoes/${s.id}`} style={{ flex: 1, padding: '16px 20px', textDecoration: 'none' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(s.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  {s.hora && <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', marginTop: '4px' }}>{s.hora.slice(0, 5)}</p>}
                  {s.notas && <p style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', marginTop: '4px' }}>{s.notas}</p>}
                </a>
                <button onClick={() => apagarSessao(s.id)} style={{ background: 'none', border: 'none', color: '#2a2a2a', fontSize: '20px', cursor: 'pointer', padding: '0 16px' }}>x</button>
              </div>
            ))}
          </div>
        )}

        {/* PROGRESSO */}
        {tab === 'progresso' && (
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
            <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '12px' }}>Progresso</p>
            <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Em breve -- graficos de evolucao e metricas.</p>
          </div>
        )}
      </div>
    </main>
  )
}