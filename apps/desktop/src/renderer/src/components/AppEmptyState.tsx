import { NoDataEmptyState } from '@carbon/ibm-products'
import { useTheme } from '../theme/ThemeProvider'

export function AppEmptyState({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: { text: string; onClick: () => void }
}) {
  const { carbonTheme } = useTheme()
  return (
    <NoDataEmptyState
      title={title}
      subtitle={subtitle}
      illustrationTheme={carbonTheme === 'g90' ? 'dark' : 'light'}
      action={action}
    />
  )
}
