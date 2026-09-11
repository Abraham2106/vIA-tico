import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { RECEIPT_CATEGORIES, type ReceiptCategory } from '@viaticocero/contracts'
import { CATEGORY_LABELS } from '@viaticocero/ui-tokens'
import { ExpoImageCamera, ExpoLibraryPicker } from '../../src/adapters/driven/camera'
import { toQvacAttachmentPath } from '../../src/adapters/driven/filesystem'
import { getMobileWorkspace } from '../../src/composition/expo'
import { getDraft, setDraft } from '../../src/state/draft'
import { FocusablePressable } from '../../src/components/FocusablePressable'
import { useAppTheme } from '../../src/theme'
import type { VisionpsyProfile } from '../../src/adapters/driven/qvac-visionpsy/profile.ts'

export default function CaptureScreen() {
  const theme = useAppTheme()
  const draft = getDraft()
  const [proveedor, setProveedor] = useState(draft.dto.proveedor)
  const [fecha, setFecha] = useState(draft.dto.fecha)
  const [monto, setMonto] = useState(String(draft.dto.monto || ''))
  const [categoria, setCategoria] = useState<ReceiptCategory>(draft.dto.categoria ?? 'alimentacion')
  const [imagePath, setImagePath] = useState(draft.imagePath ?? '')
  const [profile, setProfile] = useState<VisionpsyProfile>('flash')
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const styles = makeStyles(theme)

  async function takePhoto() {
    try {
      const captured = await new ExpoImageCamera().capture()
      setImagePath(captured.path)
      await readWithVision(captured.path)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  async function pickPhoto() {
    try {
      const captured = await new ExpoLibraryPicker().capture()
      setImagePath(captured.path)
      await readWithVision(captured.path)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  async function readWithVision(path: string) {
    setError(null)
    setReading(true)
    try {
      const dto = await getMobileWorkspace().analyzeReceipt({
        imagePath: toQvacAttachmentPath(path),
        profile,
      })
      setProveedor(dto.proveedor)
      setFecha(dto.fecha)
      setMonto(String(dto.monto))
      if (dto.categoria) setCategoria(dto.categoria)
      setDraft({
        imagePath: path,
        dto: { ...getDraft().dto, ...dto },
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'VisionPsy no pudo leer el comprobante. Completa el DTO a mano.',
      )
    } finally {
      setReading(false)
    }
  }

  function goMotive() {
    const current = getDraft().dto
    setDraft({
      imagePath: imagePath || undefined,
      dto: {
        ...current,
        proveedor: proveedor.trim() || current.proveedor || 'Proveedor sin nombre',
        fecha,
        monto: Number(monto) || 0,
        categoria,
        raw_text: current.raw_text || `${proveedor} ${fecha} ${monto}`.trim(),
      },
    })
    router.push('/motive')
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.copy}>
        Centre el comprobante. VisionPsy extrae el DTO en el dispositivo; puedes corregir
        los campos. El modelo no autoriza el gasto.
      </Text>
      <Text style={styles.label}>Perfil VisionPsy</Text>
      <View style={styles.row}>
        <FocusablePressable
          style={[styles.btn, profile === 'flash' && styles.btnSelected]}
          onPress={() => setProfile('flash')}
          accessibilityLabel="Perfil Flash, menor RAM"
        >
          <Text style={styles.btnText}>Flash</Text>
        </FocusablePressable>
        <FocusablePressable
          style={[styles.btn, profile === 'base' && styles.btnSelected]}
          onPress={() => setProfile('base')}
          accessibilityLabel="Perfil Base, ticket denso"
        >
          <Text style={styles.btnText}>Base</Text>
        </FocusablePressable>
      </View>
      <View style={styles.row}>
        <FocusablePressable
          style={styles.btn}
          onPress={() => void takePhoto()}
          disabled={reading}
          accessibilityLabel="Tomar fotografía del comprobante"
        >
          <Text style={styles.btnText}>Cámara</Text>
        </FocusablePressable>
        <FocusablePressable
          style={styles.btn}
          onPress={() => void pickPhoto()}
          disabled={reading}
          accessibilityLabel="Seleccionar imagen de la galería"
        >
          <Text style={styles.btnText}>Galería</Text>
        </FocusablePressable>
      </View>
      {reading ? <ActivityIndicator color={theme.colors.interactive} accessibilityLabel="VisionPsy leyendo" /> : null}
      <Text style={styles.meta} accessibilityLiveRegion="polite">
        {reading ? 'VisionPsy leyendo…' : imagePath ? 'Imagen adjunta' : 'Sin adjunto'}
      </Text>
      <Field label="Proveedor" value={proveedor} onChange={setProveedor} styles={styles} />
      <Field label="Fecha" value={fecha} onChange={setFecha} styles={styles} />
      <Field label="Monto" value={monto} onChange={setMonto} keyboardType="numeric" styles={styles} />
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chips}>
        {RECEIPT_CATEGORIES.map((item) => {
          const selected = categoria === item
          const color = theme.category(item)
          return (
            <FocusablePressable
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
            </FocusablePressable>
          )
        })}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      <FocusablePressable
        style={styles.primary}
        onPress={goMotive}
        accessibilityLabel="Usar estos datos y declarar motivo"
      >
        <Text style={styles.primaryText}>Revisar gasto</Text>
      </FocusablePressable>
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
    copy: { color: theme.colors.muted, ...theme.type.body },
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
    btnSelected: {
      backgroundColor: theme.colors.interactiveSurface,
      borderColor: theme.colors.interactive,
    },
    btnText: { color: theme.colors.text, textAlign: 'center', ...theme.type.subheading },
    meta: { color: theme.colors.brand, ...theme.type.bodySmall },
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
    chipText: { ...theme.type.bodySmall, fontWeight: '500' },
    error: { color: theme.colors.error, ...theme.type.body },
    primary: {
      backgroundColor: theme.colors.interactive,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      marginTop: 8,
      justifyContent: 'center',
    },
    primaryText: { color: theme.colors.inverse, textAlign: 'center', ...theme.type.subheading, fontWeight: '600' },
  })
}
