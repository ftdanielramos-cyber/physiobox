'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [loadingLogin, setLoadingLogin] = useState(false)

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
          background: radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 48px;
        }

        .logo-img {
          width: clamp(300px, 65vw, 460px);
          height: auto;
          filter: drop-shadow(0 0 40px rgba(59,130,246,0.25));
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #3b82f6;
          color: #fff;
          text-decoration: none;
          padding: 16px 56px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          border-radius: 2px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }

        .btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(59,130,246,0.4);
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

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

        <div className="content">
          <img src="/logo.png" alt="PhysioBox" className="logo-img" />
          <Link href="/login" className="btn" onClick={() => setLoadingLogin(true)}>
            {loadingLogin ? <span className="spinner" /> : 'Entrar'}
          </Link>
        </div>

        <div className="version">PhysioBox · 2025</div>
      </main>
    </>
  )
}