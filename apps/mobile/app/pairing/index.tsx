import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { getPairing, setPairing } from './state'
import { useAppTheme } from '../../src/theme'

export default function PairingScreen() {
  const theme = useAppTheme()
  const current = getPairing()
  const [code, setCode] = useState(current.pairingCode)
  const [inboxUrl, setInboxUrl] = useState(current.inboxUrl ?? '')
  const [saved, setSaved] = useState(false)
  const styles = makeStyles(theme)

  function save() {
    setPairing({ pairingCode: code, inboxUrl, transport: 'dto' })
    setSaved(true)
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
      <Pressable style={styles.primary} onPress={save} accessibilityLabel="Guardar emparejamiento">
        <Text style={styles.primaryText}>Guardar pairing</Text>
      </Pressable>
      {saved ? <Text style={styles.ok}>Guardado. El envío usa IJobTransport DTO.</Text> : null}
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    wrap: { flex: 1, padding: theme.space[4], gap: 10 },
    copy: { color: theme.colors.muted, marginBottom: 8, fontSize: 14, lineHeight: 20 },
    label: {
      color: theme.colors.muted,
      fontSize: 11,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
    primaryText: { color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },
    ok: { color: theme.colors.success },
  })
}
