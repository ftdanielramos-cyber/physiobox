'use client'

import { useState, useEffect, useCallback } from 'react'
import { translations, type Locale, type TranslationKeys } from './i18n'

const STORAGE_KEY = 'physiobox_locale'

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>('pt')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && ['pt', 'en', 'es'].includes(saved)) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem(STORAGE_KEY, newLocale)
    setLocaleState(newLocale)
    // Força re-render global atualizando o html lang
    document.documentElement.lang = newLocale
  }, [])

  const t: TranslationKeys = translations[locale]

  return { t, locale, setLocale }
}

// Função utilitária para usar fora de componentes React (ex: gerarHTML)
export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'pt'
  return (localStorage.getItem(STORAGE_KEY) as Locale) || 'pt'
}

export function getT(): TranslationKeys {
  return translations[getLocale()]
}