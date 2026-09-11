import { forwardRef, useState, type ComponentProps } from 'react'
import { Pressable, type StyleProp, type View, type ViewStyle } from 'react-native'
import { pressedStyle } from '@viaticocero/ui-tokens'
import { useAppTheme } from '../theme'

type Props = ComponentProps<typeof Pressable>

export const FocusablePressable = forwardRef<View, Props>(function FocusablePressable(
  { style, onFocus, onBlur, ...props },
  ref,
) {
  const theme = useAppTheme()
  const [focused, setFocused] = useState(false)

  return (
    <Pressable
      ref={ref}
      {...props}
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={(state) => {
        const resolved = typeof style === 'function' ? style(state) : style
        const ring: StyleProp<ViewStyle> = focused
          ? {
              borderColor: theme.colors.interactive,
              borderWidth: 2,
            }
          : null
        return [resolved, ring, pressedStyle(state.pressed)]
      }}
    />
  )
})
