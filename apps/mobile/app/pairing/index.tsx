import { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { DEFAULT_INBOX_URL, getPairing, loadPairing, savePairing } from './state'
import { FocusablePressable } from '../../src/components/FocusablePressable'
import { useAppTheme } from '../../src/theme'

export default function PairingScreen() {
  const theme = useAppTheme()
  const current = getPairing()
  const [code, setCode] = useState(current.pairingCode)
  const [inboxUrl, setInboxUrl] = useState(current.inboxUrl ?? DEFAULT_INBOX_URL)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const styles = makeStyles(theme)

  useEffect(() => {
    void loadPairing().then((loaded) => {
      setCode(loaded.pairingCode)
      setInboxUrl(loaded.inboxUrl ?? DEFAULT_INBOX_URL)
    })
  }, [])

  async function save() {
    setSaved(false)
    setError(null)
    try {
      const persisted = await savePairing({ pairingCode: code, inboxUrl, transport: 'dto' })
      setCode(persisted.pairingCode)
      setInboxUrl(persisted.inboxUrl ?? DEFAULT_INBOX_URL)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el pairing')
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.copy}>
        Emparejamiento de producto: código + URL del inbox. La clave del provider QVAC no se usa
        (ADR 0008).
      </Text>
      <Text style={styles.label}>Código del escritorio</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="210614"
        placeholderTextColor={theme.colors.tertiary}
        accessibilityLabel="Código de emparejamiento del escritorio"
      />
      <Text style={styles.label}>Inbox URL</Text>
      <TextInput
        style={styles.input}
        value={inboxUrl}
        onChangeText={setInboxUrl}
        autoCapitalize="none"
        placeholder="http://192.168.1.10:47821"
        placeholderTextColor={theme.colors.tertiary}
        accessibilityLabel="URL del inbox del escritorio"
      />
      <FocusablePressable
        style={styles.primary}
        onPress={() => void save()}
        accessibilityLabel="Guardar emparejamiento"
      >
        <Text style={styles.primaryText}>Guardar pairing</Text>
      </FocusablePressable>
      {saved ? (
        <Text style={styles.ok} accessibilityLiveRegion="polite">
          Guardado en el dispositivo. El envío usa IJobTransport DTO.
        </Text>
      ) : null}
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    wrap: { flex: 1, padding: theme.space[4], gap: 10 },
    copy: { color: theme.colors.muted, marginBottom: 8, ...theme.type.body },
    label: {
      color: theme.colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      ...theme.type.caption,
    },
    input: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      padding: 12,
      minHeight: 48,
      color: theme.colors.text,
      backgroundColor: theme.colors.sunken,
    },
    primary: {
      backgroundColor: theme.colors.interactive,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      marginTop: 8,
      justifyContent: 'center',
    },
    primaryText: { color: theme.colors.inverse, textAlign: 'center', ...theme.type.subheading, fontWeight: '600' },
    ok: { color: theme.colors.success, ...theme.type.body },
    error: { color: theme.colors.error, ...theme.type.body },
  })
}
