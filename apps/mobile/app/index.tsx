import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { ensureDemoTrip, getMobileWorkspace } from '../src/composition/expo'
import { DEMO_TRIP } from '@viaticocero/core'
import { formatDisplayDate } from '@viaticocero/ui-tokens'
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
      <Text style={styles.copy}>
        Foto → VisionPsy on-device → revisión → analysis-job al escritorio. Estado del
        adaptador: {visionStatus}. El celular no liquida.
      </Text>
      <Link href="/capture" asChild>
        <Pressable
          style={styles.primary}
          accessibilityRole="button"
          accessibilityLabel="Capturar comprobante"
        >
          <Text style={styles.primaryText}>Capturar comprobante</Text>
        </Pressable>
      </Link>
      <Link href="/preview" asChild>
        <Pressable style={styles.secondary} accessibilityRole="button" accessibilityLabel="Ver preview y enviar">
          <Text style={styles.secondaryText}>Ver preview / enviar</Text>
        </Pressable>
      </Link>
      <Link href="/pairing" asChild>
        <Pressable style={styles.secondary} accessibilityRole="button" accessibilityLabel="Emparejar escritorio">
          <Text style={styles.secondaryText}>Emparejar escritorio</Text>
        </Pressable>
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
      fontSize: 11,
      fontWeight: '500',
    },
    title: { color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '600' },
    meta: {
      color: theme.colors.brand,
      fontVariant: ['tabular-nums'],
      fontSize: 16,
      fontWeight: '500',
    },
    copy: { color: theme.colors.muted, lineHeight: 20, fontSize: 14, marginBottom: 8 },
    primary: {
      backgroundColor: theme.colors.interactive,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    primaryText: { color: '#FFFFFF', fontWeight: '600', textAlign: 'center', fontSize: 14 },
    secondary: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    secondaryText: { color: theme.colors.text, textAlign: 'center', fontSize: 14, fontWeight: '500' },
  })
}
