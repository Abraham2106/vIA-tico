import { Text, View, StyleSheet } from 'react-native'
import { useAppTheme } from '../theme'
import { FocusablePressable } from './FocusablePressable'

export function AppEmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string
  subtitle: string
  actionLabel?: string
  onAction?: () => void
}) {
  const theme = useAppTheme()
  const styles = makeStyles(theme)

  return (
    <View style={styles.wrap} accessibilityRole="text">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <FocusablePressable
          style={styles.action}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </FocusablePressable>
      ) : null}
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    wrap: {
      backgroundColor: theme.colors.raised,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.lg,
      padding: theme.space[4],
      gap: theme.space[2],
    },
    title: { color: theme.colors.text, ...theme.type.heading },
    subtitle: { color: theme.colors.muted, ...theme.type.body },
    action: {
      marginTop: theme.space[2],
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    actionText: { color: theme.colors.text, textAlign: 'center', ...theme.type.subheading },
  })
}
