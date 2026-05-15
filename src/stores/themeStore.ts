import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const body = document.body
  if (theme === 'light') {
    root.classList.add('light')
    body.classList.add('light')
  } else {
    root.classList.remove('light')
    body.classList.remove('light')
  }
}

const getSavedTheme = (): Theme => {
  try {
    return (localStorage.getItem('resumeiq-theme') as Theme) || 'dark'
  } catch {
    return 'dark'
  }
}

export const useThemeStore = create<ThemeState>(() => ({
  theme: getSavedTheme(),
  toggleTheme: () =>
    useThemeStore.setState((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem('resumeiq-theme', next) } catch { /* noop */ }
      applyTheme(next)
      return { theme: next }
    }),
  setTheme: (theme) => {
    try { localStorage.setItem('resumeiq-theme', theme) } catch { /* noop */ }
    applyTheme(theme)
    useThemeStore.setState({ theme })
  },
}))

// Apply theme on initial load
applyTheme(getSavedTheme())

