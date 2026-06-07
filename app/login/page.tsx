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
          width: 600px;
          height: 600px;
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

        .side-bar {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
        }

        .side-bar-left { left: 24px; }
        .side-bar-right { right: 24px; }

        .side-bar-item {
          width: 2px;
          height: 20px;
          background: rgba(59,130,246,0.15);
          border-radius: 1px;
        }

        .side-bar-item.active {
          background: rgba(59,130,246,0.6);
          height: 40px;
        }

        .content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 340px;
          padding: 0 24px;
          text-align: center;
          animation: fadeUp 0.8s ease forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(60px, 14vw, 90px);
          color: #fff;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: 40px;
          animation: fadeUp 0.8s ease 0.1s both;
        }

        .field-wrap {
          text-align: left;
          margin-bottom: 16px;
          animation: fadeUp 0.8s ease 0.2s both;
        }

        .field-label {
          font-size: 8px;
          color: #3b3b4f;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid #1a1a2e;
          border-bottom: 1px solid #2a2a3e;
          border-radius: 2px;
          padding: 13px 16px;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          color: #fff;
          letter-spacing: 0.08em;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .field-input:focus {
          border-color: rgba(59,130,246,0.5);
          background: rgba(59,130,246,0.04);
        }

        .field-input::placeholder {
          color: #222233;
        }

        .error-msg {
          font-size: 9px;
          color: #ef4444;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 16px;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 6px;
          animation: fadeUp 0.3s ease both;
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
          padding: 15px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          animation: fadeUp 0.8s ease 0.3s both;
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
        .btn-login:hover { background: #2563eb; box-shadow: 0 4px 24px rgba(59,130,246,0.4); transform: translateY(-1px); }
        .btn-login:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .hourglass {
          display: inline-block;
          animation: flipHourglass 1.4s ease-in-out infinite;
        }

        @keyframes flipHourglass {
          0%, 45%   { transform: rotate(0deg); }
          50%, 95%  { transform: rotate(180deg); }
          100%      { transform: rotate(180deg); }
        }

        .back-link {
          display: block;
          margin-top: 20px;
          font-size: 9px;
          color: #2a2a3a;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 0.2s;
          animation: fadeUp 0.8s ease 0.4s both;
        }

        .back-link:hover { color: #3b82f6; }

        .version {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          color: #111;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          white-space: nowrap;
        }
      `}</style>

      <main className="login-page">
        <div className="grid-bg" />
        <div className="glow" />
        <div className="scanline" />

        <div className="side-bar side-bar-left">
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`side-bar-item ${i === 1 ? 'active' : ''}`} />
          ))}
        </div>
        <div className="side-bar side-bar-right">
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`side-bar-item ${i === 3 ? 'active' : ''}`} />
          ))}
        </div>

        <div className="content">
          <div className="brand">Physiobox</div>

          <form onSubmit={handleLogin}>
            <div className="field-wrap">
              <label className="field-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
                className="field-input"
              />
            </div>

            <div className="field-wrap">
              <label className="field-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="field-input"
              />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" disabled={loading} className="btn-login">
              {loading ? <span className="hourglass">⏳</span> : 'Entrar'}
            </button>
          </form>

          <a href="/" className="back-link">← Voltar</a>
        </div>

        <div className="version">PhysioBox v1.0 · 2025</div>
      </main>
    </>
  )
}