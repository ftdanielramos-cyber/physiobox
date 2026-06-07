'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Voltar from '@/components/Voltar'

type Questionario = {
  energia: number
  sono: number
  alimentacao: number
  predisposicao: number
}

const PERGUNTAS: { key: keyof Questionario; label: string; emoji: string }[] = [
  { key: 'energia',       label: 'Energia',       emoji: '⚡' },
  { key: 'sono',          label: 'Sono',           emoji: '🌙' },
  { key: 'alimentacao',   label: 'Alimentação',    emoji: '🥗' },
  { key: 'predisposicao', label: 'Predisposição',  emoji: '💪' },
]

const LABELS = ['', 'Muito Mau', 'Mau', 'Regular', 'Bom', 'Muito Bom']
const CORES  = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

export default function NovaSessaoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData]   = useState('')
  const [hora, setHora]   = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarQ, setMostrarQ] = useState(false)
  const [q, setQ] = useState<Questionario>({ energia: 3, sono: 3, alimentacao: 3, predisposicao: 3 })

  // Estado do popup pós-criação
  const [sessaoCriada, setSessaoCriada] = useState<{ id: string; data: string; hora: string; notas: string | null } | null>(null)
  const [nomeCliente, setNomeCliente] = useState('')
  const [mostrarPopupReport, setMostrarPopupReport] = useState(false)
  const [gerandoPDF, setGerandoPDF] = useState(false)

  const supabase = createClient()

  function abrirQuestionario(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    setMostrarQ(true)
  }

  async function criarSessao(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Busca nome do cliente para o report
      const { data: cliente } = await supabase.from('clientes').select('nome').eq('id', id).single()
      if (cliente) setNomeCliente(cliente.nome)

      const { data: sessao, error } = await supabase.from('sessoes').insert({
        cliente_id: id,
        fisio_id: user?.id,
        data,
        hora: hora || null,
        notas: notas || null,
        energia: q.energia,
        sono: q.sono,
        alimentacao: q.alimentacao,
        predisposicao: q.predisposicao,
      }).select().single()

      if (error) { alert('Erro: ' + error.message); setLoading(false); return }

      setSessaoCriada({ id: sessao.id, data: sessao.data, hora: hora, notas: sessao.notas })
      setMostrarQ(false)
      setMostrarPopupReport(true)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  function navegarParaSessao() {
    if (sessaoCriada) router.push(`/clientes/${id}/sessoes/${sessaoCriada.id}`)
  }

  function gerarPDF() {
    if (!sessaoCriada) return
    setGerandoPDF(true)

    const dataFmt = new Date(sessaoCriada.data + 'T00:00:00').toLocaleDateString('pt-PT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const dataAtual = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })

    const totalScore = q.energia + q.sono + q.alimentacao + q.predisposicao // 4 a 20
    const percentagem = Math.round(((totalScore - 4) / 16) * 100) // normaliza 4-20 para 0-100%

    // Cor da barra baseada no score
    const corScore =
      totalScore <= 8  ? '#ef4444' :
      totalScore <= 11 ? '#f97316' :
      totalScore <= 14 ? '#eab308' :
      totalScore <= 17 ? '#22c55e' : '#3b82f6'

    const labelScore =
      totalScore <= 8  ? 'Estado Crítico' :
      totalScore <= 11 ? 'Estado Baixo' :
      totalScore <= 14 ? 'Estado Regular' :
      totalScore <= 17 ? 'Bom Estado' : 'Excelente Estado'

    const metricas = [
      { emoji: '⚡', label: 'Energia', val: q.energia },
      { emoji: '🌙', label: 'Sono', val: q.sono },
      { emoji: '🥗', label: 'Alimentação', val: q.alimentacao },
      { emoji: '💪', label: 'Predisposição', val: q.predisposicao },
    ].map(m => `
      <div style="display:flex; align-items:center; gap:8px; background:#0f172a; border:1px solid #1f2937; border-radius:8px; padding:10px 14px;">
        <span style="font-size:14px;">${m.emoji}</span>
        <span style="font-size:10px; color:#6b7280; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; flex:1;">${m.label}</span>
        <div style="display:flex; align-items:center; gap:6px;">
          <div style="width:40px; height:4px; background:#1f2937; border-radius:2px; overflow:hidden;">
            <div style="width:${(m.val / 5) * 100}%; height:100%; background:${CORES[m.val]}; border-radius:2px;"></div>
          </div>
          <span style="font-size:11px; font-weight:800; color:${CORES[m.val]}; min-width:16px; text-align:right;">${m.val}</span>
        </div>
      </div>
    `).join('')

    const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Relatório — ${nomeCliente}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background: #030712;
      color: #f9fafb;
      padding: 40px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body { padding: 20px; background: #030712 !important; }
      @page { margin: 12mm; }
    }
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
  <div style="background:#0f172a; border:1px solid #1e3a5f; border-radius:14px; padding:20px 24px; margin-bottom:28px; position:relative; overflow:hidden;">
    <div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, #2563eb, #3b82f6, transparent);"></div>
    <div style="font-size:9px; color:#3b82f6; text-transform:uppercase; letter-spacing:0.15em; font-weight:700; margin-bottom:6px;">Paciente</div>
    <div style="font-size:22px; font-weight:900; color:#fff; text-transform:uppercase; margin-bottom:8px;">${nomeCliente}</div>
    <div style="font-size:11px; color:#9ca3af; font-weight:600; text-transform:capitalize;">${dataFmt}${sessaoCriada.hora ? ' · ' + sessaoCriada.hora : ''}</div>
  </div>

  <!-- Score Total -->
  <div style="background:#0f172a; border:1px solid #1e3a5f; border-radius:14px; padding:18px 22px; margin-bottom:24px; position:relative; overflow:hidden;">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <div>
        <div style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.15em; font-weight:700; margin-bottom:4px;">Score do Dia</div>
        <div style="display:flex; align-items:baseline; gap:6px;">
          <span style="font-size:36px; font-weight:900; color:${corScore}; line-height:1;">${totalScore}</span>
          <span style="font-size:13px; color:#374151; font-weight:700;">/20</span>
        </div>
      </div>
      <div style="text-align:right;">
        <span style="font-size:10px; font-weight:800; color:${corScore}; text-transform:uppercase; letter-spacing:0.1em; background:${corScore}18; border:1px solid ${corScore}40; padding:6px 14px; border-radius:20px; display:inline-block;">
          ${labelScore}
        </span>
      </div>
    </div>
    <!-- Barra de progresso -->
    <div style="height:6px; background:#1f2937; border-radius:3px; overflow:hidden;">
      <div style="width:${percentagem}%; height:100%; background:${corScore}; border-radius:3px; transition:width 0.3s;"></div>
    </div>
  </div>

  <!-- Métricas -->
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
    <div style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.18em; font-weight:700;">Detalhe da Avaliação</div>
    <div style="flex:1; height:1px; background:#1f2937;"></div>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:24px;">
    ${metricas}
  </div>

  <!-- Notas -->
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
    <div style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.18em; font-weight:700;">Notas da Sessão</div>
    <div style="flex:1; height:1px; background:#1f2937;"></div>
  </div>
  <div style="background:#111827; border:1px solid #1f2937; border-radius:12px; padding:16px 18px;">
    ${sessaoCriada.notas
      ? `<p style="font-size:12px; color:#d1d5db; line-height:1.7; white-space:pre-wrap;">${sessaoCriada.notas}</p>`
      : `<p style="font-size:12px; color:#374151; font-style:italic;">Sem notas registadas.</p>`
    }
  </div>

  <!-- Rodapé -->
  <div style="margin-top:40px; padding-top:16px; border-top:1px solid #1f2937; display:flex; justify-content:space-between;">
    <span style="font-size:9px; color:#374151; text-transform:uppercase; letter-spacing:0.1em;">PhysioBox · Documento Confidencial</span>
    <span style="font-size:9px; color:#374151;">${dataAtual}</span>
  </div>

</body>
</html>`

    const janela = window.open('', '_blank')
    if (!janela) { alert('Permite pop-ups para gerar o PDF.'); setGerandoPDF(false); return }
    janela.document.write(html)
    janela.document.close()
    setTimeout(() => {
      janela.print()
      setGerandoPDF(false)
      navegarParaSessao()
    }, 600)
  }

  function definirData(offset: number) {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    setData(d.toISOString().split('T')[0])
  }

  const hoje   = new Date().toISOString().split('T')[0]
  const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const s = {
    page:  { minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 100px' } as React.CSSProperties,
    wrap:  { maxWidth: '600px', margin: '0 auto' },
    title: { fontSize: '32px', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '-0.01em', marginBottom: '28px' },
    label: { fontSize: '9px', color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: '10px' },
    card:  { background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', marginBottom: '12px' },
    input: { width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', color: '#fff', outline: 'none' } as React.CSSProperties,
    chip: (ativo: boolean) => ({
      flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
      textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer',
      background: ativo ? '#1d4ed8' : '#0d0d0d',
      border: ativo ? '1px solid #2563eb' : '1px solid #1e1e1e',
      color: ativo ? '#fff' : '#666', transition: 'all 0.15s',
    }),
    horaChip: (ativo: boolean) => ({
      padding: '10px 0', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
      cursor: 'pointer', background: ativo ? '#1d4ed8' : '#0d0d0d',
      border: ativo ? '1px solid #2563eb' : '1px solid #1e1e1e',
      color: ativo ? '#fff' : '#666', transition: 'all 0.15s', textAlign: 'center' as const,
    }),
  }

  const horasRapidas = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']

  return (
    <main style={s.page}>
      <div style={s.wrap}>
        <Voltar />
        <h1 style={s.title}>Nova Sessão</h1>

        <form onSubmit={abrirQuestionario}>
          <div style={s.card}>
            <p style={s.label}>Data</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button type="button" onClick={() => definirData(0)} style={s.chip(data === hoje)}>Hoje</button>
              <button type="button" onClick={() => definirData(1)} style={s.chip(data === amanha)}>Amanhã</button>
            </div>
            <input type="date" value={data} onChange={e => setData(e.target.value)} required style={s.input} />
          </div>

          <div style={s.card}>
            <p style={s.label}>Hora</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {horasRapidas.map(h => (
                <button key={h} type="button" onClick={() => setHora(h)} style={s.horaChip(hora === h)}>{h}</button>
              ))}
            </div>
            <input type="time" value={hora} onChange={e => setHora(e.target.value)} style={s.input} />
          </div>

          <div style={s.card}>
            <p style={s.label}>Notas</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3}
              placeholder="Observações gerais sobre a sessão..."
              style={{ ...s.input, resize: 'none' }} />
          </div>

          <button type="submit" disabled={loading || !data}
            style={{
              width: '100%', background: data ? '#1d4ed8' : '#1a1a1a',
              color: data ? '#fff' : '#444', border: 'none', borderRadius: '14px',
              padding: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.2em', cursor: data ? 'pointer' : 'not-allowed',
              marginTop: '4px', transition: 'all 0.15s',
            }}>
            Criar Sessão
          </button>
        </form>
      </div>

      {/* BACKDROP questionário */}
      {mostrarQ && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 40 }} />
      )}

      {/* POPUP QUESTIONÁRIO */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        transform: mostrarQ ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        background: '#111', borderTop: '1px solid #1e1e1e',
        borderRadius: '24px 24px 0 0', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
        </div>
        <div style={{ padding: '20px 24px 40px' }}>
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>Avaliação Inicial</p>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>Como está hoje?</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
            {PERGUNTAS.map(({ key, label, emoji }) => {
              const val = q[key]
              const cor = CORES[val]
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{emoji}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: cor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{LABELS[val]}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setQ(prev => ({ ...prev, [key]: n }))}
                        style={{
                          flex: 1, height: '44px', borderRadius: '12px', border: 'none',
                          cursor: 'pointer', fontWeight: 800, fontSize: '16px', transition: 'all 0.15s',
                          background: val === n ? CORES[n] : '#1a1a1a',
                          color: val === n ? '#fff' : '#333',
                          transform: val === n ? 'scale(1.08)' : 'scale(1)',
                        }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <button type="button" onClick={criarSessao} disabled={loading}
            style={{
              width: '100%', background: loading ? '#1a3a8f' : '#1d4ed8', color: '#fff',
              border: 'none', borderRadius: '14px', padding: '16px',
              fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.2em', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
            {loading ? 'A criar...' : 'Confirmar e Criar Sessão'}
          </button>
        </div>
      </div>

      {/* BACKDROP popup report */}
      {mostrarPopupReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 40 }} />
      )}

      {/* POPUP REPORT PÓS-CRIAÇÃO */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        transform: mostrarPopupReport ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        background: '#111', borderTop: '1px solid #1e1e1e',
        borderRadius: '24px 24px 0 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
        </div>
        <div style={{ padding: '24px 24px 40px' }}>

          {/* Ícone sucesso */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '18px',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
            }}>
              <svg width="26" height="26" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p style={{ fontSize: '10px', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>
              Sessão Criada
            </p>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0, textAlign: 'center' }}>
              Descarregar Report?
            </h2>
            <p style={{ fontSize: '11px', color: '#555', marginTop: '8px', textAlign: 'center', letterSpacing: '0.05em' }}>
              Gera um PDF desta sessão para enviar ao paciente
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={gerarPDF} disabled={gerandoPDF}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px',
                fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                cursor: gerandoPDF ? 'not-allowed' : 'pointer', opacity: gerandoPDF ? 0.7 : 1,
              }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {gerandoPDF ? 'A gerar...' : 'Descarregar PDF'}
            </button>

            <button onClick={navegarParaSessao}
              style={{
                width: '100%', background: 'transparent', color: '#555',
                border: '1px solid #1e1e1e', borderRadius: '14px', padding: '14px',
                fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', cursor: 'pointer',
              }}>
              Ignorar e Ver Sessão
            </button>
          </div>
        </div>
      </div>

    </main>
  )
}