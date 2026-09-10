import { useColorScheme } from 'react-native'
import {
  categoryColor,
  tokens,
  type ColorMode,
} from '@viaticocero/ui-tokens'

export function useAppTheme() {
  const scheme = useColorScheme()
  const mode: ColorMode = scheme === 'dark' ? 'dark' : 'light'
  const c = tokens.color
  return {
    mode,
    colors: {
      surface: c.surface.default[mode],
      raised: c.surface.raised[mode],
      sunken: c.surface.sunken[mode],
      text: c.content.primary[mode],
      muted: c.content.secondary[mode],
      tertiary: c.content.tertiary[mode],
      inverse: c.content.inverse[mode],
      brand: c.content.brand[mode],
      header: mode === 'dark' ? '#111827' : '#0A1628',
      interactive: c.interactive.default[mode],
      interactiveSurface: c.interactive.surface[mode],
      border: c.border.default[mode],
      success: c.feedback.success[mode],
      warning: c.feedback.warning[mode],
      error: c.feedback.error[mode],
      errorBg: c.feedback.errorBg[mode],
    },
    space: tokens.space,
    radius: tokens.radius,
    category: (key: Parameters<typeof categoryColor>[0]) => categoryColor(key, mode),
  }
}
