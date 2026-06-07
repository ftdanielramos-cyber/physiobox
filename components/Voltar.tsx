'use client'
import { useRouter } from 'next/navigation'

export default function Voltar() {
  const router = useRouter()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      {/* Botão Voltar */}
      <button onClick={() => router.back()}
        style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: '#141414', border: '1px solid #222',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
        }}
        aria-label="Voltar">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
      </button>

      {/* Ícone M em aro — link para dashboard */}
      <button onClick={() => router.push('/dashboard')}
        style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'none', border: '2px solid #eab308',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#eab308',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(234,179,8,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
        aria-label="Menu Inicial">
        <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-1px', lineHeight: 1 }}>M</span>
      </button>
    </div>
  )
}