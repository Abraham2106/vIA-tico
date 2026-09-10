import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { getPairing, setPairing } from './state'

export default function PairingScreen() {
  const current = getPairing()
  const [code, setCode] = useState(current.pairingCode)
  const [inboxUrl, setInboxUrl] = useState(current.inboxUrl ?? '')
  const [saved, setSaved] = useState(false)

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
      <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="210614" placeholderTextColor="#93a0ae" />
      <Text style={styles.label}>Inbox URL</Text>
      <TextInput
        style={styles.input}
        value={inboxUrl}
        onChangeText={setInboxUrl}
        autoCapitalize="none"
        placeholder="http://192.168.1.10:47821"
        placeholderTextColor="#93a0ae"
      />
      <Pressable style={styles.primary} onPress={save}>
        <Text style={styles.primaryText}>Guardar pairing</Text>
      </Pressable>
      {saved ? <Text style={styles.ok}>Guardado. El envío usa IJobTransport DTO.</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 10 },
  copy: { color: '#93a0ae', marginBottom: 8 },
  label: { color: '#93a0ae', fontSize: 12 },
  input: {
    borderColor: '#2a3542',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: '#e8eef4',
    backgroundColor: '#151c24',
  },
  primary: { backgroundColor: '#3d9b8f', borderRadius: 12, padding: 14, marginTop: 8 },
  primaryText: { color: '#06221e', fontWeight: '700', textAlign: 'center' },
  ok: { color: '#5cbf7a' },
})
