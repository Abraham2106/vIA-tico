import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { ensureDemoTrip, getMobileWorkspace } from '../src/composition/expo'
import { DEMO_TRIP } from '@viaticocero/core'

export default function HomeScreen() {
  const [visionStatus, setVisionStatus] = useState('…')

  useEffect(() => {
    void ensureDemoTrip()
    setVisionStatus(getMobileWorkspace().deps.vision.status())
  }, [])

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Captura · no liquida</Text>
      <Text style={styles.title}>Viaje {DEMO_TRIP.destination}</Text>
      <Text style={styles.meta}>
        {DEMO_TRIP.startDate} – {DEMO_TRIP.endDate}
      </Text>
      <Text style={styles.copy}>
        Foto o DTO manual → preview → analysis-job al escritorio. VisionPsy está como puerto (
        {visionStatus}).
      </Text>
      <Link href="/capture" asChild>
        <Pressable style={styles.primary}>
          <Text style={styles.primaryText}>Capturar comprobante</Text>
        </Pressable>
      </Link>
      <Link href="/preview" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Ver preview / enviar</Text>
        </Pressable>
      </Link>
      <Link href="/pairing" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Emparejar escritorio</Text>
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 12, justifyContent: 'center' },
  kicker: { color: '#93a0ae', textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: '#e8eef4', fontSize: 28, fontWeight: '700' },
  meta: { color: '#5ec4b6', fontFamily: 'monospace' },
  copy: { color: '#93a0ae', lineHeight: 20, marginBottom: 8 },
  primary: { backgroundColor: '#3d9b8f', borderRadius: 12, padding: 14 },
  primaryText: { color: '#06221e', fontWeight: '700', textAlign: 'center' },
  secondary: { borderColor: '#2a3542', borderWidth: 1, borderRadius: 12, padding: 14 },
  secondaryText: { color: '#e8eef4', textAlign: 'center' },
})
