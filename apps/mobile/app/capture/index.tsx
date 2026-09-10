import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { RECEIPT_CATEGORIES, type ReceiptCategory } from '@viaticocero/contracts'
import { ExpoImageCamera, ExpoLibraryPicker } from '../../src/adapters/driven/camera'
import { getDraft, setDraft } from '../../src/state/draft'

export default function CaptureScreen() {
  const draft = getDraft()
  const [proveedor, setProveedor] = useState(draft.dto.proveedor)
  const [fecha, setFecha] = useState(draft.dto.fecha)
  const [monto, setMonto] = useState(String(draft.dto.monto || ''))
  const [categoria, setCategoria] = useState<ReceiptCategory>(draft.dto.categoria ?? 'alimentacion')
  const [imagePath, setImagePath] = useState(draft.imagePath ?? '')
  const [error, setError] = useState<string | null>(null)

  async function takePhoto() {
    try {
      const captured = await new ExpoImageCamera().capture()
      setImagePath(captured.path)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  async function pickPhoto() {
    try {
      const captured = await new ExpoLibraryPicker().capture()
      setImagePath(captured.path)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  function goPreview() {
    setDraft({
      imagePath: imagePath || undefined,
      dto: {
        ...getDraft().dto,
        proveedor: proveedor.trim() || 'Proveedor sin nombre',
        fecha,
        monto: Number(monto) || 0,
        categoria,
        raw_text: `${proveedor} ${fecha} ${monto}`.trim(),
      },
    })
    router.push('/preview')
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.copy}>
        La foto se guarda como adjunto. El DTO puede salir de VisionPsy (aún no cableado) o de
        captura manual.
      </Text>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={() => void takePhoto()}>
          <Text style={styles.btnText}>Cámara</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => void pickPhoto()}>
          <Text style={styles.btnText}>Galería</Text>
        </Pressable>
      </View>
      <Text style={styles.meta}>{imagePath || 'Sin adjunto'}</Text>
      <Field label="Proveedor" value={proveedor} onChange={setProveedor} />
      <Field label="Fecha YYYY-MM-DD" value={fecha} onChange={setFecha} />
      <Field label="Monto" value={monto} onChange={setMonto} keyboardType="numeric" />
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chips}>
        {RECEIPT_CATEGORIES.map((item) => (
          <Pressable
            key={item}
            onPress={() => setCategoria(item)}
            style={[styles.chip, categoria === item && styles.chipOn]}
          >
            <Text style={styles.chipText}>{item}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.primary} onPress={goPreview}>
        <Text style={styles.primaryText}>Ir a preview</Text>
      </Pressable>
    </ScrollView>
  )
}

function Field({
  label,
  value,
  onChange,
  keyboardType,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  keyboardType?: 'numeric'
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType={keyboardType} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 12 },
  copy: { color: '#93a0ae' },
  row: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, borderColor: '#2a3542', borderWidth: 1, borderRadius: 10, padding: 12 },
  btnText: { color: '#e8eef4', textAlign: 'center' },
  meta: { color: '#5ec4b6', fontSize: 12 },
  label: { color: '#93a0ae', fontSize: 12 },
  input: {
    borderColor: '#2a3542',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: '#e8eef4',
    backgroundColor: '#151c24',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderColor: '#2a3542', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipOn: { backgroundColor: '#1c2530', borderColor: '#3d9b8f' },
  chipText: { color: '#e8eef4', fontSize: 12 },
  error: { color: '#e05d5d' },
  primary: { backgroundColor: '#3d9b8f', borderRadius: 12, padding: 14, marginTop: 8 },
  primaryText: { color: '#06221e', fontWeight: '700', textAlign: 'center' },
})
