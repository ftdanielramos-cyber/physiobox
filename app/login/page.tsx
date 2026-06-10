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
    if (error) { setError('Email ou password incorretos'); setLoading(false); return }
    window.location.href = '/dashboard'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-page {
          min-height: 100vh;
          background: #030305;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-family: 'Space Mono', monospace;
          overflow: hidden;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 320px;
          padding: 0 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-wrap { margin-bottom: 36px; }
        .logo-img { width: 100px; height: auto; filter: drop-shadow(0 0 16px rgba(59,130,246,0.2)); }

        .form-full { width: 100%; }

        .field-wrap { text-align: center; margin-bottom: 14px; }
        .field-label { font-size: 8px; color: #3b3b5a; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 8px; display: block; text-align: center; }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.02);
          border: 1px solid #1a1a2e;
          border-radius: 2px;
          padding: 13px 16px;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          color: #fff;
          letter-spacing: 0.06em;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
          text-align: center;
        }

        .field-input:focus { border-color: rgba(59,130,246,0.5); background: rgba(59,130,246,0.03); }
        .field-input::placeholder { color: #1e1e30; }

        .error-msg {
          font-size: 9px;
          color: #ef4444;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-login {
          width: 100%;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 2px;
          padding: 15px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-login:hover { background: #2563eb; box-shadow: 0 4px 24px rgba(59,130,246,0.4); transform: translateY(-1px); }
        .btn-login:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .back-link { display: block; margin-top: 20px; font-size: 9px; color: #1e1e30; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; transition: color 0.2s; }
        .back-link:hover { color: #3b82f6; }

        .version { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); font-size: 8px; color: #111; letter-spacing: 0.2em; text-transform: uppercase; white-space: nowrap; }
      `}</style>

      <main className="login-page">
        <div className="grid-bg" />
        <div className="glow" />

        <div className="content">
          <div className="logo-wrap">
            <img src="/logo.png" alt="PhysioBox" className="logo-img" />
          </div>
          <form onSubmit={handleLogin} className="form-full">
            <div className="field-wrap">
              <label className="field-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" required className="field-input" />
            </div>
            <div className="field-wrap">
              <label className="field-label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="field-input" />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-login">
              {loading ? <span className="spinner" /> : 'Entrar'}
            </button>
          </form>
          <a href="/" className="back-link">← Voltar</a>
        </div>

        <div className="version">PhysioBox · 2025</div>
      </main>
    </>
  )
}