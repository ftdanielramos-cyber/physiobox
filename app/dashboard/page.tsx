'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useTranslation } from '@/lib/useTranslation'
import type { Locale } from '@/lib/i18n'

const LANGUAGES: { code: Locale; label: string; flag: string; native: string }[] = [
  { code: 'pt', label: 'Português', flag: '🇵🇹', native: 'Português' },
  { code: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'es', label: 'Español', flag: '🇪🇸', native: 'Español' },
]

export default function PerfilPage() {
  const { t, locale, setLocale } = useTranslation()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        const { data } = await supabase.from('profiles').select('nome').eq('id', user.id).single()
        setNome(data?.nome || '')
      }
    }
    carregarPerfil()
  }, [])

  async function sair() {
    setSigningOut(true)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  function mudarIdioma(code: Locale) {
    setLocale(code)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <p className="text-[#3b82f6] text-xs tracking-[0.2em] uppercase mb-2">{t.account}</p>
        <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mb-8">{t.profileTitle}</h1>

        {/* Card utilizador */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-4">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#1a1a1a]">
            <div className="w-14 h-14 rounded-xl bg-[#1d4ed8] flex items-center justify-content-center text-white text-2xl font-extrabold uppercase flex items-center justify-center">
              {nome ? nome[0] : '?'}
            </div>
            <div>
              <p className="text-lg font-extrabold text-white uppercase tracking-wider">{nome || '—'}</p>
              <p className="text-[10px] text-[#444] uppercase tracking-wider mt-1">{email}</p>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-[#333] tracking-widest uppercase mb-1">{t.profileTitle}</p>
            <p className="text-sm font-bold text-white uppercase tracking-wider">{t.physiotherapist}</p>
          </div>
        </div>

        {/* Seletor de idioma */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-4">
          <p className="text-xs text-[#3b82f6] tracking-[0.15em] uppercase font-bold mb-4">{t.language}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {LANGUAGES.map(lang => {
              const ativo = locale === lang.code
              return (
                <button key={lang.code} onClick={() => mudarIdioma(lang.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: ativo ? 'rgba(59,130,246,0.08)' : '#0d0d0d',
                    border: ativo ? '1px solid rgba(59,130,246,0.3)' : '1px solid #1a1a1a',
                    borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                    transition: 'all 0.15s', textAlign: 'left' as const,
                  }}>
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{lang.flag}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: ativo ? '#fff' : '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {lang.native}
                    </p>
                  </div>
                  {ativo && (
                    <svg width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Info app */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-4">
          <p className="text-xs text-[#3b82f6] tracking-[0.15em] uppercase font-bold mb-4">Physiobox</p>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-[#444] uppercase tracking-wider">{t.version}</p>
              <p className="text-[10px] text-white uppercase tracking-wider">1.0.0</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-[#444] uppercase tracking-wider">{t.platform}</p>
              <p className="text-[10px] text-white uppercase tracking-wider">PWA</p>
            </div>
          </div>
        </div>

        <button onClick={sair} disabled={signingOut}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-red-500 py-4 rounded-xl font-bold uppercase text-xs tracking-[0.2em] hover:border-red-500 transition mt-2">
          {signingOut ? t.signingOut : t.signOut}
        </button>

      </div>
    </main>
  )
}