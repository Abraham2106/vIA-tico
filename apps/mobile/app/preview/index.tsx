import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { draftToJob, getDraft } from '../../src/state/draft'
import { ShareFileJobTransport } from '../../src/adapters/driven/transport'
import { HttpJobTransport } from '../../src/adapters/driven/transport'
import { getPairing } from '../pairing/state'

export default function PreviewScreen() {
  const draft = getDraft()
  const job = draftToJob()
  const [message, setMessage] = useState<string | null>(null)

  async function sendShare() {
    try {
      await new ShareFileJobTransport().send(job)
      setMessage('Job listo para compartir')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  async function sendHttp() {
    const pairing = getPairing()
    if (!pairing.inboxUrl) {
      setMessage('Configura inbox URL en Emparejar')
      return
    }
    try {
      await new HttpJobTransport(pairing.inboxUrl).send(job)
      setMessage('Enviado al inbox del escritorio')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>analysis-job</Text>
      <Text style={styles.copy}>
        Esto es lo que el escritorio ingesta. VisionPsy no autoriza; core decide el veredicto.
      </Text>
      <View style={styles.card}>
        <Row k="Proveedor" v={draft.dto.proveedor || '—'} />
        <Row k="Fecha" v={draft.dto.fecha} />
        <Row k="Monto" v={`${draft.dto.monto} ${draft.dto.moneda}`} />
        <Row k="Categoría" v={draft.dto.categoria ?? '—'} />
        <Row k="Confianza" v={draft.dto.confianza_lectura} />
        <Row k="Adjunto" v={draft.imagePath ?? '—'} />
      </View>
      <Text selectable style={styles.json}>
        {JSON.stringify(job, null, 2)}
      </Text>
      <Pressable style={styles.primary} onPress={() => void sendShare()}>
        <Text style={styles.primaryText}>Compartir JSON</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={() => void sendHttp()}>
        <Text style={styles.secondaryText}>POST al inbox</Text>
      </Pressable>
      {message ? <Text style={styles.meta}>{message}</Text> : null}
    </ScrollView>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.k}>{k}</Text>
      <Text style={styles.v}>{v}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 12 },
  title: { color: '#e8eef4', fontSize: 24, fontWeight: '700' },
  copy: { color: '#93a0ae' },
  card: { backgroundColor: '#151c24', borderRadius: 12, padding: 12, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  k: { color: '#93a0ae' },
  v: { color: '#e8eef4', flexShrink: 1, textAlign: 'right' },
  json: { color: '#5ec4b6', fontFamily: 'monospace', fontSize: 12 },
  primary: { backgroundColor: '#3d9b8f', borderRadius: 12, padding: 14 },
  primaryText: { color: '#06221e', fontWeight: '700', textAlign: 'center' },
  secondary: { borderColor: '#2a3542', borderWidth: 1, borderRadius: 12, padding: 14 },
  secondaryText: { color: '#e8eef4', textAlign: 'center' },
  meta: { color: '#e8a54b' },
})
