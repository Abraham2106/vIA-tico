import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Link, router } from 'expo-router'
import { ensureDemoTrip, getMobileWorkspace } from '../src/composition/expo'
import { DEMO_TRIP } from '@viaticocero/core'
import { formatDisplayDate } from '@viaticocero/ui-tokens'
import { AppEmptyState } from '../src/components/AppEmptyState'
import { FocusablePressable } from '../src/components/FocusablePressable'
import { useAppTheme } from '../src/theme'

export default function HomeScreen() {
  const theme = useAppTheme()
  const [visionStatus, setVisionStatus] = useState('…')

  useEffect(() => {
    void ensureDemoTrip()
    setVisionStatus(getMobileWorkspace().deps.vision.status())
  }, [])

  const styles = makeStyles(theme)

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Capturar</Text>
      <Text style={styles.title}>Viaje {DEMO_TRIP.destination}</Text>
      <Text style={styles.meta}>
        {formatDisplayDate(DEMO_TRIP.startDate)} – {formatDisplayDate(DEMO_TRIP.endDate)}
      </Text>
      <Text style={styles.copy} accessibilityLiveRegion="polite">
        Foto → VisionPsy on-device → revisión → analysis-job al escritorio. Estado del
        adaptador: {visionStatus}. El celular no liquida.
      </Text>
      {visionStatus === 'unavailable' || visionStatus === 'not-wired' ? (
        <AppEmptyState
          title="VisionPsy no está listo"
          subtitle="El adaptador no puede leer comprobantes ahora. Puedes capturar y completar el DTO a mano."
          actionLabel="Capturar de todos modos"
          onAction={() => router.push('/capture')}
        />
      ) : null}
      <Link href="/capture" asChild>
        <FocusablePressable
          style={styles.primary}
          accessibilityRole="button"
          accessibilityLabel="Capturar comprobante"
        >
          <Text style={styles.primaryText}>Capturar comprobante</Text>
        </FocusablePressable>
      </Link>
      <Link href="/preview" asChild>
        <FocusablePressable style={styles.secondary} accessibilityRole="button" accessibilityLabel="Ver preview y enviar">
          <Text style={styles.secondaryText}>Ver preview / enviar</Text>
        </FocusablePressable>
      </Link>
      <Link href="/pairing" asChild>
        <FocusablePressable style={styles.secondary} accessibilityRole="button" accessibilityLabel="Emparejar escritorio">
          <Text style={styles.secondaryText}>Emparejar escritorio</Text>
        </FocusablePressable>
      </Link>
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    wrap: { flex: 1, padding: theme.space[4], gap: theme.space[3], justifyContent: 'center' },
    kicker: {
      color: theme.colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      ...theme.type.caption,
    },
    title: { color: theme.colors.text, ...theme.type.display },
    meta: {
      color: theme.colors.brand,
      fontVariant: ['tabular-nums'],
      ...theme.type.heading,
    },
    copy: { color: theme.colors.muted, marginBottom: 8, ...theme.type.body },
    primary: {
      backgroundColor: theme.colors.interactive,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    primaryText: { color: theme.colors.inverse, textAlign: 'center', ...theme.type.subheading, fontWeight: '600' },
    secondary: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    secondaryText: { color: theme.colors.text, textAlign: 'center', ...theme.type.subheading },
  })
}
