'use client'

import { useState } from 'react'

export const REGIOES_LABELS: Record<string, string> = {
  cabeca: 'Cabeça',
  cervical: 'Cervical',
  ombro_d: 'Ombro D',
  ombro_e: 'Ombro E',
  braco_d: 'Braço D',
  braco_e: 'Braço E',
  cotovelo_d: 'Cotovelo D',
  cotovelo_e: 'Cotovelo E',
  antebraco_d: 'Antebraço D',
  antebraco_e: 'Antebraço E',
  punho_d: 'Punho/Mão D',
  punho_e: 'Punho/Mão E',
  toracico: 'Torácico',
  abdominal: 'Abdómen',
  lombar: 'Lombar',
  sacro: 'Sacro/Glúteo',
  anca_d: 'Anca D',
  anca_e: 'Anca E',
  coxa_d: 'Coxa D',
  coxa_e: 'Coxa E',
  joelho_d: 'Joelho D',
  joelho_e: 'Joelho E',
  perna_d: 'Perna D',
  perna_e: 'Perna E',
  tornozelo_d: 'Tornozelo/Pé D',
  tornozelo_e: 'Tornozelo/Pé E',
}

type Props = {
  regioesSelecionadas: string[]
  onChange: (regioes: string[]) => void
  readonly?: boolean
}

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

function Zone({ id, d, cx, cy, r, rx, ry, shape, selecionadas, onClick, readonly }: any) {
  const ativo = selecionadas.includes(id)
  const fill = ativo ? 'rgba(239,68,68,0.55)' : 'transparent'
  const stroke = ativo ? '#ef4444' : 'transparent'
  const style = { cursor: readonly ? 'default' : 'pointer', transition: 'fill 0.15s, stroke 0.15s' }

  if (shape === 'ellipse') return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth="1.5" style={style} onClick={() => !readonly && onClick(id)} />
  if (shape === 'circle') return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth="1.5" style={style} onClick={() => !readonly && onClick(id)} />
  return <path d={d} fill={fill} stroke={stroke} strokeWidth="1.5" style={style} onClick={() => !readonly && onClick(id)} />
}

function SilhuetaAnterior({ selecionadas, onClick, readonly }: { selecionadas: string[], onClick: (id: string) => void, readonly?: boolean }) {
  const Z = (props: any) => <Zone {...props} selecionadas={selecionadas} onClick={onClick} readonly={readonly} />
  return (
    <svg viewBox="0 0 200 520" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Silhueta base */}
      <g fill="#1a1a2e" stroke="#2a3a5c" strokeWidth="1">
        {/* Cabeça */}
        <ellipse cx="100" cy="38" rx="28" ry="34" />
        {/* Pescoço */}
        <rect x="88" y="68" width="24" height="20" rx="4" />
        {/* Tronco */}
        <path d="M62 88 Q55 90 52 100 L48 200 Q50 210 60 212 L140 212 Q150 210 152 200 L148 100 Q145 90 138 88 Z" />
        {/* Braço D */}
        <path d="M62 92 Q44 95 38 120 L32 170 Q30 180 34 185 L46 185 Q50 180 50 170 L56 120 Z" />
        {/* Braço E */}
        <path d="M138 92 Q156 95 162 120 L168 170 Q170 180 166 185 L154 185 Q150 180 150 170 L144 120 Z" />
        {/* Antebraço D */}
        <path d="M34 187 Q28 195 26 220 L24 260 Q24 268 30 270 L44 270 Q50 268 50 260 L48 220 Q46 195 46 187 Z" />
        {/* Antebraço E */}
        <path d="M166 187 Q172 195 174 220 L176 260 Q176 268 170 270 L156 270 Q150 268 150 260 L152 220 Q154 195 154 187 Z" />
        {/* Mão D */}
        <ellipse cx="34" cy="285" rx="12" ry="18" />
        {/* Mão E */}
        <ellipse cx="166" cy="285" rx="12" ry="18" />
        {/* Anca/Pelvis */}
        <path d="M60 212 Q50 215 48 230 L50 255 Q55 265 70 268 L130 268 Q145 265 150 255 L152 230 Q150 215 140 212 Z" />
        {/* Coxa D */}
        <path d="M68 268 L60 340 Q58 355 64 360 L84 360 Q90 355 90 340 L88 268 Z" />
        {/* Coxa E */}
        <path d="M132 268 L140 340 Q142 355 136 360 L116 360 Q110 355 110 340 L112 268 Z" />
        {/* Joelho D */}
        <ellipse cx="74" cy="372" rx="16" ry="14" />
        {/* Joelho E */}
        <ellipse cx="126" cy="372" rx="16" ry="14" />
        {/* Perna D */}
        <path d="M62 384 L58 455 Q57 464 64 466 L84 466 Q91 464 90 455 L86 384 Z" />
        {/* Perna E */}
        <path d="M138 384 L142 455 Q143 464 136 466 L116 466 Q109 464 110 455 L114 384 Z" />
        {/* Pé D */}
        <path d="M58 466 L54 480 Q52 488 60 490 L88 490 Q94 488 92 480 L90 466 Z" />
        {/* Pé E */}
        <path d="M142 466 L146 480 Q148 488 140 490 L112 490 Q106 488 108 480 L110 466 Z" />
      </g>

      {/* Zonas clicáveis */}
      <Z id="cabeca" shape="ellipse" cx="100" cy="38" rx="28" ry="34" />
      <Z id="cervical" shape="path" d="M88 68 Q100 72 112 68 L112 88 Q100 92 88 88 Z" />
      <Z id="ombro_d" shape="ellipse" cx="52" cy="96" rx="18" ry="12" />
      <Z id="ombro_e" shape="ellipse" cx="148" cy="96" rx="18" ry="12" />
      <Z id="toracico" shape="path" d="M64 92 L136 92 L140 170 L60 170 Z" />
      <Z id="abdominal" shape="path" d="M60 170 L140 170 L138 212 L62 212 Z" />
      <Z id="braco_d" shape="path" d="M38 100 L56 100 L54 170 L36 170 Z" />
      <Z id="braco_e" shape="path" d="M144 100 L162 100 L164 170 L146 170 Z" />
      <Z id="cotovelo_d" shape="ellipse" cx="40" cy="183" rx="12" ry="10" />
      <Z id="cotovelo_e" shape="ellipse" cx="160" cy="183" rx="12" ry="10" />
      <Z id="antebraco_d" shape="path" d="M28 193 L50 193 L50 260 L28 260 Z" />
      <Z id="antebraco_e" shape="path" d="M150 193 L172 193 L172 260 L150 260 Z" />
      <Z id="punho_d" shape="ellipse" cx="34" cy="285" rx="12" ry="18" />
      <Z id="punho_e" shape="ellipse" cx="166" cy="285" rx="12" ry="18" />
      <Z id="lombar" shape="path" d="M62 212 L138 212 L136 255 L64 255 Z" />
      <Z id="anca_d" shape="path" d="M64 255 L100 255 L98 268 L60 268 Z" />
      <Z id="anca_e" shape="path" d="M100 255 L136 255 L140 268 L102 268 Z" />
      <Z id="coxa_d" shape="path" d="M60 268 L90 268 L88 358 L62 358 Z" />
      <Z id="coxa_e" shape="path" d="M110 268 L140 268 L138 358 L112 358 Z" />
      <Z id="joelho_d" shape="ellipse" cx="74" cy="372" rx="16" ry="14" />
      <Z id="joelho_e" shape="ellipse" cx="126" cy="372" rx="16" ry="14" />
      <Z id="perna_d" shape="path" d="M60 386 L88 386 L86 458 L62 458 Z" />
      <Z id="perna_e" shape="path" d="M112 386 L140 386 L138 458 L114 458 Z" />
      <Z id="tornozelo_d" shape="path" d="M56 458 L90 458 L92 492 L54 492 Z" />
      <Z id="tornozelo_e" shape="path" d="M110 458 L144 458 L146 492 L108 492 Z" />
    </svg>
  )
}

function SilhuetaPosterior({ selecionadas, onClick, readonly }: { selecionadas: string[], onClick: (id: string) => void, readonly?: boolean }) {
  const Z = (props: any) => <Zone {...props} selecionadas={selecionadas} onClick={onClick} readonly={readonly} />
  return (
    <svg viewBox="0 0 200 520" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <g fill="#1a1a2e" stroke="#2a3a5c" strokeWidth="1">
        <ellipse cx="100" cy="38" rx="28" ry="34" />
        <rect x="88" y="68" width="24" height="20" rx="4" />
        <path d="M62 88 Q55 90 52 100 L48 200 Q50 210 60 212 L140 212 Q150 210 152 200 L148 100 Q145 90 138 88 Z" />
        <path d="M62 92 Q44 95 38 120 L32 170 Q30 180 34 185 L46 185 Q50 180 50 170 L56 120 Z" />
        <path d="M138 92 Q156 95 162 120 L168 170 Q170 180 166 185 L154 185 Q150 180 150 170 L144 120 Z" />
        <path d="M34 187 Q28 195 26 220 L24 260 Q24 268 30 270 L44 270 Q50 268 50 260 L48 220 Q46 195 46 187 Z" />
        <path d="M166 187 Q172 195 174 220 L176 260 Q176 268 170 270 L156 270 Q150 268 150 260 L152 220 Q154 195 154 187 Z" />
        <ellipse cx="34" cy="285" rx="12" ry="18" />
        <ellipse cx="166" cy="285" rx="12" ry="18" />
        <path d="M60 212 Q50 215 48 230 L50 255 Q55 265 70 268 L130 268 Q145 265 150 255 L152 230 Q150 215 140 212 Z" />
        <path d="M68 268 L60 340 Q58 355 64 360 L84 360 Q90 355 90 340 L88 268 Z" />
        <path d="M132 268 L140 340 Q142 355 136 360 L116 360 Q110 355 110 340 L112 268 Z" />
        <ellipse cx="74" cy="372" rx="16" ry="14" />
        <ellipse cx="126" cy="372" rx="16" ry="14" />
        <path d="M62 384 L58 455 Q57 464 64 466 L84 466 Q91 464 90 455 L86 384 Z" />
        <path d="M138 384 L142 455 Q143 464 136 466 L116 466 Q109 464 110 455 L114 384 Z" />
        <path d="M58 466 L54 480 Q52 488 60 490 L88 490 Q94 488 92 480 L90 466 Z" />
        <path d="M142 466 L146 480 Q148 488 140 490 L112 490 Q106 488 108 480 L110 466 Z" />
      </g>

      <Z id="cabeca" shape="ellipse" cx="100" cy="38" rx="28" ry="34" />
      <Z id="cervical" shape="path" d="M88 68 Q100 72 112 68 L112 88 Q100 92 88 88 Z" />
      <Z id="ombro_d" shape="ellipse" cx="52" cy="96" rx="18" ry="12" />
      <Z id="ombro_e" shape="ellipse" cx="148" cy="96" rx="18" ry="12" />
      <Z id="toracico" shape="path" d="M64 92 L136 92 L140 155 L60 155 Z" />
      <Z id="lombar" shape="path" d="M60 155 L140 155 L138 212 L62 212 Z" />
      <Z id="braco_d" shape="path" d="M38 100 L56 100 L54 170 L36 170 Z" />
      <Z id="braco_e" shape="path" d="M144 100 L162 100 L164 170 L146 170 Z" />
      <Z id="cotovelo_d" shape="ellipse" cx="40" cy="183" rx="12" ry="10" />
      <Z id="cotovelo_e" shape="ellipse" cx="160" cy="183" rx="12" ry="10" />
      <Z id="antebraco_d" shape="path" d="M28 193 L50 193 L50 260 L28 260 Z" />
      <Z id="antebraco_e" shape="path" d="M150 193 L172 193 L172 260 L150 260 Z" />
      <Z id="punho_d" shape="ellipse" cx="34" cy="285" rx="12" ry="18" />
      <Z id="punho_e" shape="ellipse" cx="166" cy="285" rx="12" ry="18" />
      <Z id="sacro" shape="path" d="M62 212 L138 212 L136 268 L64 268 Z" />
      <Z id="anca_d" shape="path" d="M64 268 L100 268 L98 290 L60 290 Z" />
      <Z id="anca_e" shape="path" d="M100 268 L136 268 L140 290 L102 290 Z" />
      <Z id="coxa_d" shape="path" d="M60 290 L90 290 L88 358 L62 358 Z" />
      <Z id="coxa_e" shape="path" d="M110 290 L140 290 L138 358 L112 358 Z" />
      <Z id="joelho_d" shape="ellipse" cx="74" cy="372" rx="16" ry="14" />
      <Z id="joelho_e" shape="ellipse" cx="126" cy="372" rx="16" ry="14" />
      <Z id="perna_d" shape="path" d="M60 386 L88 386 L86 458 L62 458 Z" />
      <Z id="perna_e" shape="path" d="M112 386 L140 386 L138 458 L114 458 Z" />
      <Z id="tornozelo_d" shape="path" d="M56 458 L90 458 L92 492 L54 492 Z" />
      <Z id="tornozelo_e" shape="path" d="M110 458 L144 458 L146 492 L108 492 Z" />
    </svg>
  )
}

export default function BodyChart({ regioesSelecionadas, onChange, readonly }: Props) {
  const [vista, setVista] = useState<'anterior' | 'posterior'>('anterior')

  function handleClick(id: string) {
    if (!readonly) onChange(toggle(regioesSelecionadas, id))
  }

  return (
    <div>
      {/* Toggle vista */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {(['anterior', 'posterior'] as const).map(v => (
          <button key={v} type="button" onClick={() => setVista(v)}
            style={{ flex: 1, padding: '9px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', background: vista === v ? '#1d4ed8' : '#0d0d0d', color: vista === v ? '#fff' : '#444', transition: 'all 0.15s' }}>
            {v === 'anterior' ? '▶ Anterior' : '◀ Posterior'}
          </button>
        ))}
      </div>

      {/* Silhueta */}
      <div style={{ display: 'flex', justifyContent: 'center', background: 'linear-gradient(180deg, #080818 0%, #0a0a1a 100%)', borderRadius: '16px', border: '1px solid #1a2a4a', padding: '20px 0', position: 'relative' }}>
        {/* Indicador de zonas */}
        {!readonly && regioesSelecionadas.length === 0 && (
          <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', fontSize: '9px', color: '#2a3a5c', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Toca para marcar zona
          </div>
        )}
        <div style={{ width: '160px', height: '420px' }}>
          {vista === 'anterior'
            ? <SilhuetaAnterior selecionadas={regioesSelecionadas} onClick={handleClick} readonly={readonly} />
            : <SilhuetaPosterior selecionadas={regioesSelecionadas} onClick={handleClick} readonly={readonly} />
          }
        </div>
      </div>

      {/* Tags das regiões selecionadas */}
      {regioesSelecionadas.length > 0 && (
        <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {regioesSelecionadas.map(id => (
            <span key={id}
              onClick={() => { if (!readonly) onChange(toggle(regioesSelecionadas, id)) }}
              style={{ fontSize: '9px', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '20px', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: readonly ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {REGIOES_LABELS[id] || id}
              {!readonly && <span style={{ opacity: 0.6 }}>×</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}