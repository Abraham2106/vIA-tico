import { useColorScheme, type TextStyle } from 'react-native'
import {
  categoryColor,
  tokens,
  type ColorMode,
} from '@viaticocero/ui-tokens'

function typeRole(role: keyof typeof tokens.type.scale): Pick<TextStyle, 'fontSize' | 'fontWeight' | 'lineHeight'> {
  const step = tokens.type.scale[role]
  return { fontSize: step.size, fontWeight: step.weight, lineHeight: step.lineHeight }
}

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
      header: c.surface.header[mode],
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
    type: {
      display: typeRole('display'),
      heading: typeRole('heading'),
      subheading: typeRole('subheading'),
      body: typeRole('body'),
      bodySmall: typeRole('bodySmall'),
      caption: typeRole('caption'),
      mono: typeRole('mono'),
    },
    elevation: {
      boxShadow: tokens.elevation,
      card:
        mode === 'dark'
          ? {}
          : {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 6,
              elevation: 3,
            },
    },
    category: (key: Parameters<typeof categoryColor>[0]) => categoryColor(key, mode),
  }
}
