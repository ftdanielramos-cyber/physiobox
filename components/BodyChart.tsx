'use client'

import { useState } from 'react'

// Regiões do corpo com IDs únicos e vista (anterior/posterior)
export type Regiao = {
  id: string
  label: string
  vista: 'anterior' | 'posterior' | 'lateral_d' | 'lateral_e'
}

export const REGIOES: Regiao[] = [
  // Anterior
  { id: 'cabeca_ant', label: 'Cabeça', vista: 'anterior' },
  { id: 'cervical_ant', label: 'Cervical', vista: 'anterior' },
  { id: 'ombro_d_ant', label: 'Ombro D', vista: 'anterior' },
  { id: 'ombro_e_ant', label: 'Ombro E', vista: 'anterior' },
  { id: 'toracico_ant', label: 'Torácico', vista: 'anterior' },
  { id: 'cotovelo_d', label: 'Cotovelo D', vista: 'anterior' },
  { id: 'cotovelo_e', label: 'Cotovelo E', vista: 'anterior' },
  { id: 'abdominal', label: 'Abdómen', vista: 'anterior' },
  { id: 'lombar_ant', label: 'Lombar', vista: 'anterior' },
  { id: 'punho_d', label: 'Punho/Mão D', vista: 'anterior' },
  { id: 'punho_e', label: 'Punho/Mão E', vista: 'anterior' },
  { id: 'anca_d_ant', label: 'Anca D', vista: 'anterior' },
  { id: 'anca_e_ant', label: 'Anca E', vista: 'anterior' },
  { id: 'joelho_d_ant', label: 'Joelho D', vista: 'anterior' },
  { id: 'joelho_e_ant', label: 'Joelho E', vista: 'anterior' },
  { id: 'tornozelo_d', label: 'Tornozelo/Pé D', vista: 'anterior' },
  { id: 'tornozelo_e', label: 'Tornozelo/Pé E', vista: 'anterior' },
  // Posterior
  { id: 'cabeca_post', label: 'Cabeça', vista: 'posterior' },
  { id: 'cervical_post', label: 'Cervical', vista: 'posterior' },
  { id: 'ombro_d_post', label: 'Ombro D', vista: 'posterior' },
  { id: 'ombro_e_post', label: 'Ombro E', vista: 'posterior' },
  { id: 'toracico_post', label: 'Torácico Post', vista: 'posterior' },
  { id: 'lombar_post', label: 'Lombar', vista: 'posterior' },
  { id: 'sacro', label: 'Sacro/Glúteo', vista: 'posterior' },
  { id: 'anca_d_post', label: 'Anca D', vista: 'posterior' },
  { id: 'anca_e_post', label: 'Anca E', vista: 'posterior' },
  { id: 'joelho_d_post', label: 'Joelho D', vista: 'posterior' },
  { id: 'joelho_e_post', label: 'Joelho E', vista: 'posterior' },
  { id: 'calcaneo_d', label: 'Calcâneo D', vista: 'posterior' },
  { id: 'calcaneo_e', label: 'Calcâneo E', vista: 'posterior' },
]

type Props = {
  regioesSelecionadas: string[]
  onChange: (regioes: string[]) => void
  readonly?: boolean
}

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

// SVG paths simplificados para cada zona — anterior
function BodySVGAnterior({ selecionadas, onChange, readonly }: { selecionadas: string[]; onChange: (r: string[]) => void; readonly?: boolean }) {
  const hl = (id: string) => selecionadas.includes(id) ? 'rgba(239,68,68,0.7)' : 'rgba(59,130,246,0.08)'
  const stroke = (id: string) => selecionadas.includes(id) ? '#ef4444' : '#1e3a5f'
  const click = (id: string) => { if (!readonly) onChange(toggle(selecionadas, id)) }

  return (
    <svg viewBox="0 0 120 320" style={{ width: '100%', height: '100%' }}>
      {/* Cabeça */}
      <ellipse cx="60" cy="22" rx="18" ry="20" fill={hl('cabeca_ant')} stroke={stroke('cabeca_ant')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('cabeca_ant')} />
      {/* Cervical */}
      <rect x="52" y="40" width="16" height="14" rx="4" fill={hl('cervical_ant')} stroke={stroke('cervical_ant')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('cervical_ant')} />
      {/* Ombro D */}
      <ellipse cx="28" cy="62" rx="14" ry="10" fill={hl('ombro_d_ant')} stroke={stroke('ombro_d_ant')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('ombro_d_ant')} />
      {/* Ombro E */}
      <ellipse cx="92" cy="62" rx="14" ry="10" fill={hl('ombro_e_ant')} stroke={stroke('ombro_e_ant')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('ombro_e_ant')} />
      {/* Tronco torácico */}
      <rect x="38" y="54" width="44" height="44" rx="6" fill={hl('toracico_ant')} stroke={stroke('toracico_ant')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('toracico_ant')} />
      {/* Cotovelo D */}
      <ellipse cx="16" cy="96" rx="9" ry="8" fill={hl('cotovelo_d')} stroke={stroke('cotovelo_d')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('cotovelo_d')} />
      {/* Cotovelo E */}
      <ellipse cx="104" cy="96" rx="9" ry="8" fill={hl('cotovelo_e')} stroke={stroke('cotovelo_e')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('cotovelo_e')} />
      {/* Abdómen */}
      <rect x="38" y="98" width="44" height="36" rx="4" fill={hl('abdominal')} stroke={stroke('abdominal')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('abdominal')} />
      {/* Lombar anterior */}
      <rect x="38" y="134" width="44" height="20" rx="4" fill={hl('lombar_ant')} stroke={stroke('lombar_ant')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('lombar_ant')} />
      {/* Punho D */}
      <rect x="6" y="118" width="16" height="22" rx="4" fill={hl('punho_d')} stroke={stroke('punho_d')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('punho_d')} />
      {/* Punho E */}
      <rect x="98" y="118" width="16" height="22" rx="4" fill={hl('punho_e')} stroke={stroke('punho_e')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('punho_e')} />
      {/* Anca D */}
      <rect x="38" y="154" width="20" height="22" rx="4" fill={hl('anca_d_ant')} stroke={stroke('anca_d_ant')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('anca_d_ant')} />
      {/* Anca E */}
      <rect x="62" y="154" width="20" height="22" rx="4" fill={hl('anca_e_ant')} stroke={stroke('anca_e_ant')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('anca_e_ant')} />
      {/* Coxa D */}
      <rect x="39" y="176" width="18" height="38" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      {/* Coxa E */}
      <rect x="63" y="176" width="18" height="38" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      {/* Joelho D */}
      <ellipse cx="48" cy="224" rx="11" ry="10" fill={hl('joelho_d_ant')} stroke={stroke('joelho_d_ant')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('joelho_d_ant')} />
      {/* Joelho E */}
      <ellipse cx="72" cy="224" rx="11" ry="10" fill={hl('joelho_e_ant')} stroke={stroke('joelho_e_ant')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('joelho_e_ant')} />
      {/* Perna D */}
      <rect x="40" y="234" width="16" height="36" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      {/* Perna E */}
      <rect x="64" y="234" width="16" height="36" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      {/* Tornozelo D */}
      <rect x="39" y="270" width="18" height="16" rx="4" fill={hl('tornozelo_d')} stroke={stroke('tornozelo_d')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('tornozelo_d')} />
      {/* Tornozelo E */}
      <rect x="63" y="270" width="18" height="16" rx="4" fill={hl('tornozelo_e')} stroke={stroke('tornozelo_e')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('tornozelo_e')} />
      {/* Braços */}
      <rect x="14" y="70" width="12" height="26" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      <rect x="94" y="70" width="12" height="26" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
    </svg>
  )
}

function BodySVGPosterior({ selecionadas, onChange, readonly }: { selecionadas: string[]; onChange: (r: string[]) => void; readonly?: boolean }) {
  const hl = (id: string) => selecionadas.includes(id) ? 'rgba(239,68,68,0.7)' : 'rgba(59,130,246,0.08)'
  const stroke = (id: string) => selecionadas.includes(id) ? '#ef4444' : '#1e3a5f'
  const click = (id: string) => { if (!readonly) onChange(toggle(selecionadas, id)) }

  return (
    <svg viewBox="0 0 120 320" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="60" cy="22" rx="18" ry="20" fill={hl('cabeca_post')} stroke={stroke('cabeca_post')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('cabeca_post')} />
      <rect x="52" y="40" width="16" height="14" rx="4" fill={hl('cervical_post')} stroke={stroke('cervical_post')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('cervical_post')} />
      <ellipse cx="28" cy="62" rx="14" ry="10" fill={hl('ombro_d_post')} stroke={stroke('ombro_d_post')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('ombro_d_post')} />
      <ellipse cx="92" cy="62" rx="14" ry="10" fill={hl('ombro_e_post')} stroke={stroke('ombro_e_post')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('ombro_e_post')} />
      <rect x="38" y="54" width="44" height="40" rx="6" fill={hl('toracico_post')} stroke={stroke('toracico_post')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('toracico_post')} />
      <rect x="14" y="70" width="12" height="26" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      <rect x="94" y="70" width="12" height="26" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      <rect x="38" y="94" width="44" height="36" rx="4" fill={hl('lombar_post')} stroke={stroke('lombar_post')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('lombar_post')} />
      <rect x="38" y="130" width="44" height="24" rx="4" fill={hl('sacro')} stroke={stroke('sacro')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('sacro')} />
      <rect x="38" y="154" width="20" height="22" rx="4" fill={hl('anca_d_post')} stroke={stroke('anca_d_post')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('anca_d_post')} />
      <rect x="62" y="154" width="20" height="22" rx="4" fill={hl('anca_e_post')} stroke={stroke('anca_e_post')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('anca_e_post')} />
      <rect x="39" y="176" width="18" height="38" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      <rect x="63" y="176" width="18" height="38" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      <ellipse cx="48" cy="224" rx="11" ry="10" fill={hl('joelho_d_post')} stroke={stroke('joelho_d_post')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('joelho_d_post')} />
      <ellipse cx="72" cy="224" rx="11" ry="10" fill={hl('joelho_e_post')} stroke={stroke('joelho_e_post')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('joelho_e_post')} />
      <rect x="40" y="234" width="16" height="36" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      <rect x="64" y="234" width="16" height="36" rx="4" fill="rgba(59,130,246,0.04)" stroke="#1a1a2e" strokeWidth="1" />
      <rect x="39" y="270" width="18" height="16" rx="4" fill={hl('calcaneo_d')} stroke={stroke('calcaneo_d')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('calcaneo_d')} />
      <rect x="63" y="270" width="18" height="16" rx="4" fill={hl('calcaneo_e')} stroke={stroke('calcaneo_e')} strokeWidth="1" style={{ cursor: readonly ? 'default' : 'pointer' }} onClick={() => click('calcaneo_e')} />
    </svg>
  )
}

export default function BodyChart({ regioesSelecionadas, onChange, readonly }: Props) {
  const [vista, setVista] = useState<'anterior' | 'posterior'>('anterior')

  const selecionadasAtual = regioesSelecionadas.filter(r => {
    const regiao = REGIOES.find(re => re.id === r)
    return regiao?.vista === vista
  })

  const labels = regioesSelecionadas.map(id => REGIOES.find(r => r.id === id)?.label).filter(Boolean)

  return (
    <div>
      {/* Seletor de vista */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {(['anterior', 'posterior'] as const).map(v => (
          <button key={v} onClick={() => setVista(v)} type="button"
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: vista === v ? '#1d4ed8' : '#0d0d0d', color: vista === v ? '#fff' : '#555', transition: 'all 0.15s' }}>
            {v === 'anterior' ? 'Anterior' : 'Posterior'}
          </button>
        ))}
      </div>

      {/* SVG body */}
      <div style={{ display: 'flex', justifyContent: 'center', background: '#0d0d0d', borderRadius: '12px', border: '1px solid #1e1e1e', padding: '16px' }}>
        <div style={{ width: '140px', height: '375px' }}>
          {vista === 'anterior'
            ? <BodySVGAnterior selecionadas={regioesSelecionadas} onChange={onChange} readonly={readonly} />
            : <BodySVGPosterior selecionadas={regioesSelecionadas} onChange={onChange} readonly={readonly} />
          }
        </div>
      </div>

      {/* Labels das regiões selecionadas */}
      {regioesSelecionadas.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {regioesSelecionadas.map(id => {
            const r = REGIOES.find(re => re.id === id)
            if (!r) return null
            return (
              <span key={id}
                onClick={() => { if (!readonly) onChange(toggle(regioesSelecionadas, id)) }}
                style={{ fontSize: '9px', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: readonly ? 'default' : 'pointer' }}>
                {r.label} ×
              </span>
            )
          })}
        </div>
      )}

      {regioesSelecionadas.length === 0 && !readonly && (
        <p style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '10px', textAlign: 'center' }}>
          Toca numa zona para marcar
        </p>
      )}
    </div>
  )
}