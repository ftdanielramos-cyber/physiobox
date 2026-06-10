'use client'

import { useEffect, useRef, useState } from 'react'

const ITEM_H = 52

type Props = {
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  unidade?: string
}

export default function ScrollPicker({ min, max, value, onChange, unidade }: Props) {
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrolling = useRef(false)
  const scrollTimeout = useRef<any>(null)

  // Scroll para o valor atual quando abre
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const idx = value - min
    el.scrollTop = idx * ITEM_H
  }, [value, min])

  function onScroll() {
    isScrolling.current = true
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      const el = containerRef.current
      if (!el) return
      const idx = Math.round(el.scrollTop / ITEM_H)
      const clamped = Math.min(Math.max(idx, 0), items.length - 1)
      // Snap
      el.scrollTop = clamped * ITEM_H
      onChange(items[clamped])
      isScrolling.current = false
    }, 80)
  }

  return (
    <div style={{ position: 'relative', height: `${ITEM_H * 5}px`, overflow: 'hidden', margin: '0 24px' }}>
      {/* Gradientes topo e fundo */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${ITEM_H * 2}px`, background: 'linear-gradient(to bottom, #111 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${ITEM_H * 2}px`, background: 'linear-gradient(to top, #111 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
      {/* Linha de seleção */}
      <div style={{ position: 'absolute', top: `${ITEM_H * 2}px`, left: 0, right: 0, height: `${ITEM_H}px`, border: '1px solid #2a2a2a', borderLeft: 'none', borderRight: 'none', zIndex: 1, pointerEvents: 'none' }} />

      {/* Lista scrollável */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
      >
        {/* Padding top para centrar primeiro item */}
        <div style={{ height: `${ITEM_H * 2}px` }} />
        {items.map(v => (
          <div
            key={v}
            style={{
              height: `${ITEM_H}px`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              scrollSnapAlign: 'center',
              fontSize: v === value ? '32px' : '22px',
              fontWeight: v === value ? 900 : 400,
              color: v === value ? '#fff' : '#444',
              transition: 'font-size 0.1s, color 0.1s',
              cursor: 'pointer',
              fontVariantNumeric: 'tabular-nums',
            }}
            onClick={() => {
              const el = containerRef.current
              if (el) el.scrollTop = (v - min) * ITEM_H
              onChange(v)
            }}
          >
            {v}{unidade && v === value ? <span style={{ fontSize: '14px', color: '#555', marginLeft: '6px', fontWeight: 600 }}>{unidade}</span> : ''}
          </div>
        ))}
        {/* Padding bottom */}
        <div style={{ height: `${ITEM_H * 2}px` }} />
      </div>
    </div>
  )
}