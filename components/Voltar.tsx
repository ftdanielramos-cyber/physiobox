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

      {/* Atalho Menu Inicial */}
      <button onClick={() => router.push('/dashboard')}
        style={{
          height: '40px', borderRadius: '12px', paddingLeft: '14px', paddingRight: '14px',
          background: '#141414', border: '1px solid #222',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          cursor: 'pointer', color: '#555',
        }}
        aria-label="Menu Inicial">
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Menu Inicial
        </span>
      </button>
    </div>
  )
}