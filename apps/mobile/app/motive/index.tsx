import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { getDraft, normalizeMotive, setDraft } from '../../src/state/draft'
import { FocusablePressable } from '../../src/components/FocusablePressable'
import { useAppTheme } from '../../src/theme'

const EXAMPLE_MOTIVES = [
  'Almuerzo con cliente',
  'Combustible del viaje',
  'Compré unas cosas',
] as const

export default function MotiveScreen() {
  const theme = useAppTheme()
  const [motivo, setMotivo] = useState(getDraft().dto.motivo ?? '')
  const styles = makeStyles(theme)
  const empty = !normalizeMotive(motivo)

  function commit(nextMotivo: string) {
    setDraft({ dto: { motivo: nextMotivo } })
    router.push('/preview')
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Text style={styles.copy}>
        El modelo no autoriza el gasto. Esto solo explica el motivo, por ejemplo «almorcé con el
        cliente». Qwen clasifica en el escritorio; el celular no emite veredicto.
      </Text>
      <Text nativeID="motive-label" style={styles.label}>
        Motivo del gasto
      </Text>
      <TextInput
        style={styles.input}
        value={motivo}
        onChangeText={setMotivo}
        multiline
        textAlignVertical="top"
        placeholder="Ej. almorcé con el cliente"
        placeholderTextColor={theme.colors.tertiary}
        accessibilityLabel="Motivo libre del gasto"
        accessibilityLabelledBy="motive-label"
        accessibilityHint="Opcional. Lenguaje natural; vacío es válido."
      />
      <Text style={styles.label}>Ejemplos</Text>
      <View style={styles.chips}>
        {EXAMPLE_MOTIVES.map((example) => {
          const selected = motivo.trim() === example
          return (
            <FocusablePressable
              key={example}
              onPress={() => setMotivo(example)}
              accessibilityRole="button"
              accessibilityLabel={`Ejemplo de motivo: ${example}${selected ? ', seleccionado' : ''}`}
              accessibilityHint="No bloquea. Rellena el campo; puedes editarlo o saltarlo."
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{example}</Text>
            </FocusablePressable>
          )
        })}
      </View>
      <Text style={styles.hint} accessibilityLiveRegion="polite">
        {empty
          ? 'Sin motivo el escritorio puede marcar REVISIÓN (regla de dominio). El celular no decide.'
          : 'El escritorio clasifica este texto. Un motivo vago puede ir a REVISIÓN; no lo decide el teléfono.'}
      </Text>
      <View style={styles.row}>
        <FocusablePressable
          style={styles.secondary}
          onPress={() => commit('')}
          accessibilityRole="button"
          accessibilityLabel="Saltar motivo"
        >
          <Text style={styles.secondaryText}>Saltar</Text>
        </FocusablePressable>
        <FocusablePressable
          style={styles.primary}
          onPress={() => commit(motivo)}
          accessibilityRole="button"
          accessibilityLabel="Continuar a revisión del gasto"
        >
          <Text style={styles.primaryText}>Continuar</Text>
        </FocusablePressable>
      </View>
    </ScrollView>
  )
}

function makeStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    wrap: { padding: theme.space[4], gap: theme.space[3] },
    copy: { color: theme.colors.muted, ...theme.type.body },
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
      minHeight: 120,
      color: theme.colors.text,
      backgroundColor: theme.colors.sunken,
      ...theme.type.body,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      minHeight: 48,
      justifyContent: 'center',
    },
    chipSelected: {
      backgroundColor: theme.colors.interactiveSurface,
      borderColor: theme.colors.interactive,
    },
    chipText: { color: theme.colors.text, ...theme.type.bodySmall, fontWeight: '500' },
    chipTextSelected: { color: theme.colors.brand },
    hint: { color: theme.colors.tertiary, ...theme.type.bodySmall },
    row: { flexDirection: 'row', gap: 8, marginTop: 8 },
    primary: {
      flex: 1,
      backgroundColor: theme.colors.interactive,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    primaryText: { color: theme.colors.inverse, textAlign: 'center', ...theme.type.subheading, fontWeight: '600' },
    secondary: {
      flex: 1,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      padding: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    secondaryText: { color: theme.colors.text, textAlign: 'center', ...theme.type.subheading },
  })
}
