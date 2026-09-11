import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { draftToJob, getDraft } from '../../src/state/draft'
import { ShareFileJobTransport } from '../../src/adapters/driven/transport'
import { HttpJobTransport } from '../../src/adapters/driven/transport'
import { loadPairing } from '../pairing/state'
import { CATEGORY_LABELS, confidenceFill, confidenceTone, formatDisplayDate } from '@viaticocero/ui-tokens'
import { AppEmptyState } from '../../src/components/AppEmptyState'
import { FocusablePressable } from '../../src/components/FocusablePressable'
import { useAppTheme } from '../../src/theme'

export default function PreviewScreen() {
  const theme = useAppTheme()
  const [draft, setDraftView] = useState(getDraft)
  const [job, setJob] = useState(() => draftToJob())
  const [message, setMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const styles = makeStyles(theme)
  useFocusEffect(
    useCallback(() => {
      setDraftView(getDraft())
      setJob(draftToJob())
      void loadPairing()
    }, []),
  )
  const tone = confidenceTone(draft.dto.confianza_lectura)
  const fill = confidenceFill(draft.dto.confianza_lectura)
  const toneColor =
    tone === 'high' ? theme.colors.success : tone === 'medium' ? theme.colors.warning : theme.colors.error

  async function sendShare() {
    setSending(true)
    try {
      const currentJob = draftToJob()
      setJob(currentJob)
      await new ShareFileJobTransport().send(currentJob)
      setMessage('Job listo para compartir')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setSending(false)
    }
  }

  async function sendHttp() {
    const pairing = await loadPairing()
    if (!pairing.inboxUrl) {
      setMessage('Configura inbox URL en Emparejar')
      return
    }
    if (!pairing.pairingCode.trim()) {
      setMessage('Configura el código de emparejamiento en Emparejar')
      return
    }
    setSending(true)
    try {
      const currentJob = draftToJob()
      setJob(currentJob)
      await new HttpJobTransport(pairing.inboxUrl, pairing.pairingCode).send(currentJob)
      setMessage('Enviado al inbox del escritorio')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setSending(false)
    }
  }

  const category = draft.dto.categoria ?? 'otro'

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Revisar gasto</Text>
      <Text style={styles.copy}>
        Esto es lo que el escritorio ingesta. VisionPsy no autoriza; core decide el veredicto.
      </Text>
      {!draft.imagePath ? (
        <AppEmptyState
          title="Sin imagen adjunta"
          subtitle="Captura el comprobante para que VisionPsy lea el ticket. Puedes enviar el DTO igual."
          actionLabel="Ir a capturar"
          onAction={() => router.push('/capture')}
        />
      ) : null}
      <View style={styles.card}>
        <Row k="Proveedor" v={draft.dto.proveedor || '—'} styles={styles} />
        <Row k="Fecha" v={formatDisplayDate(draft.dto.fecha)} styles={styles} />
        <Row k="Monto" v={`${draft.dto.monto} ${draft.dto.moneda}`} styles={styles} tabular />
        <Row k="Categoría" v={CATEGORY_LABELS[category]} styles={styles} />
        {draft.dto.motivo?.trim() ? (
          <Row k="Motivo" v={draft.dto.motivo} styles={styles} />
        ) : null}
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
      {sending ? <ActivityIndicator color={theme.colors.interactive} accessibilityLabel="Enviando job" /> : null}
      <FocusablePressable
        style={styles.primary}
        onPress={() => void sendShare()}
        disabled={sending}
        accessibilityLabel="Compartir JSON"
      >
        <Text style={styles.primaryText}>Compartir JSON</Text>
      </FocusablePressable>
      <FocusablePressable
        style={styles.secondary}
        onPress={() => void sendHttp()}
        disabled={sending}
        accessibilityLabel="Enviar al inbox del escritorio"
      >
        <Text style={styles.secondaryText}>POST al inbox</Text>
      </FocusablePressable>
      {message ? (
        <Text style={styles.meta} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
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
    title: { color: theme.colors.text, ...theme.type.display },
    copy: { color: theme.colors.muted, ...theme.type.body },
    card: {
      backgroundColor: theme.colors.raised,
      borderRadius: theme.radius.lg,
      padding: theme.space[3],
      gap: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.elevation.card,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    k: {
      color: theme.colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      ...theme.type.caption,
    },
    v: { color: theme.colors.text, flexShrink: 1, textAlign: 'right', ...theme.type.body },
    confidence: { gap: 6 },
    track: {
      height: 8,
      borderRadius: 999,
      backgroundColor: theme.colors.sunken,
      overflow: 'hidden',
    },
    fill: { height: 8, borderRadius: 999 },
    hint: { color: theme.colors.tertiary, ...theme.type.bodySmall },
    json: { color: theme.colors.brand, fontFamily: 'monospace', ...theme.type.bodySmall },
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
    meta: { color: theme.colors.warning, ...theme.type.body },
  })
}
