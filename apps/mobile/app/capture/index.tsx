import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { RECEIPT_CATEGORIES, type ReceiptCategory } from '@viaticocero/contracts'
import { CATEGORY_LABELS } from '@viaticocero/ui-tokens'
import { ExpoImageCamera, ExpoLibraryPicker } from '../../src/adapters/driven/camera'
import { getDraft, setDraft } from '../../src/state/draft'
import { useAppTheme } from '../../src/theme'

export default function CaptureScreen() {
  const theme = useAppTheme()
  const draft = getDraft()
  const [proveedor, setProveedor] = useState(draft.dto.proveedor)
  const [fecha, setFecha] = useState(draft.dto.fecha)
  const [monto, setMonto] = useState(String(draft.dto.monto || ''))
  const [categoria, setCategoria] = useState<ReceiptCategory>(draft.dto.categoria ?? 'alimentacion')
  const [imagePath, setImagePath] = useState(draft.imagePath ?? '')
  const [error, setError] = useState<string | null>(null)
  const styles = makeStyles(theme)

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
        Centre el comprobante y confirme los datos. VisionPsy aún no está cableado: el DTO puede
        salir de captura manual.
      </Text>
      <View style={styles.row}>
        <Pressable
          style={styles.btn}
          onPress={() => void takePhoto()}
          accessibilityLabel="Tomar fotografía del comprobante"
        >
          <Text style={styles.btnText}>Cámara</Text>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => void pickPhoto()}
          accessibilityLabel="Seleccionar imagen de la galería"
        >
          <Text style={styles.btnText}>Galería</Text>
        </Pressable>
      </View>
      <Text style={styles.meta}>{imagePath ? 'Imagen adjunta' : 'Sin adjunto'}</Text>
      <Field label="Proveedor" value={proveedor} onChange={setProveedor} styles={styles} />
      <Field label="Fecha" value={fecha} onChange={setFecha} styles={styles} />
      <Field label="Monto" value={monto} onChange={setMonto} keyboardType="numeric" styles={styles} />
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chips}>
        {RECEIPT_CATEGORIES.map((item) => {
          const selected = categoria === item
          const color = theme.category(item)
          return (
            <Pressable
              key={item}
              onPress={() => setCategoria(item)}
              accessibilityRole="button"
              accessibilityLabel={`Categoría: ${CATEGORY_LABELS[item]}${selected ? ', seleccionada' : ''}`}
              style={[
                styles.chip,
                selected && { backgroundColor: theme.colors.interactiveSurface, borderColor: color },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={[styles.chipText, { color: selected ? color : theme.colors.text }]}>
                {CATEGORY_LABELS[item]}
              </Text>
            </Pressable>
          )
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={styles.primary}
        onPress={goPreview}
        accessibilityLabel="Usar estos datos y revisar"
      >
        <Text style={styles.primaryText}>Revisar gasto</Text>
      </Pressable>
    </ScrollView>
  )
}

function Field({
  label,
  value,
  onChange,
  keyboardType,
  styles,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  keyboardType?: 'numeric'
  styles: ReturnType<typeof makeStyles>
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, keyboardType === 'numeric' ? { fontVariant: ['tabular-nums'] } : null]}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        accessibilityLabel={label}
      />
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    wrap: { padding: theme.space[4], gap: theme.space[3] },
    copy: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
    row: { flexDirection: 'row', gap: 8 },
    btn: {
      flex: 1,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      padding: 12,
      minHeight: 48,
      justifyContent: 'center',
    },
    btnText: { color: theme.colors.text, textAlign: 'center', fontWeight: '500' },
    meta: { color: theme.colors.brand, fontSize: 12 },
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
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 8,
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dot: { width: 8, height: 8, borderRadius: 999 },
    chipText: { fontSize: 12, fontWeight: '500' },
    error: { color: theme.colors.error },
    primary: {
      backgroundColor: theme.colors.interactive,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      marginTop: 8,
      justifyContent: 'center',
    },
    primaryText: { color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },
  })
}
