'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useTranslation } from '@/lib/useTranslation'
import type { Locale } from '@/lib/i18n'

function useCountUp(target: number | null, duration = 1000) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === null) return
    if (target === 0) { setValue(0); return }
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return target === null ? null : value
}

const LANGS: { code: Locale; label: string }[] = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

export default function Dashboard() {
  const { t, locale, setLocale } = useTranslation()
  const [totalClientes, setTotalClientes] = useState<number | null>(null)
  const [sessoesHoje, setSessoesHoje] = useState<number | null>(null)
  const [sessoesMes, setSessoesMes] = useState<number | null>(null)
  const [proximos, setProximos] = useState<any[]>([])
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    async function carregarStats() {
      const { count: c } = await supabase.from('clientes').select('*', { count: 'exact', head: true })
      setTotalClientes(c || 0)
      const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Lisbon' })
      const { count: sh } = await supabase.from('sessoes').select('*', { count: 'exact', head: true }).eq('data', hoje)
      setSessoesHoje(sh || 0)
      const dataInicio = new Date(new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Lisbon' }))
      const inicio = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), 1).toISOString().split('T')[0]
      const fim = new Date(dataInicio.getFullYear(), dataInicio.getMonth() + 1, 0).toISOString().split('T')[0]
      const { count: sm } = await supabase.from('sessoes').select('*', { count: 'exact', head: true }).gte('data', inicio).lte('data', fim)
      setSessoesMes(sm || 0)
      const { data: ag } = await supabase.from('agendamentos').select('*, clientes(nome)').gte('data', hoje).order('data').order('hora_inicio').limit(10)
      const horaAgora = new Date().toLocaleTimeString('pt-PT', { timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit', hour12: false })
      const filtrados = (ag || []).filter((a: any) => {
        if (a.data > hoje) return true
        if (!a.hora_inicio) return a.data >= hoje
        return a.hora_inicio.slice(0, 5) > horaAgora
      }).sort((a: any, b: any) => {
        const da = a.data + (a.hora_inicio || '00:00')
        const db = b.data + (b.hora_inicio || '00:00')
        return da.localeCompare(db)
      }).slice(0, 3)
      setProximos(filtrados)
    }
    carregarStats()
  }, [])

  const animClientes = useCountUp(totalClientes, 1000)
  const animHoje = useCountUp(sessoesHoje, 800)
  const animMes = useCountUp(sessoesMes, 1200)
  const hoje = new Date().toLocaleDateString('pt-PT', { timeZone: 'Europe/Lisbon', weekday: 'long', day: 'numeric', month: 'long' })

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px 110px' } as React.CSSProperties,
    wrap: { maxWidth: '600px', margin: '0 auto' },
    sectionLbl: { fontSize: '9px', color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginBottom: '10px' },
    card: { background: '#141414', border: '1px solid #222', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' } as React.CSSProperties,
    iconBox: { width: '42px', height: '42px', borderRadius: '11px', background: '#1d1d1d', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 } as React.CSSProperties,
    cardTitle: { fontSize: '15px', fontWeight: 700, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
    cardSub: { fontSize: '10px', color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: '3px' },
    arrow: { color: '#444', fontSize: '22px', marginLeft: 'auto' },
  }

  const stats = [
    { valor: animClientes, label: t.clients, icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>) },
    { valor: animHoje, label: t.today, icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>) },
    { valor: animMes, label: t.thisMonth, icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>) },
  ]

  return (
    <main style={s.page}>
      <div style={s.wrap}>

        {/* Header */}
        <div style={{ marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <p style={{ color: '#3b82f6', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>{hoje}</p>
              <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1 }}>{t.hello}</h1>
            </div>

            {/* Dropdown idioma + Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div ref={langRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setLangOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 10px', borderRadius: '20px', cursor: 'pointer',
                    background: 'transparent', border: '1px solid #1e1e1e',
                    fontSize: '9px', fontWeight: 700, color: '#444',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    transition: 'all 0.15s',
                  }}>
                  {locale.toUpperCase()}
                  <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                    style={{ transition: 'transform 0.15s', transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {langOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    background: '#141414', border: '1px solid #222', borderRadius: '10px',
                    overflow: 'hidden', zIndex: 50, minWidth: '110px',
                  }}>
                    {LANGS.map((lang, i) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLocale(lang.code); setLangOpen(false) }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', padding: '9px 12px',
                          background: locale === lang.code ? 'rgba(59,130,246,0.08)' : 'transparent',
                          border: 'none',
                          borderTop: i > 0 ? '1px solid #1e1e1e' : 'none',
                          cursor: 'pointer', textAlign: 'left',
                        }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: locale === lang.code ? '#3b82f6' : '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {lang.label}
                        </span>
                        {locale === lang.code && (
                          <svg width="10" height="10" fill="none" stroke="#3b82f6" strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ width: '1px', height: '16px', background: '#222', margin: '0 2px' }} />

              <button onClick={logout}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {t.logout}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '32px' }}>
          {stats.map(st => (
            <div key={st.label} style={{ background: '#141414', border: '1px solid #222', borderRadius: '16px', aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ color: '#3b82f6', opacity: 0.6 }}>{st.icon}</div>
              <p style={{ fontSize: '36px', fontWeight: 800, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{st.valor ?? '—'}</p>
              <p style={{ fontSize: '9px', color: '#555', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{st.label}</p>
            </div>
          ))}
        </div>

        {/* Navegação */}
        <p style={s.sectionLbl}>{t.navigation}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          <a href="/clientes" style={s.card}>
            <div style={s.iconBox}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
            <div style={{ flex: 1 }}><p style={s.cardTitle}>{t.clients}</p></div>
            <span style={s.arrow}>›</span>
          </a>
          <a href="/calendario" style={s.card}>
            <div style={s.iconBox}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div>
            <div style={{ flex: 1 }}><p style={s.cardTitle}>{t.schedules}</p></div>
            <span style={s.arrow}>›</span>
          </a>
          <a href="/avaliacoes" style={s.card}>
            <div style={s.iconBox}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
            <div style={{ flex: 1 }}><p style={s.cardTitle}>{t.newAssessment}</p></div>
            <span style={s.arrow}>›</span>
          </a>
          <a href="/protocolos" style={s.card}>
            <div style={s.iconBox}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg></div>
            <div style={{ flex: 1 }}><p style={s.cardTitle}>{t.rehabProtocols}</p></div>
            <span style={s.arrow}>›</span>
          </a>
          <a href="/exercicios" style={s.card}>
            <div style={s.iconBox}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
              </svg>
            </div>
            <div style={{ flex: 1 }}><p style={s.cardTitle}>Base de Dados</p></div>
            <span style={s.arrow}>›</span>
          </a>
        </div>

        {/* Próximos */}
        {proximos.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <p style={s.sectionLbl}>{t.nextSchedules}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {proximos.map((a: any) => (
                <a key={a.id} href={a.cliente_id ? `/clientes/${a.cliente_id}` : '/calendario'} style={s.card}>
                  <div style={{ width: '4px', height: '40px', background: '#3b82f6', borderRadius: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.cardTitle}>{a.clientes?.nome || t.noClient}</p>
                    <p style={s.cardSub}>
                      {new Date(a.data + 'T00:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                      {a.hora_inicio ? ` · ${a.hora_inicio.slice(0, 5)}` : ''}
                      {a.tipo ? ` · ${a.tipo}` : ''}
                    </p>
                  </div>
                  <span style={s.arrow}>›</span>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}