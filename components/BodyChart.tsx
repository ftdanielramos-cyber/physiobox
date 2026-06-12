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

type ZoneProps = {
  id: string
  shape: 'ellipse' | 'path' | 'circle'
  cx?: number; cy?: number; rx?: number; ry?: number; r?: number; d?: string
  selecionadas: string[]
  onToggle: (id: string) => void
  onHover: (id: string | null) => void
  hoverId: string | null
  readonly?: boolean
}

function Zone({ id, shape, cx, cy, rx, ry, r, d, selecionadas, onToggle, onHover, hoverId, readonly }: ZoneProps) {
  const ativo = selecionadas.includes(id)
  const hover = hoverId === id
  const fill = ativo
    ? hover ? 'rgba(239,68,68,0.75)' : 'rgba(239,68,68,0.55)'
    : hover ? 'rgba(59,130,246,0.25)' : 'transparent'
  const stroke = ativo ? '#ef4444' : hover ? '#3b82f6' : 'transparent'
  const strokeW = ativo || hover ? 1.5 : 0

  const props = {
    fill, stroke, strokeWidth: strokeW,
    style: { cursor: readonly ? 'default' : 'pointer', transition: 'fill 0.15s, stroke 0.15s' },
    onClick: () => { if (!readonly) onToggle(id) },
    onMouseEnter: () => { if (!readonly) onHover(id) },
    onMouseLeave: () => onHover(null),
  }

  if (shape === 'ellipse') return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...props} />
  if (shape === 'circle') return <circle cx={cx} cy={cy} r={r} {...props} />
  return <path d={d} {...props} />
}

function BodyAnterior({ selecionadas, onToggle, onHover, hoverId, readonly }: any) {
  const Z = (p: any) => <Zone {...p} selecionadas={selecionadas} onToggle={onToggle} onHover={onHover} hoverId={hoverId} readonly={readonly} />
  return (
    <svg viewBox="0 0 130 430" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Silhueta */}
      <g fill="#141428" stroke="#1e2d50" strokeWidth="0.8">
        {/* Cabeça */}
        <path d="M65 8 C48 8 38 18 38 32 C38 46 48 58 65 60 C82 58 92 46 92 32 C92 18 82 8 65 8Z"/>
        {/* Orelhas */}
        <ellipse cx="38" cy="34" rx="4" ry="6"/>
        <ellipse cx="92" cy="34" rx="4" ry="6"/>
        {/* Pescoço */}
        <path d="M55 58 C55 58 50 62 50 70 L80 70 C80 62 75 58 75 58Z"/>
        {/* Trapézio/ombros */}
        <path d="M20 80 C12 82 6 90 5 102 L5 170 C5 176 8 178 14 178 L26 178 C28 170 28 108 30 100 C32 92 40 86 50 82 L80 82 C90 86 98 92 100 100 C102 108 102 170 104 178 L116 178 C122 178 125 176 125 170 L125 102 C124 90 118 82 110 80 C95 74 80 70 65 70 C50 70 35 74 20 80Z"/>
        {/* Braço D */}
        <path d="M5 102 C2 106 0 114 0 120 L0 170 C0 176 3 180 8 180 L18 180 C20 178 22 172 22 166 L22 114 C20 108 14 102 8 102Z"/>
        {/* Braço E */}
        <path d="M125 102 C128 106 130 114 130 120 L130 170 C130 176 127 180 122 180 L112 180 C110 178 108 172 108 166 L108 114 C110 108 116 102 122 102Z"/>
        {/* Antebraço D */}
        <path d="M1 182 C-1 188 -1 196 0 204 L2 242 C2 248 5 252 10 252 L18 252 C23 252 26 248 26 242 L24 204 C25 196 25 188 23 182Z"/>
        {/* Antebraço E */}
        <path d="M129 182 C131 188 131 196 130 204 L128 242 C128 248 125 252 120 252 L112 252 C107 252 104 248 104 242 L106 204 C105 196 105 188 107 182Z"/>
        {/* Mão D */}
        <path d="M0 254 C-2 260 -1 270 2 278 C5 284 10 288 16 288 C22 288 26 284 26 278 L26 254Z"/>
        {/* Mão E */}
        <path d="M130 254 C132 260 131 270 128 278 C125 284 120 288 114 288 C108 288 104 284 104 278 L104 254Z"/>
        {/* Tronco */}
        <path d="M28 82 L102 82 L106 180 L24 180Z"/>
        {/* Abdómen */}
        <path d="M24 180 L106 180 L104 220 L26 220Z"/>
        {/* Pelvis */}
        <path d="M26 220 C20 222 14 228 12 236 L14 256 C16 264 22 270 32 272 L98 272 C108 270 114 264 116 256 L118 236 C116 228 110 222 104 220Z"/>
        {/* Coxa D */}
        <path d="M30 272 C24 274 20 278 18 284 L14 340 C14 348 18 354 26 356 L48 356 C56 354 60 348 60 340 L56 284 C54 278 50 274 44 272Z"/>
        {/* Coxa E */}
        <path d="M100 272 C106 274 110 278 112 284 L116 340 C116 348 112 354 104 356 L82 356 C74 354 70 348 70 340 L74 284 C76 278 80 274 86 272Z"/>
        {/* Joelho D */}
        <ellipse cx="37" cy="366" rx="14" ry="12"/>
        {/* Joelho E */}
        <ellipse cx="93" cy="366" rx="14" ry="12"/>
        {/* Perna D */}
        <path d="M24 378 C20 380 17 386 16 392 L14 424 C14 430 18 434 24 434 L50 434 C56 434 60 430 60 424 L58 392 C57 386 54 380 50 378Z"/>
        {/* Perna E */}
        <path d="M106 378 C110 380 113 386 114 392 L116 424 C116 430 112 434 106 434 L80 434 C74 434 70 430 70 424 L72 392 C73 386 76 380 80 378Z"/>
        {/* Pé D */}
        <path d="M14 434 C10 436 8 442 8 448 C8 454 12 458 18 460 L52 460 C58 458 62 454 62 448 C62 442 58 436 54 434Z"/>
        {/* Pé E */}
        <path d="M116 434 C120 436 122 442 122 448 C122 454 118 458 112 460 L78 460 C72 458 68 454 68 448 C68 442 72 436 76 434Z"/>
      </g>

      {/* Linhas de detalhe anatómico */}
      <g fill="none" stroke="#2a3a60" strokeWidth="0.5" opacity="0.6">
        {/* Linha peitoral */}
        <path d="M42 100 Q65 108 88 100"/>
        {/* Linha abdominal vertical */}
        <line x1="65" y1="110" x2="65" y2="178"/>
        {/* Linhas abdominais horizontais */}
        <path d="M48 128 Q65 132 82 128"/>
        <path d="M46 148 Q65 152 84 148"/>
        {/* Clavículas */}
        <path d="M50 78 Q65 82 80 78"/>
      </g>

      {/* ZONAS CLICÁVEIS */}
      <Z id="cabeca" shape="path" d="M65 8 C48 8 38 18 38 32 C38 46 48 58 65 60 C82 58 92 46 92 32 C92 18 82 8 65 8Z"/>
      <Z id="cervical" shape="path" d="M53 58 L77 58 L80 70 L50 70Z"/>
      <Z id="ombro_d" shape="ellipse" cx="14" cy="86" rx="16" ry="10"/>
      <Z id="ombro_e" shape="ellipse" cx="116" cy="86" rx="16" ry="10"/>
      <Z id="toracico" shape="path" d="M30 84 L100 84 L102 160 L28 160Z"/>
      <Z id="abdominal" shape="path" d="M28 160 L102 160 L100 220 L30 220Z"/>
      <Z id="lombar" shape="path" d="M30 220 L100 220 L98 272 L32 272Z"/>
      <Z id="braco_d" shape="path" d="M0 104 L22 104 L22 172 L0 172Z"/>
      <Z id="braco_e" shape="path" d="M108 104 L130 104 L130 172 L108 172Z"/>
      <Z id="cotovelo_d" shape="ellipse" cx="11" cy="180" rx="12" ry="9"/>
      <Z id="cotovelo_e" shape="ellipse" cx="119" cy="180" rx="12" ry="9"/>
      <Z id="antebraco_d" shape="path" d="M0 190 L26 190 L26 245 L0 245Z"/>
      <Z id="antebraco_e" shape="path" d="M104 190 L130 190 L130 245 L104 245Z"/>
      <Z id="punho_d" shape="path" d="M-1 250 L27 250 L27 290 L-1 290Z"/>
      <Z id="punho_e" shape="path" d="M103 250 L131 250 L131 290 L103 290Z"/>
      <Z id="anca_d" shape="path" d="M28 272 L65 272 L63 285 L26 285Z"/>
      <Z id="anca_e" shape="path" d="M65 272 L102 272 L104 285 L67 285Z"/>
      <Z id="coxa_d" shape="path" d="M16 285 L58 285 L56 354 L18 354Z"/>
      <Z id="coxa_e" shape="path" d="M72 285 L114 285 L112 354 L74 354Z"/>
      <Z id="joelho_d" shape="ellipse" cx="37" cy="366" rx="14" ry="12"/>
      <Z id="joelho_e" shape="ellipse" cx="93" cy="366" rx="14" ry="12"/>
      <Z id="perna_d" shape="path" d="M15 378 L60 378 L58 432 L17 432Z"/>
      <Z id="perna_e" shape="path" d="M70 378 L115 378 L113 432 L72 432Z"/>
      <Z id="tornozelo_d" shape="path" d="M8 432 L62 432 L64 462 L6 462Z"/>
      <Z id="tornozelo_e" shape="path" d="M68 432 L122 432 L124 462 L66 462Z"/>
    </svg>
  )
}

function BodyPosterior({ selecionadas, onToggle, onHover, hoverId, readonly }: any) {
  const Z = (p: any) => <Zone {...p} selecionadas={selecionadas} onToggle={onToggle} onHover={onHover} hoverId={hoverId} readonly={readonly} />
  return (
    <svg viewBox="0 0 130 430" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <g fill="#141428" stroke="#1e2d50" strokeWidth="0.8">
        <path d="M65 8 C48 8 38 18 38 32 C38 46 48 58 65 60 C82 58 92 46 92 32 C92 18 82 8 65 8Z"/>
        <ellipse cx="38" cy="34" rx="4" ry="6"/>
        <ellipse cx="92" cy="34" rx="4" ry="6"/>
        <path d="M55 58 C55 58 50 62 50 70 L80 70 C80 62 75 58 75 58Z"/>
        <path d="M20 80 C12 82 6 90 5 102 L5 170 C5 176 8 178 14 178 L26 178 C28 170 28 108 30 100 C32 92 40 86 50 82 L80 82 C90 86 98 92 100 100 C102 108 102 170 104 178 L116 178 C122 178 125 176 125 170 L125 102 C124 90 118 82 110 80 C95 74 80 70 65 70 C50 70 35 74 20 80Z"/>
        <path d="M5 102 C2 106 0 114 0 120 L0 170 C0 176 3 180 8 180 L18 180 C20 178 22 172 22 166 L22 114 C20 108 14 102 8 102Z"/>
        <path d="M125 102 C128 106 130 114 130 120 L130 170 C130 176 127 180 122 180 L112 180 C110 178 108 172 108 166 L108 114 C110 108 116 102 122 102Z"/>
        <path d="M1 182 C-1 188 -1 196 0 204 L2 242 C2 248 5 252 10 252 L18 252 C23 252 26 248 26 242 L24 204 C25 196 25 188 23 182Z"/>
        <path d="M129 182 C131 188 131 196 130 204 L128 242 C128 248 125 252 120 252 L112 252 C107 252 104 248 104 242 L106 204 C105 196 105 188 107 182Z"/>
        <path d="M0 254 C-2 260 -1 270 2 278 C5 284 10 288 16 288 C22 288 26 284 26 278 L26 254Z"/>
        <path d="M130 254 C132 260 131 270 128 278 C125 284 120 288 114 288 C108 288 104 284 104 278 L104 254Z"/>
        <path d="M28 82 L102 82 L106 180 L24 180Z"/>
        <path d="M24 180 L106 180 L104 250 L26 250Z"/>
        <path d="M26 250 C20 252 14 258 12 266 L14 284 C16 292 24 296 36 296 L94 296 C106 296 114 292 116 284 L118 266 C116 258 110 252 104 250Z"/>
        <path d="M30 296 C24 298 20 302 18 308 L14 360 C14 368 18 374 26 376 L48 376 C56 374 60 368 60 360 L56 308 C54 302 50 298 44 296Z"/>
        <path d="M100 296 C106 298 110 302 112 308 L116 360 C116 368 112 374 104 376 L82 376 C74 374 70 368 70 360 L74 308 C76 302 80 298 86 296Z"/>
        <ellipse cx="37" cy="384" rx="14" ry="12"/>
        <ellipse cx="93" cy="384" rx="14" ry="12"/>
        <path d="M24 396 C20 398 17 404 16 410 L14 424 C14 430 18 434 24 434 L50 434 C56 434 60 430 60 424 L58 410 C57 404 54 398 50 396Z"/>
        <path d="M106 396 C110 398 113 404 114 410 L116 424 C116 430 112 434 106 434 L80 434 C74 434 70 430 70 424 L72 410 C73 404 76 398 80 396Z"/>
        <path d="M14 434 C10 436 8 442 8 448 C8 454 12 458 18 460 L52 460 C58 458 62 454 62 448 C62 442 58 436 54 434Z"/>
        <path d="M116 434 C120 436 122 442 122 448 C122 454 118 458 112 460 L78 460 C72 458 68 454 68 448 C68 442 72 436 76 434Z"/>
      </g>

      <g fill="none" stroke="#2a3a60" strokeWidth="0.5" opacity="0.6">
        <path d="M40 92 Q65 98 90 92"/>
        <path d="M36 110 Q65 116 94 110"/>
        <line x1="65" y1="118" x2="65" y2="178"/>
        <path d="M32 140 Q65 144 98 140"/>
      </g>

      <Z id="cabeca" shape="path" d="M65 8 C48 8 38 18 38 32 C38 46 48 58 65 60 C82 58 92 46 92 32 C92 18 82 8 65 8Z"/>
      <Z id="cervical" shape="path" d="M53 58 L77 58 L80 70 L50 70Z"/>
      <Z id="ombro_d" shape="ellipse" cx="14" cy="86" rx="16" ry="10"/>
      <Z id="ombro_e" shape="ellipse" cx="116" cy="86" rx="16" ry="10"/>
      <Z id="toracico" shape="path" d="M30 84 L100 84 L102 140 L28 140Z"/>
      <Z id="lombar" shape="path" d="M28 140 L102 140 L100 200 L30 200Z"/>
      <Z id="sacro" shape="path" d="M30 200 L100 200 L98 250 L32 250Z"/>
      <Z id="braco_d" shape="path" d="M0 104 L22 104 L22 172 L0 172Z"/>
      <Z id="braco_e" shape="path" d="M108 104 L130 104 L130 172 L108 172Z"/>
      <Z id="cotovelo_d" shape="ellipse" cx="11" cy="180" rx="12" ry="9"/>
      <Z id="cotovelo_e" shape="ellipse" cx="119" cy="180" rx="12" ry="9"/>
      <Z id="antebraco_d" shape="path" d="M0 190 L26 190 L26 245 L0 245Z"/>
      <Z id="antebraco_e" shape="path" d="M104 190 L130 190 L130 245 L104 245Z"/>
      <Z id="punho_d" shape="path" d="M-1 250 L27 250 L27 290 L-1 290Z"/>
      <Z id="punho_e" shape="path" d="M103 250 L131 250 L131 290 L103 290Z"/>
      <Z id="anca_d" shape="path" d="M28 250 L65 250 L63 268 L26 268Z"/>
      <Z id="anca_e" shape="path" d="M65 250 L102 250 L104 268 L67 268Z"/>
      <Z id="coxa_d" shape="path" d="M16 296 L58 296 L56 374 L18 374Z"/>
      <Z id="coxa_e" shape="path" d="M72 296 L114 296 L112 374 L74 374Z"/>
      <Z id="joelho_d" shape="ellipse" cx="37" cy="384" rx="14" ry="12"/>
      <Z id="joelho_e" shape="ellipse" cx="93" cy="384" rx="14" ry="12"/>
      <Z id="perna_d" shape="path" d="M15 396 L60 396 L58 432 L17 432Z"/>
      <Z id="perna_e" shape="path" d="M70 396 L115 396 L113 432 L72 432Z"/>
      <Z id="tornozelo_d" shape="path" d="M8 432 L62 432 L64 462 L6 462Z"/>
      <Z id="tornozelo_e" shape="path" d="M68 432 L122 432 L124 462 L66 462Z"/>
    </svg>
  )
}

export default function BodyChart({ regioesSelecionadas, onChange, readonly }: Props) {
  const [vista, setVista] = useState<'anterior' | 'posterior'>('anterior')
  const [hoverId, setHoverId] = useState<string | null>(null)

  function handleToggle(id: string) {
    if (!readonly) onChange(toggle(regioesSelecionadas, id))
  }

  const tooltipLabel = hoverId ? REGIOES_LABELS[hoverId] : null

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {(['anterior', 'posterior'] as const).map(v => (
          <button key={v} type="button" onClick={() => setVista(v)}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', background: vista === v ? '#1d4ed8' : '#0d0d0d', color: vista === v ? '#fff' : '#444', transition: 'all 0.15s', borderBottom: vista === v ? '2px solid #3b82f6' : '2px solid transparent' }}>
            {v === 'anterior' ? 'Anterior' : 'Posterior'}
          </button>
        ))}
      </div>

      {/* Corpo */}
      <div style={{ position: 'relative', background: 'linear-gradient(180deg, #06060f 0%, #0a0a1e 100%)', borderRadius: '16px', border: '1px solid #1a2a4a', padding: '24px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Tooltip */}
        <div style={{ height: '22px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {tooltipLabel ? (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', padding: '3px 12px' }}>
              {tooltipLabel}
            </span>
          ) : (
            <span style={{ fontSize: '10px', color: '#2a3a5c', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {readonly ? '' : 'Toca para marcar'}
            </span>
          )}
        </div>

        <div style={{ width: '160px', height: '380px' }}>
          {vista === 'anterior'
            ? <BodyAnterior selecionadas={regioesSelecionadas} onToggle={handleToggle} onHover={setHoverId} hoverId={hoverId} readonly={readonly} />
            : <BodyPosterior selecionadas={regioesSelecionadas} onToggle={handleToggle} onHover={setHoverId} hoverId={hoverId} readonly={readonly} />
          }
        </div>

        {/* Contador */}
        {regioesSelecionadas.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '9px', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            {regioesSelecionadas.length} {regioesSelecionadas.length === 1 ? 'zona marcada' : 'zonas marcadas'}
          </div>
        )}
      </div>

      {/* Tags */}
      {regioesSelecionadas.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {regioesSelecionadas.map(id => (
            <span key={id}
              onClick={() => { if (!readonly) onChange(toggle(regioesSelecionadas, id)) }}
              style={{ fontSize: '9px', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: readonly ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', transition: 'background 0.15s' }}>
              {REGIOES_LABELS[id] || id}
              {!readonly && <span style={{ opacity: 0.5, fontSize: '11px' }}>×</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}