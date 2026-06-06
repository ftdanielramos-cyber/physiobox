'use client'

import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/dashboard',
    label: 'Início',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.5"} viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    href: '/clientes',
    label: 'Clientes',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.5"} viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  {
    href: '/calendario',
    label: 'Agenda',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.5"} viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.5"} viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
]

export default function TabBar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/clientes') return pathname.startsWith('/clientes')
    return pathname === href
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#1a1a1a] px-2 pb-6 pt-2 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map(tab => {
          const active = isActive(tab.href)
          return (
            <a key={tab.href} href={tab.href}
              className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition"
              style={{ color: active ? '#3b82f6' : '#444' }}>
              {tab.icon(active)}
              <span className="text-[9px] font-bold uppercase tracking-widest">
                {tab.label}
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}