'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Voltar from '@/components/Voltar'

type Set = {
  numero: number
  repeticoes: number
  carga: number
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

type Sessao = {
  id: string
  data: string
  hora: string
  energia: number | null
  sono: number | null
  alimentacao: number | null
  predisposicao: number | null
}

type Cliente = {
  nome: string
  email: string | null
}

const CORES = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
const LABELS = ['', 'Muito Mau', 'Mau', 'Regular', 'Bom', 'Muito Bom']

const METRICAS = [
  { key: 'energia',       label: 'Energia',      emoji: '⚡' },
  { key: 'sono',          label: 'Sono',         emoji: '🌙' },
  { key: 'alimentacao',   label: 'Alimentação',  emoji: '🥗' },
  { key: 'predisposicao', label: 'Predisposição',emoji: '💪' },
] as const

export default function SessaoPage() {
  const { id, sessaoId } = useParams()
  const router = useRouter()
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [registos, setRegistos] = useState<Registo[]>([])
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [tipo, setTipo] = useState<'exercicio' | 'intervencao'>('exercicio')
  const [nomeExercicio, setNomeExercicio] = useState('')
  const [descricao, setDescricao] = useState('')
  const [bilateral, setBilateral] = useState(true)
  const [lado, setLado] = useState('esquerdo')
  const [notas, setNotas] = useState('')
  const [sets, setSets] = useState<Set[]>([{ numero: 1, repeticoes: 10, carga: 0 }])

  // Popup terminar sessão
  const [mostrarPopupTerminar, setMostrarPopupTerminar] = useState(false)
  const [gerandoPDF, setGerandoPDF] = useState(false)
  const [emailReport, setEmailReport] = useState('')
  const [enviandoEmail, setEnviandoEmail] = useState(false)
  const [etapaPopup, setEtapaPopup] = useState<'opcoes' | 'email'>('opcoes')

  const supabase = createClient()
  const holdRef = useRef<any>(null)
  const touchUsadoRef = useRef(false)

  useEffect(() => { carregarDados() }, [sessaoId])

  async function carregarDados() {
    const { data: s } = await supabase.from('sessoes').select('id, data, hora, energia, sono, alimentacao, predisposicao').eq('id', sessaoId).single()
    setSessao(s)
    const { data } = await supabase.from('registos').select('*, sets(id, numero, repeticoes, carga)').eq('sessao_id', sessaoId).order('ordem')
    setRegistos((data as any) || [])
    const { data: c } = await supabase.from('clientes').select('nome, email').eq('id', id).single()
    if (c) { setCliente(c); setEmailReport(c.email || '') }
  }

  function adicionarSet() {
    const ultimo = sets[sets.length - 1]
    setSets([...sets, { numero: sets.length + 1, repeticoes: ultimo?.repeticoes || 10, carga: ultimo?.carga || 0 }])
  }

  function removerSet(index: number) {
    if (sets.length === 1) return
    setSets(sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, numero: i + 1 })))
  }

  function ajustarSet(index: number, campo: 'repeticoes' | 'carga', delta: number) {
    setSets(prev => {
      const novos = [...prev]
      novos[index] = { ...novos[index], [campo]: Math.max(0, novos[index][campo] + delta) }
      return novos
    })
  }

  function iniciarHold(index: number, campo: 'repeticoes' | 'carga', delta: number) {
    ajustarSet(index, campo, delta)
    let velocidade = 400
    function passo() {
      ajustarSet(index, campo, delta)
      velocidade = Math.max(50, velocidade - 60)
      holdRef.current = setTimeout(passo, velocidade)
    }
    holdRef.current = setTimeout(passo, velocidade)
  }

  function pararHold() {
    if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null }
  }

  function iniciarEdicao(r: Registo) {
    setEditandoId(r.id)
    setTipo(r.tipo as 'exercicio' | 'intervencao')
    setNomeExercicio(r.nome_exercicio || '')
    setDescricao(r.descricao || '')
    setBilateral(r.bilateral ?? true)
    setLado(r.lado || 'esquerdo')
    setNotas(r.notas || '')
    if (r.sets && r.sets.length > 0) {
      setSets([...r.sets].sort((a, b) => a.numero - b.numero).map(s => ({ numero: s.numero, repeticoes: s.repeticoes, carga: s.carga })))
    } else {
      setSets([{ numero: 1, repeticoes: 10, carga: 0 }])
    }
    setMostrarForm(true)
  }

  function cancelarForm() {
    setMostrarForm(false); setEditandoId(null); setNomeExercicio(''); setDescricao('')
    setBilateral(true); setLado('esquerdo'); setNotas(''); setSets([{ numero: 1, repeticoes: 10, carga: 0 }])
  }

  async function guardarRegisto(e: React.FormEvent) {
    e.preventDefault()
    if (editandoId) {
      await supabase.from('registos').update({
        tipo, nome_exercicio: tipo === 'exercicio' ? nomeExercicio : null,
        descricao: tipo === 'intervencao' ? descricao : null,
        bilateral: tipo === 'exercicio' ? bilateral : null,
        lado: tipo === 'exercicio' && !bilateral ? lado : null,
        notas: notas || null,
      }).eq('id', editandoId)
      if (tipo === 'exercicio') {
        await supabase.from('sets').delete().eq('registo_id', editandoId)
        await supabase.from('sets').insert(sets.map(s => ({ registo_id: editandoId, numero: s.numero, repeticoes: s.repeticoes, carga: s.carga })))
      }
    } else {
      const { data: registo } = await supabase.from('registos').insert({
        sessao_id: sessaoId, tipo,
        nome_exercicio: tipo === 'exercicio' ? nomeExercicio : null,
        descricao: tipo === 'intervencao' ? descricao : null,
        bilateral: tipo === 'exercicio' ? bilateral : null,
        lado: tipo === 'exercicio' && !bilateral ? lado : null,
        notas: notas || null, ordem: registos.length
      }).select().single()
      if (registo && tipo === 'exercicio') {
        await supabase.from('sets').insert(sets.map(s => ({ registo_id: registo.id, numero: s.numero, repeticoes: s.repeticoes, carga: s.carga })))
      }
    }
    cancelarForm(); carregarDados()
  }

  async function apagarRegisto(registoId: string) {
    await supabase.from('registos').delete().eq('id', registoId)
    carregarDados()
  }

  // ─── GERAÇÃO DO PDF ───
  function gerarHTMLReport() {
    if (!sessao || !cliente) return ''

    const dataAtual = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
    const dataFmt = new Date(sessao.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    // Score
    const vals = [sessao.energia, sessao.sono, sessao.alimentacao, sessao.predisposicao].filter(Boolean) as number[]
    const totalScore = vals.reduce((a, b) => a + b, 0)
    const maxScore = vals.length * 5
    const percentagem = maxScore > 0 ? Math.round(((totalScore - vals.length) / (maxScore - vals.length)) * 100) : 0

    const corScore = totalScore <= 8 ? '#ef4444' : totalScore <= 11 ? '#f97316' : totalScore <= 14 ? '#eab308' : totalScore <= 17 ? '#22c55e' : '#3b82f6'
    const labelScore = totalScore <= 8 ? 'Estado Crítico' : totalScore <= 11 ? 'Estado Baixo' : totalScore <= 14 ? 'Estado Regular' : totalScore <= 17 ? 'Bom Estado' : 'Excelente Estado'

    const metricasHTML = METRICAS.map(({ key, label, emoji }) => {
      const val = sessao[key] as number | null
      if (!val) return ''
      return `
        <div style="display:flex; align-items:center; gap:8px; background:#0f172a; border:1px solid #1f2937; border-radius:8px; padding:10px 14px;">
          <span style="font-size:14px;">${emoji}</span>
          <span style="font-size:10px; color:#6b7280; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; flex:1;">${label}</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="width:40px; height:4px; background:#1f2937; border-radius:2px; overflow:hidden;">
              <div style="width:${(val / 5) * 100}%; height:100%; background:${CORES[val]}; border-radius:2px;"></div>
            </div>
            <span style="font-size:12px; font-weight:800; color:${CORES[val]};">${val}</span>
          </div>
        </div>`
    }).join('')

    const registosHTML = registos.map((r, i) => {
      const setsHTML = r.tipo === 'exercicio' && r.sets && r.sets.length > 0
        ? `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">
            ${[...r.sets].sort((a, b) => a.numero - b.numero).map(s =>
              `<span style="font-size:10px; color:#9ca3af; background:#1f2937; border-radius:6px; padding:4px 10px; font-weight:700;">${s.repeticoes}×${s.carga}kg</span>`
            ).join('')}
          </div>`
        : ''
      const lateralidade = r.tipo === 'exercicio'
        ? `<span style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.08em;">${r.bilateral ? 'Bilateral' : r.lado === 'esquerdo' ? 'Esquerdo' : 'Direito'}</span>`
        : ''
      return `
        <div style="background:#111827; border:1px solid #1f2937; border-radius:12px; overflow:hidden; margin-bottom:10px; break-inside:avoid;">
          <div style="padding:12px 16px; border-bottom:1px solid #1f2937; display:flex; align-items:center; gap:10px;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; background:#1e3a5f; border:1px solid #2563eb; border-radius:6px; font-size:10px; font-weight:800; color:#3b82f6; flex-shrink:0;">${i + 1}</span>
            <span style="font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; padding:3px 8px; border-radius:6px; ${r.tipo === 'exercicio' ? 'background:rgba(29,78,216,0.2); color:#60a5fa;' : 'background:rgba(147,51,234,0.2); color:#c084fc;'}">${r.tipo === 'exercicio' ? 'Exercício' : 'Intervenção'}</span>
            ${lateralidade}
          </div>
          <div style="padding:12px 16px;">
            <p style="font-size:13px; font-weight:800; color:#f9fafb; text-transform:uppercase; letter-spacing:0.03em; margin-bottom:4px;">${r.nome_exercicio || r.descricao}</p>
            ${setsHTML}
            ${r.notas ? `<p style="font-size:11px; color:#6b7280; margin-top:8px; font-style:italic;">${r.notas}</p>` : ''}
          </div>
        </div>`
    }).join('')

    return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Relatório — ${cliente.nome}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Helvetica Neue', Arial, sans-serif; background:#030712; color:#f9fafb; padding:40px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    @media print { body { padding:20px; background:#030712 !important; } @page { margin:12mm; } }
  </style>
</head>
<body>

  <!-- Cabeçalho -->
  <div style="display:flex; align-items:flex-start; justify-content:space-between; padding-bottom:24px; border-bottom:1px solid #1f2937; margin-bottom:28px;">
    <div>
      <div style="font-size:26px; font-weight:900; letter-spacing:-0.04em; color:#fff; text-transform:uppercase;">PhysioBox</div>
      <div style="font-size:9px; color:#3b82f6; text-transform:uppercase; letter-spacing:0.18em; margin-top:4px; font-weight:700;">Performance & Reabilitação</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.1em; font-weight:600;">Gerado em</div>
      <div style="font-size:12px; font-weight:700; color:#9ca3af; margin-top:3px;">${dataAtual}</div>
    </div>
  </div>

  <!-- Paciente -->
  <div style="background:#0f172a; border:1px solid #1e3a5f; border-radius:14px; padding:20px 24px; margin-bottom:24px; position:relative; overflow:hidden;">
    <div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, #2563eb, #3b82f6, transparent);"></div>
    <div style="font-size:9px; color:#3b82f6; text-transform:uppercase; letter-spacing:0.15em; font-weight:700; margin-bottom:6px;">Paciente</div>
    <div style="font-size:22px; font-weight:900; color:#fff; text-transform:uppercase; margin-bottom:6px;">${cliente.nome}</div>
    <div style="font-size:11px; color:#9ca3af; font-weight:600; text-transform:capitalize;">${dataFmt}${sessao.hora ? ' · ' + sessao.hora.slice(0, 5) : ''}</div>
  </div>

  ${vals.length > 0 ? `
  <!-- Score Total -->
  <div style="background:#0f172a; border:1px solid #1e3a5f; border-radius:14px; padding:18px 22px; margin-bottom:20px;">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <div>
        <div style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.15em; font-weight:700; margin-bottom:4px;">Score do Dia</div>
        <div style="display:flex; align-items:baseline; gap:6px;">
          <span style="font-size:36px; font-weight:900; color:${corScore}; line-height:1;">${totalScore}</span>
          <span style="font-size:13px; color:#374151; font-weight:700;">/${maxScore}</span>
        </div>
      </div>
      <span style="font-size:10px; font-weight:800; color:${corScore}; text-transform:uppercase; letter-spacing:0.1em; background:${corScore}18; border:1px solid ${corScore}40; padding:6px 14px; border-radius:20px;">${labelScore}</span>
    </div>
    <div style="height:6px; background:#1f2937; border-radius:3px; overflow:hidden;">
      <div style="width:${percentagem}%; height:100%; background:${corScore}; border-radius:3px;"></div>
    </div>
  </div>

  <!-- Detalhe avaliação -->
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
    <div style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.18em; font-weight:700;">Avaliação Inicial</div>
    <div style="flex:1; height:1px; background:#1f2937;"></div>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:24px;">${metricasHTML}</div>
  ` : ''}

  <!-- Exercícios -->
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
    <div style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.18em; font-weight:700;">Registos da Sessão · ${registos.length}</div>
    <div style="flex:1; height:1px; background:#1f2937;"></div>
  </div>
  ${registosHTML || '<p style="font-size:12px; color:#374151; font-style:italic;">Sem registos nesta sessão.</p>'}

  <!-- Rodapé -->
  <div style="margin-top:40px; padding-top:16px; border-top:1px solid #1f2937; display:flex; justify-content:space-between;">
    <span style="font-size:9px; color:#374151; text-transform:uppercase; letter-spacing:0.1em;">PhysioBox · Documento Confidencial</span>
    <span style="font-size:9px; color:#374151;">${dataAtual}</span>
  </div>

</body>
</html>`
  }

  function downloadPDF() {
    setGerandoPDF(true)
    const html = gerarHTMLReport()
    const janela = window.open('', '_blank')
    if (!janela) { alert('Permite pop-ups para gerar o PDF.'); setGerandoPDF(false); return }
    janela.document.write(html)
    janela.document.close()
    setTimeout(() => {
      janela.print()
      setGerandoPDF(false)
      router.push('/dashboard')
    }, 600)
  }

  async function enviarEmail() {
    if (!emailReport || !cliente) return
    setEnviandoEmail(true)
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailReport,
          nomeCliente: cliente.nome,
          sessoes: [{
            id: sessaoId,
            data: sessao?.data,
            hora: sessao?.hora,
            notas: registos.map(r => r.nome_exercicio || r.descricao).join(', '),
          }],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar')
      alert(`Relatório enviado para ${emailReport}!`)
      router.push('/dashboard')
    } catch (err: any) {
      alert('Erro: ' + err.message)
      setEnviandoEmail(false)
    }
  }

  const temQuestionario = sessao && (sessao.energia || sessao.sono || sessao.alimentacao || sessao.predisposicao)

  const c = {
    page: { minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 120px' } as React.CSSProperties,
    wrap: { maxWidth: '600px', margin: '0 auto' },
    input: { width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', color: '#fff', outline: 'none' } as React.CSSProperties,
    label: { fontSize: '9px', color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: '10px' },
    stepBtn: { width: '40px', height: '40px', borderRadius: '10px', background: '#1d1d1d', border: '1px solid #2a2a2a', color: '#fff', fontSize: '22px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, userSelect: 'none' as const, touchAction: 'manipulation' as const } as React.CSSProperties,
  }

  const tipoBtn = (ativo: boolean): React.CSSProperties => ({
    flex: 1, padding: '16px', borderRadius: '14px', fontSize: '13px', fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
    background: ativo ? '#1d4ed8' : '#0d0d0d', border: ativo ? '1px solid #2563eb' : '1px solid #1e1e1e',
    color: ativo ? '#fff' : '#666', transition: 'all 0.15s',
  })

  const ladoBtn = (ativo: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
    background: ativo ? '#1d4ed8' : '#0d0d0d', border: ativo ? '1px solid #2563eb' : '1px solid #1e1e1e',
    color: ativo ? '#fff' : '#666', transition: 'all 0.15s',
  })

  const holdProps = (index: number, campo: 'repeticoes' | 'carga', delta: number) => ({
    onMouseDown: () => { if (touchUsadoRef.current) return; iniciarHold(index, campo, delta) },
    onMouseUp: pararHold, onMouseLeave: pararHold,
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); touchUsadoRef.current = true; iniciarHold(index, campo, delta) },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); pararHold() },
  })

  return (
    <main style={c.page}>
      <div style={c.wrap}>
        <Voltar />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Sessão</h1>
            {sessao?.data && (
              <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                {new Date(sessao.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                {sessao.hora ? ` · ${sessao.hora.slice(0, 5)}` : ''}
              </p>
            )}
          </div>
          <button onClick={() => mostrarForm && !editandoId ? cancelarForm() : (setMostrarForm(!mostrarForm), setEditandoId(null))}
            style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: mostrarForm ? '#1a1a1a' : '#1d4ed8',
              border: mostrarForm ? '1px solid #2a2a2a' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0
            }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              style={{ transform: mostrarForm ? 'rotate(45deg)' : 'none', transition: 'transform 0.15s' }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* CARD QUESTIONÁRIO */}
        {temQuestionario && (
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '16px' }}>
              Avaliação Inicial
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {METRICAS.map(({ key, label, emoji }) => {
                const val = sessao?.[key] as number | null
                if (!val) return null
                const cor = CORES[val]
                return (
                  <div key={key} style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px' }}>{emoji}</span>
                      <span style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</span>
                    </div>
                    <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '8px' }}>
                      <div style={{ height: '100%', width: `${(val / 5) * 100}%`, background: cor, borderRadius: '2px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: cor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{LABELS[val]}</span>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: cor }}>{val}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FORMULÁRIO */}
        {mostrarForm && (
          <form onSubmit={guardarRegisto} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '9px', color: editandoId ? '#a855f7' : '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
              {editandoId ? '✎ Editar Registo' : '+ Novo Registo'}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button type="button" onClick={() => setTipo('exercicio')} style={tipoBtn(tipo === 'exercicio')}>Exercício</button>
              <button type="button" onClick={() => setTipo('intervencao')} style={tipoBtn(tipo === 'intervencao')}>Intervenção</button>
            </div>
            {tipo === 'exercicio' ? (
              <>
                <p style={c.label}>Nome do Exercício</p>
                <input value={nomeExercicio} onChange={e => setNomeExercicio(e.target.value)} placeholder="Ex: Agachamento" required style={{ ...c.input, marginBottom: '20px' }} />
                <p style={c.label}>Lateralidade</p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <button type="button" onClick={() => { setBilateral(true); setLado('') }} style={ladoBtn(bilateral)}>Bilateral</button>
                  <button type="button" onClick={() => { setBilateral(false); setLado('esquerdo') }} style={ladoBtn(!bilateral && lado === 'esquerdo')}>Esquerdo</button>
                  <button type="button" onClick={() => { setBilateral(false); setLado('direito') }} style={ladoBtn(!bilateral && lado === 'direito')}>Direito</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <p style={{ ...c.label, marginBottom: 0 }}>Séries</p>
                  <button type="button" onClick={adicionarSet} style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ Série</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '8px' }}>
                  {sets.map((set, i) => (
                    <div key={i} style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Série {set.numero}</span>
                        {sets.length > 1 && <button type="button" onClick={() => removerSet(i)} style={{ background: 'none', border: 'none', color: '#444', fontSize: '18px', cursor: 'pointer' }}>×</button>}
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '8px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', textAlign: 'center' }}>Reps</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button type="button" {...holdProps(i, 'repeticoes', -1)} style={c.stepBtn}>−</button>
                            <span style={{ flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: 800, color: '#fff' }}>{set.repeticoes}</span>
                            <button type="button" {...holdProps(i, 'repeticoes', 1)} style={c.stepBtn}>+</button>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '8px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', textAlign: 'center' }}>Carga kg</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button type="button" {...holdProps(i, 'carga', -1)} style={c.stepBtn}>−</button>
                            <span style={{ flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: 800, color: '#fff' }}>{set.carga}</span>
                            <button type="button" {...holdProps(i, 'carga', 1)} style={c.stepBtn}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p style={c.label}>Descrição da Intervenção</p>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Massagem, mobilização articular..." rows={3} required style={{ ...c.input, resize: 'none', marginBottom: '8px' }} />
              </>
            )}
            <p style={{ ...c.label, marginTop: '20px' }}>Notas Adicionais</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Opcional..." rows={2} style={{ ...c.input, resize: 'none', marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, background: editandoId ? '#7c3aed' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer' }}>
                {editandoId ? 'Atualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={cancelarForm} style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '14px 20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* LISTA DE REGISTOS */}
        {registos.length === 0 ? (
          <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sem registos nesta sessão.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {registos.map(r => (
              <div key={r.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '9px', padding: '4px 8px', borderRadius: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: r.tipo === 'exercicio' ? 'rgba(29,78,216,0.2)' : 'rgba(147,51,234,0.2)', color: r.tipo === 'exercicio' ? '#3b82f6' : '#a855f7' }}>
                        {r.tipo === 'exercicio' ? 'Exercício' : 'Intervenção'}
                      </span>
                      {r.tipo === 'exercicio' && <span style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.bilateral ? 'Bilateral' : r.lado === 'esquerdo' ? 'Esquerdo' : 'Direito'}</span>}
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{r.nome_exercicio || r.descricao}</p>
                    {r.tipo === 'exercicio' && r.sets && r.sets.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {[...r.sets].sort((a, b) => a.numero - b.numero).map(set => (
                          <span key={set.id} style={{ fontSize: '10px', color: '#aaa', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {set.repeticoes}×{set.carga}kg
                          </span>
                        ))}
                      </div>
                    )}
                    {r.notas && <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '8px' }}>{r.notas}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
                    <button onClick={() => iniciarEdicao(r)} style={{ background: 'none', border: 'none', color: '#3b3b3b', fontSize: '15px', cursor: 'pointer', padding: '4px 6px', borderRadius: '8px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#6366f1')} onMouseLeave={e => (e.currentTarget.style.color = '#3b3b3b')}>✎</button>
                    <button onClick={() => apagarRegisto(r.id)} style={{ background: 'none', border: 'none', color: '#2a2a2a', fontSize: '20px', cursor: 'pointer', padding: '4px 6px', borderRadius: '8px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')} onMouseLeave={e => (e.currentTarget.style.color = '#2a2a2a')}>×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTÃO FIXO — Terminar Sessão */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', background: 'linear-gradient(to top, #0a0a0a 60%, transparent)', zIndex: 30 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={() => { setEtapaPopup('opcoes'); setMostrarPopupTerminar(true) }}
            style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            Terminar Sessão
          </button>
        </div>
      </div>

      {/* BACKDROP */}
      {mostrarPopupTerminar && (
        <div onClick={() => setMostrarPopupTerminar(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 40 }} />
      )}

      {/* POPUP TERMINAR */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        transform: mostrarPopupTerminar ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        background: '#111', borderTop: '1px solid #1e1e1e', borderRadius: '24px 24px 0 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
        </div>
        <div style={{ padding: '24px 24px 40px' }}>

          {etapaPopup === 'opcoes' ? (
            <>
              {/* Ícone sucesso */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="26" height="26" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <p style={{ fontSize: '10px', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>Sessão Concluída</p>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>Gerar Report?</h2>
                <p style={{ fontSize: '11px', color: '#555', marginTop: '8px', textAlign: 'center' }}>
                  {registos.length} registo{registos.length !== 1 ? 's' : ''} · {temQuestionario ? 'Com avaliação inicial' : 'Sem avaliação'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={downloadPDF} disabled={gerandoPDF}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', opacity: gerandoPDF ? 0.7 : 1 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {gerandoPDF ? 'A gerar...' : 'Descarregar PDF'}
                </button>

                <button onClick={() => setEtapaPopup('email')}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '14px', padding: '14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                  Enviar por Email
                </button>

                <button onClick={() => router.push('/dashboard')}
                  style={{ width: '100%', background: 'transparent', color: '#555', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                  Terminar sem Report
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setEtapaPopup('opcoes')} style={{ background: 'none', border: 'none', color: '#555', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ← Voltar
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', margin: 0 }}>Enviar por Email</h2>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px' }}>Email do Paciente</label>
                <input type="email" value={emailReport} onChange={e => setEmailReport(e.target.value)} placeholder="email@exemplo.com"
                  style={{ width: '100%', background: '#0d0d0d', border: '1px solid #222', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#fff', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
              <button onClick={enviarEmail} disabled={enviandoEmail || !emailReport}
                style={{ width: '100%', background: emailReport ? '#3b82f6' : '#1a1a1a', color: emailReport ? '#fff' : '#333', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: emailReport ? 'pointer' : 'not-allowed' }}>
                {enviandoEmail ? 'A enviar...' : 'Enviar Relatório'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}