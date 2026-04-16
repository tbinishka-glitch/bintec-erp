'use client'

import { useTheme } from '@/components/providers/ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const options: { label: string; value: 'light' | 'dark' | 'system'; icon: string }[] = [
    { label: 'Light', value: 'light', icon: '☀️' },
    { label: 'Dark', value: 'dark', icon: '🌙' },
    { label: 'System', value: 'system', icon: '💻' },
  ]

  return (
    <div className="flex items-center justify-between gap-1 bg-muted rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200 ${
            theme === opt.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>{opt.icon}</span>
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
