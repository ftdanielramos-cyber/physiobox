'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Exercicio = {
  id: string; nome: string; categoria: string | null; descricao: string | null; notas: string | null; youtube_url: string | null; created_at: string
}

function getYoutubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?\s]+)/)
  return match ? match[1] : null
}

function isShort(url: string) {
  return url.includes('/shorts/')
}

const CATEGORIAS = ['Força', 'Mobilidade', 'Estabilidade', 'Cardio', 'Reabilitação', 'Outro']

export default function Exercicios() {
  const supabase = createClient()
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Exercicio | null>(null)
  const [videoAberto, setVideoAberto] = useState<Exercicio | null>(null)
  const [filtro, setFiltro] = useState('')
  const [form, setForm] = useState({ nome: '', categoria: '', descricao: '', notas: '', youtube_url: '' })
  const [saving, setSaving] = useState(false)

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('exercicios').select('*').order('created_at', { ascending: false })
    setExercicios(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function abrirNovo() { setEditando(null); setForm({ nome: '', categoria: '', descricao: '', notas: '', youtube_url: '' }); setModalOpen(true) }
  function abrirEditar(ex: Exercicio) { setEditando(ex); setForm({ nome: ex.nome, categoria: ex.categoria || '', descricao: ex.descricao || '', notas: ex.notas || '', youtube_url: ex.youtube_url || '' }); setModalOpen(true) }

  async function guardar() {
    if (!form.nome.trim()) return
    setSaving(true)
    if (editando) { await supabase.from('exercicios').update({ nome: form.nome, categoria: form.categoria || null, descricao: form.descricao || null, notas: form.notas || null, youtube_url: form.youtube_url || null }).eq('id', editando.id) }
    else { await supabase.from('exercicios').insert({ nome: form.nome, categoria: form.categoria || null, descricao: form.descricao || null, notas: form.notas || null, youtube_url: form.youtube_url || null }) }
    setSaving(false); setModalOpen(false); carregar()
  }

  async function apagar(id: string) {
    if (!confirm('Apagar exercício?')) return
    await supabase.from('exercicios').delete().eq('id', id); carregar()
  }

  const filtrados = exercicios.filter(e =>
    e.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (e.categoria || '').toLowerCase().includes(filtro.toLowerCase())
  )

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 110px' } as React.CSSProperties,
    wrap: { maxWidth: '600px', margin: '0 auto' },
    input: { width: '100%', background: '#141414', border: '1px solid #222', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
    label: { fontSize: '9px', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: '6px', display: 'block' },
  }

  const videoIsShort = videoAberto?.youtube_url ? isShort(videoAberto.youtube_url) : false
  const videoId = videoAberto?.youtube_url ? getYoutubeId(videoAberto.youtube_url) : null

  return (
    <main style={s.page}>
      <div style={s.wrap}>
        <div style={{ marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <a href="/dashboard" style={{ color: '#555', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', display: 'block', marginBottom: '6px' }}>← Dashboard</a>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1 }}>Base de Dados</h1>
            </div>
            <button onClick={abrirNovo} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', border: 'none', borderRadius: '10px', padding: '10px 16px', color: '#fff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Novo
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input placeholder="Pesquisar exercício ou categoria..." value={filtro} onChange={e => setFiltro(e.target.value)} style={s.input} />
        </div>

        {loading ? (
          <p style={{ color: '#555', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>A carregar...</p>
        ) : filtrados.length === 0 ? (
          <p style={{ color: '#555', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>Nenhum exercício encontrado.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtrados.map(ex => {
              const ytId = ex.youtube_url ? getYoutubeId(ex.youtube_url) : null
              const short = ex.youtube_url ? isShort(ex.youtube_url) : false
              return (
                <div key={ex.id} style={{ background: '#141414', border: '1px solid #222', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div onClick={() => ytId && setVideoAberto(ex)}
                      style={{ width: short ? '36px' : '64px', height: '48px', borderRadius: '8px', flexShrink: 0, background: ytId ? `url(https://img.youtube.com/vi/${ytId}/mqdefault.jpg) center/cover` : '#1d1d1d', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: ytId ? 'pointer' : 'default', overflow: 'hidden', position: 'relative' }}>
                      {ytId && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>}
                      {!ytId && <svg width="20" height="20" fill="none" stroke="#333" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><polyline points="8 21 12 17 16 21" /><line x1="12" y1="17" x2="12" y2="3" /></svg>}
                      {short && ytId && <div style={{ position: 'absolute', bottom: '2px', left: '2px', background: '#ef4444', borderRadius: '3px', padding: '1px 4px', fontSize: '7px', fontWeight: 800, color: '#fff' }}>S</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{ex.nome}</p>
                        {ex.categoria && <span style={{ fontSize: '8px', fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{ex.categoria}</span>}
                      </div>
                      {ex.descricao && <p style={{ fontSize: '11px', color: '#666', lineHeight: 1.5, marginBottom: '4px' }}>{ex.descricao}</p>}
                      {ex.notas && <p style={{ fontSize: '11px', color: '#3b82f6', lineHeight: 1.5 }}>📝 {ex.notas}</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                      <button onClick={() => abrirEditar(ex)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '2px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => apagar(ex.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '2px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal formulário */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid #222', borderRadius: '20px 20px 0 0', padding: '28px 20px 40px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{editando ? 'Editar Exercício' : 'Novo Exercício'}</h2>
            <div><label style={s.label}>Nome *</label><input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Agachamento" style={s.input} /></div>
            <div><label style={s.label}>Categoria</label><select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} style={{ ...s.input, appearance: 'none' as const }}><option value="">Selecionar...</option>{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label style={s.label}>Descrição</label><textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição do exercício..." rows={3} style={{ ...s.input, resize: 'none' as const }} /></div>
            <div><label style={s.label}>Notas</label><textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Notas clínicas, progressões..." rows={2} style={{ ...s.input, resize: 'none' as const }} /></div>
            <div><label style={s.label}>Link YouTube</label><input value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} placeholder="https://youtube.com/shorts/... ou watch?v=..." style={s.input} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #222', borderRadius: '10px', color: '#555', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} disabled={saving} style={{ flex: 2, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'A guardar...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal vídeo */}
      {videoAberto && videoId && (
        <div onClick={() => setVideoAberto(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: videoIsShort ? '340px' : '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{videoAberto.nome}</p>
                {videoIsShort && <span style={{ fontSize: '8px', fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Short</span>}
              </div>
              <button onClick={() => setVideoAberto(null)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888', flexShrink: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', paddingBottom: videoIsShort ? '177.78%' : '56.25%', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0${videoIsShort ? '&loop=1&playlist=' + videoId : ''}`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {videoAberto.notas && <p style={{ color: '#3b82f6', fontSize: '12px', marginTop: '14px', lineHeight: 1.5, alignSelf: 'flex-start' }}>📝 {videoAberto.notas}</p>}
          </div>
        </div>
      )}
    </main>
  )
}