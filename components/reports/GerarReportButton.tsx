'use client'

import { useState } from 'react'

type Sessao = {
  id: string
  data: string
  tipo?: string
  notas?: string
  duracao?: number
  clientes?: { nome: string; email?: string } | null
}

type Props = {
  clienteId: string
  nomeCliente: string
  emailCliente?: string
  sessoes: Sessao[]
}

export default function GerarReportButton({ clienteId, nomeCliente, emailCliente, sessoes }: Props) {
  const [modalAberto, setModalAberto] = useState(false)
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())
  const [email, setEmail] = useState(emailCliente || '')
  const [enviando, setEnviando] = useState(false)
  const [gerandoPDF, setGerandoPDF] = useState(false)
  const [etapa, setEtapa] = useState<'selecionar' | 'enviar'>('selecionar')

  function abrirModal() {
    setSelecionadas(new Set(sessoes.map(s => s.id)))
    setEtapa('selecionar')
    setGerandoPDF(false)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setGerandoPDF(false)
    setEnviando(false)
    setEtapa('selecionar')
  }

  function toggleSessao(id: string) {
    setSelecionadas(prev => {
      const novo = new Set(prev)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  function toggleTodas() {
    if (selecionadas.size === sessoes.length) setSelecionadas(new Set())
    else setSelecionadas(new Set(sessoes.map(s => s.id)))
  }

  function sessoesEscolhidas() {
    return sessoes.filter(s => selecionadas.has(s.id))
      .sort((a, b) => a.data.localeCompare(b.data))
  }

  async function downloadPDF() {
    setGerandoPDF(true)
    const escolhidas = sessoesEscolhidas()
    const html = gerarHTML(escolhidas)

    const janela = window.open('', '_blank')
    if (!janela) {
      alert('Permite pop-ups para gerar o PDF.')
      setGerandoPDF(false)
      return
    }
    janela.document.write(html)
    janela.document.close()

    // Após abrir a janela de impressão, reseta o estado e fecha o modal
    setTimeout(() => {
      janela.print()
      setGerandoPDF(false)
      fecharModal()
    }, 600)
  }

  async function enviarEmail() {
    if (!email) return
    setEnviando(true)
    const escolhidas = sessoesEscolhidas()
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nomeCliente, sessoes: escolhidas }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar')
      alert(`Relatório enviado para ${email} com sucesso!`)
      fecharModal()
    } catch (err: any) {
      alert('Erro ao enviar email: ' + err.message)
      setEnviando(false)
    }
  }

  function gerarHTML(escolhidas: Sessao[]): string {
    const dataAtual = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })

    const linhasSessoes = escolhidas.map((s, i) => {
      const data = new Date(s.data + 'T00:00:00').toLocaleDateString('pt-PT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
      return `
        <div style="margin-bottom:16px; background:#111827; border:1px solid #1f2937; border-radius:12px; overflow:hidden; break-inside:avoid;">
          <div style="padding:14px 18px; border-bottom:1px solid #1f2937; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; background:#1e3a5f; border:1px solid #2563eb; border-radius:8px; font-size:11px; font-weight:800; color:#3b82f6; flex-shrink:0;">${i + 1}</span>
              <strong style="font-size:13px; color:#f9fafb; text-transform:capitalize; font-weight:700; letter-spacing:0.02em;">${data}</strong>
            </div>
            ${s.tipo ? `<span style="font-size:9px; background:#1e3a5f; color:#60a5fa; padding:4px 10px; border-radius:20px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; border:1px solid #2563eb40;">${s.tipo}</span>` : ''}
          </div>
          <div style="padding:14px 18px;">
            ${s.duracao ? `<p style="font-size:11px; color:#6b7280; margin:0 0 10px; font-weight:600; letter-spacing:0.05em;">⏱ ${s.duracao} minutos</p>` : ''}
            ${s.notas
              ? `<p style="font-size:12px; color:#d1d5db; line-height:1.7; margin:0; white-space:pre-wrap;">${s.notas}</p>`
              : `<p style="font-size:12px; color:#374151; font-style:italic; margin:0;">Sem notas registadas.</p>`
            }
          </div>
        </div>
      `
    }).join('')

    const dataInicio = escolhidas.length > 0
      ? new Date(escolhidas[0].data + 'T00:00:00').toLocaleDateString('pt-PT')
      : ''
    const dataFim = escolhidas.length > 0
      ? new Date(escolhidas[escolhidas.length - 1].data + 'T00:00:00').toLocaleDateString('pt-PT')
      : ''

    return `<!DOCTYPE html>
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
      @page { margin: 12mm; background: #030712; }
    }
  </style>
</head>
<body>

  <!-- Cabeçalho -->
  <div style="display:flex; align-items:flex-start; justify-content:space-between; padding-bottom:24px; border-bottom:1px solid #1f2937; margin-bottom:28px;">
    <div>
      <div style="font-size:26px; font-weight:900; letter-spacing:-0.04em; color:#fff; text-transform:uppercase; line-height:1;">PhysioBox</div>
      <div style="font-size:9px; color:#3b82f6; text-transform:uppercase; letter-spacing:0.18em; margin-top:4px; font-weight:700;">Performance & Reabilitação</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.1em; font-weight:600;">Gerado em</div>
      <div style="font-size:12px; font-weight:700; color:#9ca3af; margin-top:3px;">${dataAtual}</div>
    </div>
  </div>

  <!-- Card Paciente -->
  <div style="background:#0f172a; border:1px solid #1e3a5f; border-radius:14px; padding:20px 24px; margin-bottom:28px; position:relative; overflow:hidden;">
    <div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, #2563eb, #3b82f6, transparent);"></div>
    <div style="font-size:9px; color:#3b82f6; text-transform:uppercase; letter-spacing:0.15em; font-weight:700; margin-bottom:6px;">Paciente</div>
    <div style="font-size:22px; font-weight:900; color:#fff; text-transform:uppercase; letter-spacing:-0.01em; margin-bottom:12px;">${nomeCliente}</div>
    <div style="display:flex; gap:24px; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.1em; font-weight:600;">Sessões</span>
        <span style="font-size:14px; font-weight:800; color:#3b82f6;">${escolhidas.length}</span>
      </div>
      ${escolhidas.length > 0 ? `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.1em; font-weight:600;">Período</span>
        <span style="font-size:11px; font-weight:700; color:#9ca3af;">${dataInicio} → ${dataFim}</span>
      </div>` : ''}
    </div>
  </div>

  <!-- Label sessões -->
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
    <div style="font-size:9px; color:#4b5563; text-transform:uppercase; letter-spacing:0.18em; font-weight:700;">Registo de Sessões</div>
    <div style="flex:1; height:1px; background:#1f2937;"></div>
  </div>

  <!-- Sessões -->
  ${linhasSessoes || '<p style="color:#374151; font-size:12px; font-style:italic;">Nenhuma sessão selecionada.</p>'}

  <!-- Rodapé -->
  <div style="margin-top:40px; padding-top:16px; border-top:1px solid #1f2937; display:flex; justify-content:space-between; align-items:center;">
    <span style="font-size:9px; color:#374151; text-transform:uppercase; letter-spacing:0.1em; font-weight:600;">PhysioBox · Documento Confidencial</span>
    <span style="font-size:9px; color:#374151;">${dataAtual}</span>
  </div>

</body>
</html>`
  }

  if (sessoes.length === 0) return null

  return (
    <>
      {/* Botão principal */}
      <button onClick={abrirModal}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '12px', padding: '10px 16px',
          color: '#3b82f6', fontSize: '11px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)' }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        Gerar Report
      </button>

      {/* Modal */}
      {modalAberto && (
        <>
          <div onClick={fecharModal}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            background: '#111', borderTop: '1px solid #1e1e1e',
            borderRadius: '20px 20px 0 0', maxHeight: '92vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
            </div>

            <div style={{ padding: '20px 24px 40px' }}>
              {/* Cabeçalho modal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>PDF</p>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', margin: 0 }}>
                    {etapa === 'selecionar' ? 'Selecionar Sessões' : 'Enviar Relatório'}
                  </h2>
                </div>
                <button onClick={fecharModal}
                  style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1a1a1a', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {etapa === 'selecionar' ? (
                <>
                  <button onClick={toggleTodas}
                    style={{
                      width: '100%', marginBottom: '12px', padding: '10px',
                      background: '#1a1a1a', border: '1px solid #222', borderRadius: '10px',
                      color: '#888', fontSize: '10px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                    }}>
                    {selecionadas.size === sessoes.length ? 'Desselecionar Todas' : 'Selecionar Todas'} ({selecionadas.size}/{sessoes.length})
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                    {sessoes.map(s => {
                      const sel = selecionadas.has(s.id)
                      const dataFmt = new Date(s.data + 'T00:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
                      return (
                        <button key={s.id} onClick={() => toggleSessao(s.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: sel ? 'rgba(59,130,246,0.08)' : '#0d0d0d',
                            border: sel ? '1px solid rgba(59,130,246,0.3)' : '1px solid #1a1a1a',
                            borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.15s',
                          }}>
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                            background: sel ? '#3b82f6' : '#1a1a1a',
                            border: sel ? '1px solid #3b82f6' : '1px solid #333',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {sel && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: sel ? '#fff' : '#777', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {dataFmt}
                            </p>
                            {s.tipo && <p style={{ fontSize: '10px', color: sel ? '#3b82f6' : '#444', marginTop: '2px' }}>{s.tipo}</p>}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={downloadPDF} disabled={selecionadas.size === 0 || gerandoPDF}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: selecionadas.size > 0 ? '#1d4ed8' : '#1a1a1a',
                        color: selecionadas.size > 0 ? '#fff' : '#333',
                        border: 'none', borderRadius: '12px', padding: '14px',
                        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.1em', cursor: selecionadas.size > 0 ? 'pointer' : 'not-allowed',
                      }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {gerandoPDF ? 'A gerar...' : 'Download PDF'}
                    </button>
                    <button onClick={() => setEtapa('enviar')} disabled={selecionadas.size === 0}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: selecionadas.size > 0 ? 'rgba(59,130,246,0.1)' : '#1a1a1a',
                        color: selecionadas.size > 0 ? '#3b82f6' : '#333',
                        border: selecionadas.size > 0 ? '1px solid rgba(59,130,246,0.3)' : '1px solid #222',
                        borderRadius: '12px', padding: '14px',
                        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.1em', cursor: selecionadas.size > 0 ? 'pointer' : 'not-allowed',
                      }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      Enviar Email
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Resumo</p>
                    <p style={{ fontSize: '13px', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>{nomeCliente}</p>
                    <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>{selecionadas.size} sessão{selecionadas.size !== 1 ? 'ões' : ''} selecionada{selecionadas.size !== 1 ? 's' : ''}</p>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '9px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px' }}>
                      Email do Destinatário
                    </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      style={{ width: '100%', background: '#0d0d0d', border: '1px solid #222', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#fff', outline: 'none', boxSizing: 'border-box' as const }} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setEtapa('selecionar')}
                      style={{ padding: '14px 18px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '12px', color: '#555', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                      ← Voltar
                    </button>
                    <button onClick={enviarEmail} disabled={enviando || !email}
                      style={{
                        flex: 1, background: email ? '#3b82f6' : '#1a1a1a',
                        color: email ? '#fff' : '#333',
                        border: 'none', borderRadius: '12px', padding: '14px',
                        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.1em', cursor: email ? 'pointer' : 'not-allowed',
                      }}>
                      {enviando ? 'A enviar...' : 'Enviar Relatório'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}