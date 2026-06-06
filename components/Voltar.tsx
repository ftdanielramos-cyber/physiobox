'use client'

import { useRouter } from 'next/navigation'

export default function Voltar() {
  const router = useRouter()
  return (
    <button onClick={() => router.back()}
      style={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: '#141414', border: '1px solid #222',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff', marginBottom: '16px'
      }}
      aria-label="Voltar">
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
    </button>
  )
}