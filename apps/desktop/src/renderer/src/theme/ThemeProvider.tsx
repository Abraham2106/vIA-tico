import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Theme } from '@carbon/react'
import { THEME_STORAGE_KEY, type ThemePreference } from '@viaticocero/ui-tokens'

export type CarbonTheme = 'g10' | 'g90'

type ThemeContextValue = {
  preference: ThemePreference
  carbonTheme: CarbonTheme
  setPreference: (value: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function systemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function toCarbon(preference: ThemePreference, dark: boolean): CarbonTheme {
  if (preference === 'light') return 'g10'
  if (preference === 'dark') return 'g90'
  return dark ? 'g90' : 'g10'
}

function readPreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    typeof window === 'undefined' ? 'light' : readPreference(),
  )
  const [dark, setDark] = useState(() => (typeof window === 'undefined' ? false : systemDark()))

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setDark(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [preference])

  const carbonTheme = toCarbon(preference, dark)

  const value = useMemo(
    () => ({
      preference,
      carbonTheme,
      setPreference,
    }),
    [preference, carbonTheme],
  )

  return (
    <ThemeContext.Provider value={value}>
      <Theme theme={carbonTheme} className="vz-theme">
        {children}
      </Theme>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
