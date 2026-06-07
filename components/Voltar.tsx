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

      {/* Atalho Dashboard */}
      <button onClick={() => router.push('/dashboard')}
        style={{
          height: '40px', borderRadius: '12px', paddingLeft: '14px', paddingRight: '14px',
          background: '#141414', border: '1px solid #222',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          cursor: 'pointer', color: '#555',
        }}
        aria-label="Menu Principal">
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Dashboard
        </span>
      </button>
    </div>
  )
}