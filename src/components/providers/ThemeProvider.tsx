'use client'

import { useEffect, useState, createContext, useContext } from 'react'

type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedTheme: 'light' | 'dark'
}>({ theme: 'light', setTheme: () => {}, resolvedTheme: 'light' })

export function useTheme() {
  return useContext(ThemeContext)
}

/**
 * Enhanced ThemeProvider for Leeds Connect Luminous
 * Enforces 'light' mode as per user request, while maintaining the context 
 * for future seasonal theme expansions via the Admin dashboard.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // We hardcode this to light for now as per "only this mode" requirement
  const [theme] = useState<Theme>('light')
  const [resolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.documentElement
    // Enforce light class on the root
    root.classList.remove('dark')
    root.classList.add('light')
  }, [])

  function setTheme() {
    // No-op for now to prevent manual switching
    console.warn('Manual theme switching is disabled. Leeds Connect uses Luminous Light by default.')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
