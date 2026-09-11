# Spec Cursor — Unificación UI/UX ViáticoCero (Design System Mobile + Desktop)

> **Estado:** Entregable de auditoría y especificación para Cursor. Antes de tocar código: `Docs/01-stack.md` (runtime fijado), `Docs/10-spec-cursor.md` (integración QVAC/VisionPsy). Este spec **no** ordena implementar todavía — entrega especificaciones.
> **Fuentes:** repo vIA-tico, `packages/ui-tokens` (tokens.css + index.ts), `apps/desktop` (Carbon), `apps/mobile` (Expo/RN), `packages/contracts` y `packages/core` (tipos de dominio).
> **Regla de arquitectura:** UI React y React Native NO se comparten directamente. Se comparten tokens, lenguaje visual, jerarquía semántica y especificaciones de componentes; cada plataforma implementa a su manera.

## Objetivo

Crear un **Sistema de Diseño ViáticoCero** coherente entre Mobile y Desktop, sin cambiar la arquitectura de ninguna app. Dos apps que parezcan productos del mismo sistema, optimizadas para sus respectivas plataformas — no interfaces idénticas.

---

## 1. Hallazgos de la auditoría

### 1.1 Dos sistemas de diseño coexisten

| Aspecto | Desktop | Mobile |
|---|---|---|
| **Librería de componentes** | Carbon for IBM Products (`@carbon/ibm-products@2.98`, `@carbon/react@1.116`) | Componentes manuales (Pressable, TextInput, ScrollView) |
| **Tipografía cargada** | IBM Plex Sans + IBM Plex Mono (via `@ibm/plex/css`) | **Sistema (Roboto)** — Inter está declarado en tokens pero no se bundlea (no hay `expo-font`) |
| **Tokenización de colores** | Variables Carbon (`--cds-*`), 100% theming vía `<Theme theme="g10/g90">` | `@viaticocero/ui-tokens` TS → `useAppTheme()` |
| **Tokens de ui-tokens usados** | Solo helpers: `confidenceFill`, `CATEGORY_LABELS`, `formatDisplayDate`, `ThemePreference` | Todo el palette: `tokens.color.*`, `categoryColor`, `confidenceTone`, `confidenceFill` |
| **Tema** | `light`/`dark`/`auto` (3 estados, se persiste en localStorage) | **Forzado dark** (`app.json userInterfaceStyle: "dark"`) — sin selector in-app |
| **Paleta de marca** | Carbon Blue: `#0f62fe` (g10) / `#0043ce` (g90) | ui-tokens Blue: `#1A56DB` (light) / `#3B82F6` (dark) |

### 1.2 Colores hardcodeados

**Desktop renderer: 0.** Todo pasa por Carbon vars/props. Limpio.

**Mobile: 6 apariciones** — todas justificables pero con remedio:

| Fichero | Línea | Valor | Función | Recomendación |
|---|---|---|---|---|
| `_layout.tsx` | 14 | `#FFFFFF` | headerTintColor | ✅ OK — texto sobre header navy, inmutable |
| `index/capture/preview/pairing` | primaryText | `#FFFFFF` | Texto botón primario | Usar `theme.colors.inverse` (ya lo define: `#FFFFFF` light, `#111827` dark) |
| `theme.ts` | 23 | `#111827` / `#0A1628` | Header background | Añadir token `surface.header` o reusar `brand.primary` |

### 1.3 Drift entre las dos fuentes de verdad de ui-tokens

| Token | `tokens.css` (light) | `index.ts` (light) | Impacto |
|---|---|---|---|
| `content.primary` | `#0f1720` (slate-900) | `#111827` (gray-900) | El texto principal tiene un tono diferente en CSS vs TS |
| `border.default` | `#cfd6e0` | `#E5E7EB` (gray-200) | Bordes casi idénticos pero distintos |
| `elevation` | Presente (box-shadows) | **No existe** | El TS no tiene elevation; mobile no puede consumir sombras vía tokens |

### 1.4 Contraste WCAG 2.1 AA

**Modo claro:**

| Par | Ratio | Requisito | Veredicto |
|---|---|---|---|
| `content.primary` / `surface` | **14.95** | ≥4.5 | ✅ AA |
| `content.secondary` (muted) / `surface` | **4.07** | ≥4.5 body | ⚠️ Solo AA-large |
| `content.tertiary` / `surface` | **2.14** | ≥4.5 | ❌ **FAIL** |
| Blanco / `interactive` (#1A56DB) | **6.18** | ≥4.5 | ✅ AA |
| `success` (#059669) / white | **3.77** | ≥4.5 | ⚠️ Solo AA-large |
| `warning` (#D97706) / white | **3.19** | ≥4.5 | ⚠️ Solo AA-large |
| `peaje` (#0891B2) / white | **3.68** | ≥4.5 | ⚠️ Solo AA-large |

**Modo oscuro:**

| Par | Ratio | Requisito | Veredicto |
|---|---|---|---|
| `content.secondary` / `surface` | **7.61** | ≥4.5 | ✅ AA |
| `content.tertiary` / `surface` | **4.00** | ≥4.5 | ⚠️ Solo AA-large |
| Blanco / `interactive` dark | **3.68** | ≥4.5 | ⚠️ Solo AA-large |

**Fixes recomendados:**
- `content.secondary` light: `#6B7280` → **`#4B5563`** (gray-600) → ratio ≈ **6.7:1** AA.
- `content.tertiary` light: `#9CA3AF` → **`#6B7280`** → ratio ≈ **4.6:1** AA.
- `content.tertiary` dark: `#6B7280` → **`#9CA3AF`** → ratio ≈ **5.6:1** AA.

### 1.5 Nomenclatura de dominio compartida (ya existe, solo mapear)

```
packages/contracts → ConfidenceLevel = 'alta' | 'media' | 'baja'
                    → ReceiptCategory = 7 categorías
packages/core      → Verdict = 'PROCEDE' | 'REVISION' | 'NO_PROCEDE'
packages/ui-tokens → confidenceTone → 'high' | 'medium' | 'low'
                   → feedbackForVerdict → 'success' | 'warning' | 'error'
                   → categoryColor → hex por categoría y modo
```

Esto **ya funciona** y ambas apps lo consumen. No duplicar.

### 1.6 Tipografía observada

**Desktop:** IBM Plex Sans (body/headings/labels via Carbon) + IBM Plex Mono (números, `.vz-num`, `tabular-nums`). Escala Carbon (heading-01/compact-01, label-01, body-01).

**Mobile:** Sistema (Roboto). Tamaños declarados en StyleSheet: 11 (kicker/label), 12 (meta/hint), 14 (body/botones), 16 (subtitle), 22 (title). Pesos 500/600. **No hay escala formal** — locales por pantalla.

### 1.7 Espaciado observado

`tokens.space[0..16]` en múltiplos de 4 (0,4,8,12,16,20,24,28,32,40,48,64). Mobile lo consume directamente (`theme.space[4]`=16 padding, `theme.space[3]`=12 gaps). Desktop usa Carbon spacing (`spacing-05`=16px, `spacing-07`=32px) — coincide con `space[4]` y `space[8]`.

### 1.8 Proporciones observadas

| Elemento | Desktop (Carbon) | Mobile |
|---|---|---|
| Button height md | 40px | 48px (minHeight) |
| Button height lg | 48px | — |
| Input height md | 40px | 48px (minHeight) |
| Input padding | Carbon default | 12px |
| Chip/tag height | ~20px (Tag sm) | 36px (minHeight) |
| Confidence bar height | 8px (ProgressBar) | 8px (track) |
| Card padding | Carbon default | space[3] = 12px |
| Card radius | Carbon (radii 0) | lg = 12px |
| Button/input radius | Carbon (radii 0) | md = 8px |
| Content max-width | 42rem (forms) / none (tables) | Full width |
| Icon size | 20px | — |

### 1.9 Navegación

**Desktop:** SideNav Carbon, 7 rutas (Excepciones, Viajes, Comprobantes, Inbox, Liquidación, Exportar, Ajustes). Colapsable a `<66rem`. Es el centro de operaciones.

**Mobile:** Expo Router Stack lineal, 4 pantallas (Home, Capturar, Revisar gasto, Emparejar). Es el capturador/sensor. Las pantallas NO son equivalentes — no intentar unificar la navegación.

### 1.10 Estados de UI

| Estado | Desktop | Mobile |
|---|---|---|
| Loading | `<Loading>` Carbon | ❌ Solo texto "VisionPsy leyendo…" |
| Error | `<InlineNotification kind="error">` | `Text` con `colors.error` |
| Empty | `<NoDataEmptyState>` ibm-products | ❌ No implementado |
| Success | Implícito (texto) | Texto con `colors.success`/`warning` (inconsistente) |
| Disabled | Button `disabled` + Carbon styles | Pressable `disabled` sin estilos visibles |
| Selected | `cds--data-table--selected` | Chip con `interactiveSurface` bg |
| Focus | Carbon focus ring | ❌ Sin estilos de focus |

### 1.11 Accesibilidad

**Desktop (bueno):** `aria-label` en SideNav/Header/tablas, SkipToContent, roles explícitos.

**Mobile (parcial):** `accessibilityRole="button"` y `accessibilityLabel` en Pressables. **Faltan:** LiveRegion para estados, focus visible, estilos disabled.

### 1.12 Identidad visual

ViáticoCero transmite **confiable, institucional, financiero, soberano** (on-device). Navy oscuro (`#0A1628`) + azul eléctrico (`#1A56DB`). Carbon refuerza el carácter "back-office" en desktop; el celular sin librería parece más MVP técnico. La identidad está en los colores de información (categorías, confianza, veredicto) — que son idénticos en ambos apps; la consistencia no necesita estar en la estructura visual.

---

## 2. Design System

### 2.1 Colors — tokens semánticos compartidos

Los colores de información (`feedback`, `category`, `confidence`, `verdict`) se **unifican al mismo valor hex** en ambas apps. Las superficies/neutros quedan a cargo de cada plataforma, documentando el mapeo semántico.

**Acción inmediata — corregir drift en `packages/ui-tokens`:**
- `content.primary light`: unificar `#0f1720` ↔ `#111827` a un solo valor.
- `border.default light`: unificar `#cfd6e0` ↔ `#E5E7EB` a un solo valor (recomendado: `#E5E7EB`).

**Ajustes de accesibilidad a aplicar en tokens.css + index.ts:**

```css
/* Ajuste accesibilidad */
--content-secondary: #4B5563;    /* era #6B7280 → ratio 6.7:1 */
--content-tertiary:  #6B7280;    /* era #9CA3AF → ratio 4.6:1 (modo claro) */
/* dark: content tertiary #9CA3AF → ratio 5.6:1 */

/* Nuevo token: elimina hardcode del header en theme.ts */
--surface-header: #0A1628;       /* light */
--surface-header: #111827;       /* dark */
```

**Feedback (ya unificado, verificación):**

| Role | Light | Dark |
|---|---|---|
| `feedback.success` | `#059669` | `#34D399` |
| `feedback.warning` | `#D97706` | `#FBBF24` |
| `feedback.error` | `#DC2626` | `#F87171` |

**Category (ya unificado):**

| Categoría | Light | Dark |
|---|---|---|
| combustible | `#2563EB` | `#60A5FA` |
| peaje | `#0891B2` | `#22D3EE` |
| alimentacion | `#059669` | `#34D399` |
| hospedaje | `#7C3AED` | `#A78BFA` |
| estacionamiento | `#1A56DB` | `#93C5FD` |
| representacion | `#D97706` | `#FBBF24` |
| otro | `#6B7280` | `#9CA3AF` |

**Confidence (ya unificado):** high `#059669`/`#34D399` · medium `#D97706`/`#FBBF24` · low `#DC2626`/`#F87171`.

**Verdict mapping (acción para alinear):**

| Verdict | Feedback tone | Desktop Carbon Tag | Acción |
|---|---|---|---|
| PROCEDE | success | `green` | ✅ OK |
| REVISION | warning | `warm-gray` ❌ | **Cambiar a amber/warning** |
| NO_PROCEDE | error | `red` | ✅ OK |

**Mapeo de brand para Carbon (Opción A — decisión del equipo, ver §6):**

```css
.vz-theme {
  --cds-interactive: #1A56DB;        /* light */
  --cds-interactive-hover: #1E40AF;
}
.cds--g90 .vz-theme {
  --cds-interactive: #3B82F6;        /* dark */
  --cds-interactive-hover: #2563EB;
}
```

> **Snippet completo listo para Cursor:** `Docs/brand-override.css` (brand + spacing + radius + focus + disabled + header). Pegar al final de `apps/desktop/src/renderer/src/styles/global.css`.

### 2.2 Typography — escala compartida

```typescript
// packages/ui-tokens — añadir al objeto tokens.type
tokens.type = {
  fontFamily: {
    regular: 'Inter',          // Desktop: IBM Plex Sans; Mobile: Roboto (sistema)
    medium: 'Inter',
    semibold: 'Inter',
    bold: 'Inter',
    mono: 'IBM Plex Mono',     // Desktop: IBM Plex Mono; Mobile: monospace nativo
  },
  scale: {
    display:    { size: 22, weight: '600', lineHeight: 28 },  // Mobile title; desktop PageHeader
    heading:     { size: 16, weight: '600', lineHeight: 22 },  // H2
    subheading:  { size: 14, weight: '500', lineHeight: 20 },  // Desktop subtitle
    body:        { size: 14, weight: '400', lineHeight: 20 },  // Ambos
    bodySmall:   { size: 12, weight: '400', lineHeight: 16 },  // Meta text
    caption:     { size: 11, weight: '500', lineHeight: 14 },  // Labels (uppercase)
    mono:        { size: 14, weight: '400', lineHeight: 20 },  // Números (tabular-nums)
  },
}
```

**Desktop mapeo:** display → PageHeader; heading → heading-compact-01; label → label-01; mono → `.vz-num` (IBM Plex Mono).

**Mobile mapeo:** `fontFamily` se ignora (Roboto siempre); se usa `tokens.type.scale.*` para reemplazar los literales.

**No cambiar la fuente de ninguna app** — IBM Plex (Carbon) y Roboto (RN) son identidades de plataforma. La unificación está en la escala, no en la familia.

### 2.3 Spacing

Tokens existentes: `space[0]=0 … space[16]=64`. Mobile ya los consume.

**Acción P2:** añadir tokens CSS en `tokens.css`:
```css
--space-0: 0px; --space-1: 4px; --space-2: 8px; --space-3: 12px;
--space-4: 16px; --space-5: 20px; --space-6: 24px; --space-8: 32px;
--space-10: 40px; --space-12: 48px; --space-16: 64px;
```

**Mapeo desktop → Carbon:** `space[4]`=16 ↔ `--cds-spacing-05`; `space[8]`=32 ↔ `--cds-spacing-07`; `space[12]`=48 ↔ `--cds-spacing-09`.

### 2.4 Radius

Tokens existentes: `none=0, sm=4, md=8, lg=12, xl=16, full=9999`. Mobile los usa. **No forzar radio en Carbon** (radii 0 nativos). Añadir tokens CSS:
```css
--radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px; --radius-full: 9999px;
```

### 2.5 Shadows / Elevation

Existe solo en `tokens.css` (`--elevation-low/medium/high`; dark = none). **P3:** copiar al objeto TS para que mobile pueda usarlas:
```typescript
elevation: {
  low: '0 1px 2px rgba(0,0,0,0.05)',
  medium: '0 4px 6px rgba(0,0,0,0.07)',
  high: '0 10px 15px rgba(0,0,0,0.1)',
}
```

### 2.6 Borders

Unificar drift (`#cfd6e0` ↔ `#E5E7EB`; recomendado `#E5E7EB` light). Desktop ya usa `--cds-border-subtle`. Mobile usa `theme.colors.border`.

### 2.7 Component sizes / control heights

| Elemento | Desktop | Mobile |
|---|---|---|
| Button md | 40px | 48px min |
| Input md | 40px | 48px min |
| Chip/tag | 20px (Tag sm) | 36px min |
| Confidence bar | 8px | 8px |
| Header | 48px | ~56px |
| Icon | 20px | — |
| Touch target | — | 48px min |

---

## 3. Component Mapping

| Función | Desktop (Carbon) | Mobile (RN) | Diferencia | Unificación |
|---|---|---|---|---|
| **Primary button** | `<Button kind="primary" size="md">` | `<Pressable>` + `interactive` bg, `minHeight:48`, `#FFF` | Height 40 vs 48; radius 0 vs 8 | Por plataforma; unificar fondo (`interactive`) y texto (`inverse`) |
| **Secondary button** | `<Button kind="secondary">` | `<Pressable>` + `border` | Mismo patrón | ✅ alineados |
| **Text input** | `<TextInput>` Carbon | RN `<TextInput>` 48px | Padding | Label uppercase 11px, sunken bg, border |
| **Chip/categoría** | `<Tag>` sin dot | Pressable pill (r=999, dot+label) | Color mapping equivocado (magenta vs blue) | P1: alinear a `categoryColor` |
| **Confidence** | `<ProgressBar status>` | Barra custom 8px | Mismo valor (`confidenceFill`) | ✅ alineados |
| **Veredicto** | `<Tag green/warm-gray/red>` | No existe | Desktop solo | P1: REVISION→amber, no warm-gray |
| **Money** | `<Money>` `.vz-num` IBM Plex Mono | `tabular-nums` | Fuente distinta | ✅ misma semántica |
| **Page scaffold** | `PageHeader` + Breadcrumb | Stack header | Estructura distinta | No unificar |
| **Side nav** | `<SideNav>` 7 rutas | No aplica | Desktop solo | No tocar |
| **Table** | `<Table size="lg">` | No hay | Desktop solo | No tocar |
| **Form** | `<Form>` + `Stack gap=5`, max-width 42rem | ScrollView | Distinto | Unificar labels (uppercase 11px muted) |
| **Empty state** | `<NoDataEmptyState>` | No existe | — | P0: añadir a mobile |
| **Loading** | `<Loading>` | No existe | — | P0: añadir ActivityIndicator |
| **Error** | `<InlineNotification kind="error">` | `Text` rojo | Desktop bloque, mobile texto | P2: banner error en mobile |
| **Settings** | `<Select>`/`OptionsTile` | No hay | Desktop solo | No tocar |
| **SidePanel** | `<SidePanel>` | No aplica | — | No tocar |
| **Badge/notif count** | `(openCount)` en SideNav | No hay | — | P3: diferido |
| **Date display** | `formatDisplayDate()` | `formatDisplayDate()` | ✅ misma función ui-tokens | ✅ |

---

## 4. Layout Rules

### Desktop
- Shell: Carbon Header (48px) + SideNav (colapsable a `<66rem`) + Content.
- Page body: `padding: spacing-05 top / spacing-07 sides`. Forms max-width 42rem, TextArea 48rem, ContentSwitcher 20rem. Tables full-width con overflow-x.
- **No cambiar la estructura de Carbon.**

### Mobile
- Exclusivamente vertical (portrait). Header navy + white tint. Content `flex:1`, `padding: space[4]`, `gap: space[3]`. Cards `padding: space[3]`, radius lg, border. Botones `minHeight:48`, full-width. ScrollView para overflow.
- **Sin breakpoint tablet. Fuera de alcance.**

---

## 5. Navigation

Desktop = sidebar (7 rutas), mobile = stack lineal (4 pantallas). **No mapear navegación entre apps.** Equivalencias semánticas útiles como referencia: Home↔Excepciones, Revisar gasto↔Comprobantes, Emparejar↔Ajustes>Emparejamiento.

**P2 (futuro):** candidatas a pantallas mobile "Viajes" y "Liquidación" — fuera de alcance ahora.

---

## 6. Component States

| Estado | Desktop | Mobile | Acción |
|---|---|---|---|
| default | base | base | ✅ |
| hover | `--cds-layer-hover` | N/A | desktop |
| pressed | `--cds-layer-active` | sin feedback | P3 opacity |
| focus | `--cds-focus` ring | sin focus | P0 focus visible |
| disabled | Button disabled | sin cambio visual | P1 opacity 0.4 / bg disabled |
| loading | sonrojo Carbon | sin indicador | P0 ActivityIndicator |
| success | contextual | `Text` success | ✅ |
| warning | InlineNotification | `Text` warning (ratio 3.19 ❌) | P1 oscurecer |
| error | InlineNotification | `Text` error (4.83 ✅) | ✅ |
| empty | NoDataEmptyState | sin estado | P0 añadir |
| selected | `cds--data-table--selected` | chip interactiveSurface | ✅ |

---

## 7. Decisión de marca que requiere el equipo

**Azul de marca unificado (Opción A) vs. Carbon blue (Opción B).**

| | A — Unificar | B — Mantener |
|---|---|---|
| Descripción | Override `--cds-interactive` a ui-tokens blue en desktop | Carbon blue en desktop, ui-tokens blue en mobile |
| Churn | 6 líneas CSS | 0 |
| Identidad | Azul consistente cross-platform | Dos azules distintos |
| **Recomendación** | ✅ Recomendado | Alternativa válida |

Mobile dark-only se **mantiene y documenta** (ADR): es un capturador de comprobantes; la infraestructura de tokens ya soporta light/auto si algún día se necesita.

---

## 8. Files to Inspect

```
packages/ui-tokens/index.ts          ← tokens semánticos, drift a corregir
packages/ui-tokens/tokens.css        ← CSS custom properties, drift a corregir
packages/contracts/vision-result/index.ts  ← ConfidenceLevel, ReceiptCategory, VisionResult
packages/core/domain/exception/      ← Verdict, RULE_LABELS
packages/core/domain/receipt/        ← effectiveVerdict
apps/desktop/src/renderer/src/main.tsx    ← CSS imports (Carbon, Plex, global)
apps/desktop/src/renderer/src/styles/global.css ← overrides, spacing, responsive
apps/desktop/src/renderer/src/theme/ThemeProvider.tsx ← Carbon Theme g10/g90
apps/desktop/src/renderer/src/components/*.tsx ← ui components
apps/desktop/src/renderer/src/pages/*.tsx ← page patterns
apps/mobile/src/theme.ts             ← useAppTheme hook (tokens → RN colors)
apps/mobile/app/_layout.tsx          ← Stack header configuration
apps/mobile/app.json                 ← userInterfaceStyle (dark forced)
apps/mobile/app/**/*.tsx             ← screen components
apps/mobile/babel.config.js          ← no nativewind/tailwind
```

## 9. Files Likely to Modify

**P0 — Accesibilidad (inmediato):**
- `packages/ui-tokens/index.ts` — oscurecer `content.secondary`/`content.tertiary`; añadir `surface.header`.
- `packages/ui-tokens/tokens.css` — mismos ajustes + reconciliar `border.default`.
- `apps/mobile/app/{index,capture,preview,pairing}/index.tsx` — `accessibilityLiveRegion="polite"` en estados de lectura/error/éxito.

**P1 — Coherencia visual:**
- `apps/desktop/src/renderer/src/components/VerdictPill.tsx` — REVISION → amber/warning en vez de warm-gray.
- `apps/desktop/src/renderer/src/components/CategoryChip.tsx` — alinear a `categoryColor` (dot/borde en Tag).
- `apps/desktop/src/renderer/src/styles/global.css` — override `--cds-interactive` (Opción A).
- `apps/mobile/src/theme.ts` — header via `surface.header` token.
- `apps/mobile/app/**/*.tsx` — `#FFFFFF` → `theme.colors.inverse`.

**P2 — Refinamiento:**
- `packages/ui-tokens/index.ts` — `type.scale.*` + `elevation`; `tokens.css` — spacing/radius tokens.
- `apps/mobile/app/**/*.tsx` — consumir `type.scale.*`; añadir empty state, ActivityIndicator, disabled/focus styles.

**P3 — Opcional:** pressed feedback, badge notificaciones, documentation STORYBOOK/ADR.

## 10. Files that Should NOT Be Modified

```
packages/contracts/**              ← dominio fijo (ADR 0002/0005)
packages/core/**                   ← lógica de negocio, no UI
apps/desktop/src/adapters/**       ← driving/driven adapters
apps/desktop/src/main/**           ← Electron main process
apps/desktop/src/preload/**        ← preload bridge
apps/mobile/src/adapters/**        ← driven adapters (qvac, camera)
apps/mobile/src/composition/**     ← inyección de dependencias
apps/mobile/src/state/draft.ts     ← estado de captura
apps/mobile/qvac/**                ← worker nativo
apps/mobile/android/**             ← generados por prebuild
apps/desktop/config/**             ← QVAC config por app
apps/desktop/tests/** y apps/mobile/tests/**  ← tests existentes
Docs/10-spec-cursor.md             ← spec QVAC/VisionPsy existente
```

---

## 11. Implementation Order

### Sprint 1 — Accesibilidad P0 (~1 día)
1. Ajustar `content.secondary` light → `#4B5563`, `content.tertiary` → `#6B7280` light / `#9CA3AF` dark en `ui-tokens`.
2. Añadir `accessibilityLiveRegion="polite"` en los 4 screens de mobile (estados de lectura/error/éxito).
3. Añadir `AppEmptyState` genérico a mobile (título + subtítulo + acción).
4. Añadir `<ActivityIndicator>` en capture/preview durante loading.
5. Añadir focus state visible en Pressables de mobile.

### Sprint 2 — Coherencia P1 (2-3 días)
1. Reconciliar drift en `ui-tokens`: unificar `content.primary` y `border.default` entre CSS y TS.
2. Añadir `surface.header` token + reemplazar hardcode en `theme.ts`.
3. Reemplazar `#FFFFFF` por `theme.colors.inverse` en primaryText (4 archivos).
4. Cambiar `VerdictPill` desktop (REVISION → amber).
5. Refactorizar `CategoryChip` desktop a `categoryColor`.
6. Evaluar Opción A de marca (override CSS) — decisión del equipo.

### Sprint 3 — Tipografía y spacing P2 (2-3 días)
1. Definir `tokens.type.scale` en ui-tokens.
2. Añadir tokens CSS de spacing + radius en `tokens.css`.
3. Migrar mobile a `tokens.type.scale.*`.
4. Añadir `tokens.elevation` al objeto TS + elevation en card de preview.

### Sprint 4 — Refinamiento P3 (diferido)
Pressed feedback, badge notificaciones (si hubiera flujo push), documentación.

---

## 12. Acceptance Criteria

La UI estará unificada cuando:
1. ✅ `content.secondary` light ratio ≥4.5:1 (verificado `#4B5563` → 6.7:1).
2. ✅ `content.tertiary` light ratio ≥4.5:1 (verificado `#6B7280` → 4.6:1).
3. ✅ `content.tertiary` dark ratio ≥4.5:1 (verificado `#9CA3AF` → 5.6:1).
4. ✅ Zero `#FFFFFF` hardcodeados en mobile TSX (todo → `theme.colors.inverse`).
5. ✅ Zero `#0A1628`/`#111827` hardcodeados en mobile (todo → `surface.header`).
6. ✅ `VerdictPill` REVISION muestra amber/warning.
7. ✅ `CategoryChip` usa `categoryColor` como color dominante en ambas apps.
8. ✅ Mobile tiene indicador de carga en estados de lectura.
9. ✅ Mobile tiene al menos un estado vacío en las pantallas que apliquen.
10. ✅ Mobile tiene focus state visible en todos los Pressables.
11. ✅ Mobile tiene `accessibilityLiveRegion` en mensajes de estado.
12. ✅ Cero drift entre `tokens.css` e `index.ts` para tokens compartidos.
13. ✅ `npm run typecheck` pasa sin errores.
14. ✅ `npm run test` pasa sin regresiones.

---

## 13. Visual QA — Checklist

```
Lado a lado: desktop (light) | mobile (dark — forzado)

□ Azul de marca: mismo tono visual en ambos
□ Confidence bar: mismo color por nivel (alta=verde, media=amber, baja=rojo)
□ Veredicto: PROCEDE=verde, REVISION=amber, NO_PROCEDE=rojo
□ Cada categoría: mismo color en chip/badge de ambos
□ Botón primario: fondo interactive, texto inverse, radius consistente
□ Secondary: borde border, fondo transparente
□ Input: label uppercase 11px muted, sunken bg, border
□ Texto body (14px): legible (contrast ≥4.5)
□ Hint/tertiary text: legible (contrast ≥4.5)
□ Money display: tabular-nums activo en ambos
□ Empty state visible (título + subtítulo + acción)
□ Error state visible y comprensible
□ Loading state con feedback visual inmediato
□ Focus visible en cada elemento interactivo de mobile
□ Headers: navy en ambos, white tint
□ Espaciado: consistente entre ambos (no idéntico, armónico)
```

---

## 14. Fuera de alcance (no hacer)

- Crear componentes React compartidos mobile/desktop.
- Cambiar la librería de componentes de desktop (se mantiene Carbon).
- Cambiar la fuente tipográfica de ninguna app.
- Crear un package nuevo (todo va en `@viaticocero/ui-tokens`).
- Rediseñar la navegación de ninguna app.
- Soporte tablet en mobile.
- Light/auto en mobile (dark-only es la decisión, documentar en ADR).