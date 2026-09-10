import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { draftToJob, getDraft } from '../../src/state/draft'
import { ShareFileJobTransport } from '../../src/adapters/driven/transport'
import { HttpJobTransport } from '../../src/adapters/driven/transport'
import { getPairing } from '../pairing/state'
import { CATEGORY_LABELS, confidenceFill, confidenceTone, formatDisplayDate } from '@viaticocero/ui-tokens'
import { useAppTheme } from '../../src/theme'

export default function PreviewScreen() {
  const theme = useAppTheme()
  const draft = getDraft()
  const job = draftToJob()
  const [message, setMessage] = useState<string | null>(null)
  const styles = makeStyles(theme)
  const tone = confidenceTone(draft.dto.confianza_lectura)
  const fill = confidenceFill(draft.dto.confianza_lectura)
  const toneColor =
    tone === 'high' ? theme.colors.success : tone === 'medium' ? theme.colors.warning : theme.colors.error

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

  const category = draft.dto.categoria ?? 'otro'

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Revisar gasto</Text>
      <Text style={styles.copy}>
        Esto es lo que el escritorio ingesta. VisionPsy no autoriza; core decide el veredicto.
      </Text>
      <View style={styles.card}>
        <Row k="Proveedor" v={draft.dto.proveedor || '—'} styles={styles} />
        <Row k="Fecha" v={formatDisplayDate(draft.dto.fecha)} styles={styles} />
        <Row k="Monto" v={`${draft.dto.monto} ${draft.dto.moneda}`} styles={styles} tabular />
        <Row k="Categoría" v={CATEGORY_LABELS[category]} styles={styles} />
        <View style={styles.confidence}>
          <View style={styles.row}>
            <Text style={styles.k}>Confianza de lectura</Text>
            <Text
              style={styles.v}
              accessibilityLabel={`Confianza de lectura: ${draft.dto.confianza_lectura}`}
            >
              {draft.dto.confianza_lectura}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${fill}%`, backgroundColor: toneColor }]} />
          </View>
          <Text style={styles.hint}>Banda {draft.dto.confianza_lectura} — no es un porcentaje inventado del modelo.</Text>
        </View>
        <Row k="Adjunto" v={draft.imagePath ? 'Imagen adjunta' : 'Sin imagen'} styles={styles} />
      </View>
      <Text selectable style={styles.json}>
        {JSON.stringify(job, null, 2)}
      </Text>
      <Pressable style={styles.primary} onPress={() => void sendShare()} accessibilityLabel="Compartir JSON">
        <Text style={styles.primaryText}>Compartir JSON</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={() => void sendHttp()} accessibilityLabel="Enviar al inbox del escritorio">
        <Text style={styles.secondaryText}>POST al inbox</Text>
      </Pressable>
      {message ? <Text style={styles.meta}>{message}</Text> : null}
    </ScrollView>
  )
}

function Row({
  k,
  v,
  styles,
  tabular,
}: {
  k: string
  v: string
  styles: ReturnType<typeof makeStyles>
  tabular?: boolean
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.k}>{k}</Text>
      <Text style={[styles.v, tabular ? { fontVariant: ['tabular-nums'] } : null]}>{v}</Text>
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    wrap: { padding: theme.space[4], gap: theme.space[3] },
    title: { color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '600' },
    copy: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
    card: {
      backgroundColor: theme.colors.raised,
      borderRadius: theme.radius.lg,
      padding: theme.space[3],
      gap: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    k: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    v: { color: theme.colors.text, flexShrink: 1, textAlign: 'right', fontSize: 14 },
    confidence: { gap: 6 },
    track: {
      height: 8,
      borderRadius: 999,
      backgroundColor: theme.colors.sunken,
      overflow: 'hidden',
    },
    fill: { height: 8, borderRadius: 999 },
    hint: { color: theme.colors.tertiary, fontSize: 12, lineHeight: 16 },
    json: { color: theme.colors.brand, fontFamily: 'monospace', fontSize: 12 },
    primary: {
      backgroundColor: theme.colors.interactive,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    primaryText: { color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },
    secondary: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    secondaryText: { color: theme.colors.text, textAlign: 'center', fontWeight: '500' },
    meta: { color: theme.colors.warning },
  })
}
