'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Voltar from '@/components/Voltar'
import GerarReportButton from '@/components/reports/GerarReportButton'

type Cliente = {
  id: string; nome: string; email: string; telefone: string
  data_nasc: string; peso: number | null; altura: number | null; foto_url: string | null
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
  const [tab, setTab] = useState('perfil')
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
  const [mostrarPopupProgresso, setMostrarPopupProgresso] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [mesAtual, setMesAtual] = useState(new Date())
  const [sessaoSelecionada, setSessaoSelecionada] = useState<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !id) return
    setUploadingFoto(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) { alert('Erro ao fazer upload: ' + upErr.message); setUploadingFoto(false); return }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = urlData.publicUrl + '?t=' + Date.now()
      await supabase.from('clientes').update({ foto_url: publicUrl }).eq('id', id)
      carregarDados()
    } catch (err) { alert('Erro inesperado') }
    setUploadingFoto(false)
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
    await supabase.from('sessoes').delete().eq('id', sessaoId)
    setSessaoSelecionada(null)
    carregarDados()
  }

  // helpers calendário
  function diasNoMes() { return new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate() }
  function primeiroDiaSemana() { const d = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay(); return d === 0 ? 6 : d - 1 }

  function sessoesDoDia(dia: number) {
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return sessoes.filter(s => s.data === dataStr)
  }

  const meses = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const diasSemana = ['S','T','Q','Q','S','S','D']
  const hoje = new Date()

  const tabs = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'avaliacao', label: 'Avaliacao' },
    { id: 'registos', label: 'Registos' },
    { id: 'progresso', label: 'Progresso' },
  ]

  const inputClass = "w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-4 py-3 text-sm text-white uppercase tracking-wider placeholder:text-[#333] focus:outline-none focus:border-[#3b82f6] resize-none"
  const labelClass = "block text-[9px] font-semibold text-[#444] uppercase tracking-[0.12em] mb-1.5"

  const idade = cliente ? calcularIdade(cliente.data_nasc) : null
  const metricas = [
    idade !== null ? { label: 'Idade', valor: String(idade), unidade: 'anos', cor: '#3b82f6' } : null,
    cliente?.peso ? { label: 'Peso', valor: String(cliente.peso), unidade: 'kg', cor: '#8b5cf6' } : null,
    cliente?.altura ? { label: 'Altura', valor: String(cliente.altura), unidade: 'cm', cor: '#10b981' } : null,
  ].filter(Boolean) as { label: string; valor: string; unidade: string; cor: string }[]

  const dadosContacto = [
    cliente?.email ? { label: 'Email', valor: cliente.email } : null,
    cliente?.telefone ? { label: 'Telefone', valor: cliente.telefone } : null,
    cliente?.data_nasc ? { label: 'Data Nascimento', valor: new Date(cliente.data_nasc + 'T00:00:00').toLocaleDateString('pt-PT') } : null,
  ].filter(Boolean) as { label: string; valor: string }[]

  const dadosFicha = ficha ? [
    ficha.historico_medico ? { label: 'Historico Medico', valor: ficha.historico_medico } : null,
    ficha.patologias ? { label: 'Patologias', valor: ficha.patologias } : null,
    ficha.medicacao ? { label: 'Medicacao', valor: ficha.medicacao } : null,
    ficha.observacoes ? { label: 'Observacoes', valor: ficha.observacoes } : null,
  ].filter(Boolean) as { label: string; valor: string }[] : []

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

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Voltar />

        {/* Header com foto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div onClick={() => fileInputRef.current?.click()}
              style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#111', border: '2px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b82f6')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
              {uploadingFoto ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : cliente.foto_url ? (
                <img src={cliente.foto_url} alt={cliente.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg width="32" height="32" fill="none" stroke="#2a2a2a" strokeWidth="1.2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s', borderRadius: '50%' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#3b82f6', border: '2px solid #0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <svg width="9" height="9" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1, marginBottom: '6px' }}>{cliente.nome}</h1>
            <p style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{sessoes.length} {sessoes.length === 1 ? 'sessao' : 'sessoes'}</p>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #1a1a1a', marginBottom: '24px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { if (t.id === 'progresso') { setMostrarPopupProgresso(true); return }; setTab(t.id) }}
              style={{ padding: '8px 12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #3b82f6' : '2px solid transparent', color: tab === t.id ? '#3b82f6' : '#444', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* PERFIL */}
        {tab === 'perfil' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {metricas.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${metricas.length}, 1fr)`, gap: '10px' }}>
                {metricas.map(m => (
                  <div key={m.label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: m.cor, opacity: 0.7 }} />
                    <p style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>{m.label}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{m.valor}</span>
                      <span style={{ fontSize: '11px', color: '#444', fontWeight: 600 }}>{m.unidade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editandoContacto || dadosContacto.length > 0 ? '16px' : '0' }}>
                <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Informacoes</p>
                <button onClick={() => setEditandoContacto(!editandoContacto)} style={{ fontSize: '9px', color: editandoContacto ? '#ef4444' : '#555', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  {editandoContacto ? 'Cancelar' : 'Editar'}
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
          </div>
        )}

        {/* AVALIACAO */}
        {tab === 'avaliacao' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editandoFicha || dadosFicha.length > 0 ? '16px' : '0' }}>
                <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Avaliacao Clinica</p>
                <button onClick={() => setEditandoFicha(!editandoFicha)} style={{ fontSize: '9px', color: editandoFicha ? '#ef4444' : '#555', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  {editandoFicha ? 'Cancelar' : ficha ? 'Editar' : '+ Adicionar'}
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

        {/* REGISTOS — calendário */}
        {tab === 'registos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Barra de acoes */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <GerarReportButton clienteId={cliente.id} nomeCliente={cliente.nome} emailCliente={cliente.email} sessoes={sessoes} />
              <a href={`/clientes/${id}/nova-sessao`} style={{ background: '#1d4ed8', color: '#fff', borderRadius: '10px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
                + Nova Sessao
              </a>
            </div>

            {/* Calendário */}
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '16px' }}>
              {/* Navegação mês */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))}
                  style={{ background: 'none', border: 'none', color: '#555', fontSize: '20px', cursor: 'pointer', padding: '0 4px' }}>‹</button>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                </span>
                <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))}
                  style={{ background: 'none', border: 'none', color: '#555', fontSize: '20px', cursor: 'pointer', padding: '0 4px' }}>›</button>
              </div>

              {/* Dias da semana */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                {diasSemana.map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 0' }}>{d}</div>
                ))}
              </div>

              {/* Dias */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {Array.from({ length: primeiroDiaSemana() }).map((_, i) => <div key={`v-${i}`} />)}
                {Array.from({ length: diasNoMes() }).map((_, i) => {
                  const dia = i + 1
                  const sessoesNoDia = sessoesDoDia(dia)
                  const temSessao = sessoesNoDia.length > 0
                  const isHoje = hoje.getDate() === dia && hoje.getMonth() === mesAtual.getMonth() && hoje.getFullYear() === mesAtual.getFullYear()
                  return (
                    <button key={dia}
                      onClick={() => temSessao && setSessaoSelecionada(sessoesNoDia[0])}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        aspectRatio: '1/1', borderRadius: '8px', fontSize: '11px', fontWeight: temSessao ? 800 : 400,
                        border: 'none', cursor: temSessao ? 'pointer' : 'default',
                        background: temSessao ? 'rgba(59,130,246,0.15)' : isHoje ? '#1a1a1a' : 'transparent',
                        color: temSessao ? '#3b82f6' : isHoje ? '#fff' : '#555',
                        transition: 'all 0.1s',
                        outline: isHoje && !temSessao ? '1px solid #2a2a2a' : temSessao ? '1px solid rgba(59,130,246,0.3)' : 'none',
                      }}>
                      {dia}
                      {temSessao && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6', marginTop: '2px' }} />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Legenda */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
              <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{sessoes.length} sessoes registadas</p>
            </div>

            {sessoes.length === 0 && (
              <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem sessoes ainda.</p>
            )}
          </div>
        )}
      </div>

      {/* POPUP sessao selecionada */}
      {sessaoSelecionada && (
        <div onClick={() => setSessaoSelecionada(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 40 }} />
      )}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        transform: sessaoSelecionada ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        background: '#111', borderTop: '1px solid #1e1e1e', borderRadius: '24px 24px 0 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
        </div>
        {sessaoSelecionada && (
          <div style={{ padding: '20px 24px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>Sessao</p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', margin: 0 }}>
                  {new Date(sessaoSelecionada.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
                {sessaoSelecionada.hora && <p style={{ fontSize: '11px', color: '#555', marginTop: '4px', textTransform: 'uppercase' }}>{sessaoSelecionada.hora.slice(0, 5)}</p>}
              </div>
              <button onClick={() => setSessaoSelecionada(null)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1a1a1a', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {sessaoSelecionada.notas && (
              <p style={{ fontSize: '12px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>{sessaoSelecionada.notas}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href={`/clientes/${id}/sessoes/${sessaoSelecionada.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#1d4ed8', color: '#fff', borderRadius: '14px', padding: '14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
                Ver Sessao
                <span style={{ fontSize: '16px' }}>›</span>
              </a>
              <button onClick={() => apagarSessao(sessaoSelecionada.id)}
                style={{ background: 'transparent', color: '#555', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                Apagar Sessao
              </button>
            </div>
          </div>
        )}
      </div>

      {/* POPUP PROGRESSO */}
      {mostrarPopupProgresso && (
        <div onClick={() => setMostrarPopupProgresso(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 40 }} />
      )}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: mostrarPopupProgresso ? 50 : -1,
        transform: mostrarPopupProgresso ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        background: '#111', borderTop: '1px solid #1e1e1e', borderRadius: '24px 24px 0 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
        </div>
        <div style={{ padding: '32px 24px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <svg width="26" height="26" fill="none" stroke="#3b82f6" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '8px' }}>Em Breve</p>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '12px' }}>Progresso</h2>
          <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.6, maxWidth: '280px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Graficos de evolucao, metricas de desempenho e historico de progressao estao a caminho.</p>
          <button onClick={() => setMostrarPopupProgresso(false)}
            style={{ marginTop: '28px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '40px', padding: '12px 28px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', cursor: 'pointer' }}>
            Fechar
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}