'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou password incorretos')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-page {
          min-height: 100vh;
          background: #030305;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          font-family: 'Space Mono', monospace;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }

        .glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        .scanline {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent);
          animation: scan 8s linear infinite;
          pointer-events: none;
        }

        @keyframes scan {
          0% { top: -2px; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        .corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: rgba(59,130,246,0.4);
          border-style: solid;
        }
        .corner-tl { top: 24px; left: 24px; border-width: 2px 0 0 2px; }
        .corner-tr { top: 24px; right: 24px; border-width: 2px 2px 0 0; }
        .corner-bl { bottom: 24px; left: 24px; border-width: 0 0 2px 2px; }
        .corner-br { bottom: 24px; right: 24px; border-width: 0 2px 2px 0; }

        .content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 360px;
          padding: 0 24px;
          animation: fadeUp 0.8s ease forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px;
          color: #fff;
          letter-spacing: 2px;
          line-height: 1;
          margin-bottom: 4px;
          animation: fadeUp 0.8s ease 0.1s both;
        }

        .brand-sub {
          font-size: 9px;
          color: #3b82f6;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 40px;
          animation: fadeUp 0.8s ease 0.2s both;
        }

        .form-panel {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 4px;
          padding: 28px;
          animation: fadeUp 0.8s ease 0.3s both;
          position: relative;
        }

        /* Cantos do painel */
        .panel-corner {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: rgba(59,130,246,0.6);
          border-style: solid;
        }
        .panel-corner-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .panel-corner-tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
        .panel-corner-bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
        .panel-corner-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

        .field-label {
          font-size: 8px;
          color: #3b3b4f;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .field-input {
          width: 100%;
          background: rgba(0,0,0,0.4);
          border: 1px solid #1e1e2e;
          border-radius: 2px;
          padding: 12px 16px;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          color: #fff;
          letter-spacing: 0.1em;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 20px;
        }

        .field-input:focus {
          border-color: rgba(59,130,246,0.5);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
        }

        .field-input::placeholder {
          color: #2a2a3a;
        }

        .error-msg {
          font-size: 9px;
          color: #ef4444;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .error-msg::before {
          content: '!';
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border: 1px solid #ef4444;
          border-radius: 50%;
          font-size: 9px;
          flex-shrink: 0;
        }

        .btn-login {
          width: 100%;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 2px;
          padding: 14px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
        }

        .btn-login::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.4s;
        }

        .btn-login:hover::before { transform: translateX(100%); }
        .btn-login:hover { background: #2563eb; box-shadow: 0 4px 20px rgba(59,130,246,0.4); }
        .btn-login:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-login:disabled::before { display: none; }

        .version {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          color: #1a1a2e;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          white-space: nowrap;
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      <main className="login-page">
        <div className="grid-bg" />
        <div className="glow" />
        <div className="scanline" />

        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div className="content">
          <div className="brand">Physiobox</div>
          <div className="brand-sub">Reabilitação & Performance</div>

          <form onSubmit={handleLogin}>
            <div className="form-panel">
              <div className="panel-corner panel-corner-tl" />
              <div className="panel-corner panel-corner-tr" />
              <div className="panel-corner panel-corner-bl" />
              <div className="panel-corner panel-corner-br" />

              <div>
                <p className="field-label">Email</p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  className="field-input"
                />
              </div>

              <div>
                <p className="field-label">Password</p>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="field-input"
                  style={{ marginBottom: error ? '16px' : '4px' }}
                />
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button type="submit" disabled={loading} className="btn-login">
                {loading ? 'A verificar...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>

        <div className="version">PhysioBox v1.0 · 2025</div>
      </main>
    </>
  )
}