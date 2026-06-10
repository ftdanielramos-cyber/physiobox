'use client'

import { useEffect, useRef } from 'react'

const ITEM_H = 52
const VISIBLE = 5

type Props = {
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  unidade?: string
}

export default function ScrollPicker({ min, max, value, onChange, unidade }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const snapTimeout = useRef<any>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = (value - min) * ITEM_H
  }, [])  // só na abertura

  function onScroll() {
    if (snapTimeout.current) clearTimeout(snapTimeout.current)
    snapTimeout.current = setTimeout(() => {
      const el = containerRef.current
      if (!el) return
      const idx = Math.round(el.scrollTop / ITEM_H)
      const clamped = Math.min(Math.max(idx, 0), max - min)
      el.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' })
      onChange(min + clamped)
    }, 100)
  }

  const total = max - min + 1

  return (
    <div style={{ position: 'relative', height: `${ITEM_H * VISIBLE}px`, overflow: 'hidden', margin: '0 24px' }}>
      {/* gradientes */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${ITEM_H * 2}px`, background: 'linear-gradient(to bottom, #111, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${ITEM_H * 2}px`, background: 'linear-gradient(to top, #111, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      {/* linha seleção */}
      <div style={{ position: 'absolute', top: `${ITEM_H * 2}px`, left: 0, right: 0, height: `${ITEM_H}px`, borderTop: '1px solid #2a2a2a', borderBottom: '1px solid #2a2a2a', zIndex: 1, pointerEvents: 'none' }} />

      <div ref={containerRef} onScroll={onScroll}
        style={{ height: '100%', overflowY: 'scroll', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <div style={{ height: `${ITEM_H * 2}px` }} />
        {Array.from({ length: total }, (_, i) => {
          const v = min + i
          const isSelected = v === value
          return (
            <div key={v} style={{ height: `${ITEM_H}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isSelected ? '32px' : '20px', fontWeight: isSelected ? 900 : 400, color: isSelected ? '#fff' : '#444', fontVariantNumeric: 'tabular-nums', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => {
                const el = containerRef.current
                if (el) el.scrollTo({ top: i * ITEM_H, behavior: 'smooth' })
                onChange(v)
              }}>
              {v}{isSelected && unidade ? <span style={{ fontSize: '13px', color: '#555', marginLeft: '6px', fontWeight: 600 }}>{unidade}</span> : null}
            </div>
          )
        })}
        <div style={{ height: `${ITEM_H * 2}px` }} />
      </div>
    </div>
  )
}