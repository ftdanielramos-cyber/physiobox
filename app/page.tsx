'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const [loadingDemo, setLoadingDemo] = useState(false)
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
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');

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

        /* Grid de fundo */
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

        /* Glow central */
        .glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%);
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

        /* Linhas de scan */
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

        /* Cantos decorativos */
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

        /* Status bar */
        .status-bar {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 9px;
          color: rgba(59,130,246,0.5);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        /* Conteúdo principal */
        .content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 0 24px;
          animation: fadeUp 1s ease forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 9px;
          color: #3b82f6;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 20px;
          border: 1px solid rgba(59,130,246,0.2);
          padding: 6px 14px;
          border-radius: 2px;
          background: rgba(59,130,246,0.05);
          animation: fadeUp 1s ease 0.1s both;
        }

        .tag-line {
          width: 20px;
          height: 1px;
          background: #3b82f6;
        }

        .title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 18vw, 140px);
          color: #fff;
          line-height: 0.9;
          letter-spacing: -2px;
          margin-bottom: 4px;
          animation: fadeUp 1s ease 0.2s both;
          position: relative;
        }

        .title-accent {
          color: transparent;
          -webkit-text-stroke: 1px rgba(59,130,246,0.6);
        }

        .subtitle {
          font-size: 10px;
          color: #3b3b4f;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          margin-bottom: 48px;
          animation: fadeUp 1s ease 0.3s both;
        }

        /* Métricas decorativas */
        .metrics {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-bottom: 48px;
          animation: fadeUp 1s ease 0.4s both;
        }

        .metric {
          text-align: center;
        }

        .metric-val {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }

        .metric-lbl {
          font-size: 8px;
          color: #333;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .metric-sep {
          width: 1px;
          background: #1a1a1a;
          align-self: stretch;
        }

        /* Botão */
        .btn-wrap {
          animation: fadeUp 1s ease 0.5s both;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #3b82f6;
          color: #fff;
          text-decoration: none;
          padding: 16px 40px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border-radius: 2px;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
        }

        .btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.4s;
        }

        .btn:hover::before {
          transform: translateX(100%);
        }

        .btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(59,130,246,0.4);
        }

        .btn-arrow {
          font-size: 16px;
          transition: transform 0.2s;
        }

        .btn-demo {
          background: transparent !important;
          border: 1px solid rgba(59,130,246,0.4) !important;
          color: #3b82f6 !important;
        }

        .btn-demo:hover {
          background: rgba(59,130,246,0.1) !important;
          box-shadow: 0 8px 30px rgba(59,130,246,0.2) !important;
          border-color: rgba(59,130,246,0.8) !important;
        }

        .btn-demo:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn:hover .btn-arrow {
          transform: translateX(4px);
        }

        /* Versão */
        .version {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          color: #222;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* Barras laterais */
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
      `}</style>

      <main className="home">
        <div className="grid-bg" />
        <div className="glow" />
        <div className="scanline" />

        {/* Cantos */}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />



        {/* Barras laterais */}
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

        {/* Conteúdo */}
        <div className="content">
          <div className="tag">
            <div className="tag-line" />
            Performance & Reabilitação
            <div className="tag-line" />
          </div>

          <h1 className="title">
            Physiobox
          </h1>

          <p className="subtitle">Reabilitação & Performance</p>

          <div className="metrics">
            <div className="metric">
              <div className="metric-val">01</div>
              <div className="metric-lbl">Plataforma</div>
            </div>
            <div className="metric-sep" />
            <div className="metric">
              <div className="metric-val">∞</div>
              <div className="metric-lbl">Clientes</div>
            </div>
            <div className="metric-sep" />
            <div className="metric">
              <div className="metric-val">24h</div>
              <div className="metric-lbl">Acesso</div>
            </div>
          </div>

          <div className="btn-wrap">
            <Link href="/login" className="btn">
Entrar
            </Link>
          </div>
        </div>

        <div className="version">PhysioBox v1.0 · 2025</div>
      </main>
    </>
  )
}