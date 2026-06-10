'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [loadingLogin, setLoadingLogin] = useState(false)
  const supabase = createClient()

  async function entrarDemo() {
    setLoadingDemo(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@physiobox.app',
      password: 'demo1234',
    })
    if (error) {
      alert('Erro ao entrar em modo demo.')
      setLoadingDemo(false)
      return
    }
    window.location.href = '/dashboard'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .home {
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
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        .scanline {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.25), transparent);
          animation: scan 8s linear infinite;
          pointer-events: none;
        }

        @keyframes scan {
          0% { top: -2px; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        .content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .logo-wrap {
          animation: fadeUp 0.8s ease 0.1s both;
          margin-bottom: 48px;
        }

        .logo-img {
          width: clamp(180px, 40vw, 280px);
          height: auto;
          filter: drop-shadow(0 0 40px rgba(59,130,246,0.3));
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tagline {
          font-size: 9px;
          color: #2a2a4a;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 48px;
          animation: fadeUp 0.8s ease 0.2s both;
        }

        .btn-wrap {
          animation: fadeUp 0.8s ease 0.3s both;
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #3b82f6;
          color: #fff;
          text-decoration: none;
          padding: 15px 36px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border-radius: 2px;
          border: none;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
          cursor: pointer;
          min-width: 130px;
        }

        .btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.4s;
        }

        .btn:hover::before { transform: translateX(100%); }
        .btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(59,130,246,0.4);
        }

        .btn-demo {
          background: transparent;
          border: 1px solid rgba(59,130,246,0.3);
          color: #3b82f6;
        }

        .btn-demo:hover {
          background: rgba(59,130,246,0.08) !important;
          box-shadow: 0 8px 30px rgba(59,130,246,0.15) !important;
          border-color: rgba(59,130,246,0.7) !important;
        }

        .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

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
          background: rgba(59,130,246,0.1);
          border-radius: 1px;
        }

        .side-bar-item.active {
          background: rgba(59,130,246,0.5);
          height: 40px;
        }

        .version {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          color: #1a1a2a;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          white-space: nowrap;
        }
      `}</style>

      <main className="home">
        <div className="grid-bg" />
        <div className="glow" />
        <div className="scanline" />

        <div className="side-bar side-bar-left">
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`side-bar-item ${i === 2 ? 'active' : ''}`} />
          ))}
        </div>
        <div className="side-bar side-bar-right">
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`side-bar-item ${i === 1 ? 'active' : ''}`} />
          ))}
        </div>

        <div className="content">
          <div className="logo-wrap">
            <img src="/logo.png" alt="PhysioBox" className="logo-img" />
          </div>

          <p className="tagline">Performance & Reabilitação</p>

          <div className="btn-wrap">
            <Link href="/login" className="btn" onClick={() => setLoadingLogin(true)}>
              {loadingLogin ? <span className="spinner" /> : 'Entrar'}
            </Link>
            <button onClick={entrarDemo} disabled={loadingDemo} className="btn btn-demo">
              {loadingDemo ? <span className="spinner" /> : 'Ver Demo'}
            </button>
          </div>
        </div>

        <div className="version">PhysioBox · 2025</div>
      </main>
    </>
  )
}