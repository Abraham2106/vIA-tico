# 09 — UI/UX: sistema «Datos primero»

Fecha: 2026-09-10  
Estado: **Aplicado**. Desktop = Carbon + IBM Products. Móvil = tokens.  
ADR: [0014](./adr/0014-design-system-datos-primero.md)

## Qué se adopta y qué no

La investigación proponía un design system para una app única de viáticos (tabs Capturar / Liquidar / Perfil, estados «Aprobado», categorías genéricas, FAB de nueva liquidación). **ViáticoCero no es esa app.**

| Investigación | Producto (tesis + cuña) |
| --- | --- |
| 3 tabs móviles: Capturar, Liquidar, Perfil | Móvil **solo captura** (ADR 0011). Escritorio liquida y es el centro de excepciones |
| Estados Aprobado / Pendiente | Dominio `PROCEDE` / `REVISIÓN` / `NO PROCEDE`. La UI puede decir «Aprobado» solo como etiqueta de `PROCEDE` |
| Categorías transporte, materiales, comunicaciones | `RECEIPT_CATEGORIES` de contracts: combustible, peaje, alimentación, hospedaje, estacionamiento, representación, otro |
| Exception Center con «cédula inválida» | Reglas reales: período del viaje, duplicado, confianza, topes, schema, dígitos |
| FAB «nueva liquidación» como héroe | La cola de trabajo es **excepciones abiertas** |
| Instalar react-native-paper / Reanimated ahora | No. Tokens + componentes actuales. Paper no es el producto |

Sí se adopta la dirección **datos primero** en el escritorio vía **Carbon for IBM Products** (Plex, g10/g90, UI Shell, PageHeader, SidePanel, DataTable). El móvil usa tokens + Expo, sin Carbon. IA transparente sin chatbot, offline como estado normal.

## Principios

1. **El dato es el protagonista.** Si un píxel no ayuda a entender, validar o actuar sobre un gasto o una excepción, no existe.
2. **La IA es procesador, no conversador.** Confianza visible; nunca un check verde genérico cuando el DTO dice `media` o `baja`.
3. **Offline es normal.** No hay banner «sin conexión» mientras la app funciona local.
4. **Acción por contexto.** El celular captura; el escritorio decide. El rol aprobador es futuro, no tab actual.
5. **Color con propósito.** Marca, 7 categorías de contracts, 3 bandas de confianza, 3 veredictos. Nada de glassmorphism, gradientes de fondo ni glow.

## Tokens

Paquete `@viaticocero/ui-tokens`: hex light/dark, spacing 4 px, radius, fechas `09 Sep 2026`, labels de categoría, mapeo `alta|media|baja` → banda visual (no se inventa un 67 % si el contrato no lo trae).

- Escritorio: `@carbon/react` + `@carbon/ibm-products` + IBM Plex. Tema `g10` / `g90` / `auto`.
- Móvil: `apps/mobile/src/theme.ts` lee hex de `ui-tokens` vía `useColorScheme`.
- Tipografía desktop: IBM Plex Sans + Plex Mono tabular. Móvil: system + `fontVariant: tabular-nums`.
- Confianza: barra + etiqueta **Alta / Media / Baja**. El DTO no trae porcentaje de modelo; no se finge.

## Navegación real

**Desktop (sidebar, data-heavy):** Excepciones (default) → Viajes → Comprobantes → Inbox → Liquidación → Exportar → Ajustes.

**Móvil (stack de captura):** Inicio → Capturar → Revisar gasto → Emparejar. No se añaden tabs Liquidar/Perfil: contradicen ADR 0011.

## AI UX (obligatorio)

Usar: «Confianza de lectura: Media», chip de categoría con fuente IA, «Sugerencia automática».  
No usar: chatbot, «IA mágica», «✓ Verificado» con confianza media, spinners infinitos cuando hay etapa conocida.

Cuando VisionPsy se cablee, el progress bar determinate (analizando → extrayendo → clasificando) reemplaza al DTO manual. Hasta entonces la captura muestra campos editables y la banda de confianza del DTO.

## Accesibilidad y motion

WCAG 2.1 AA: contraste de tokens, color nunca como único indicador (icono o texto), targets ≥ 44 px, `prefers-reduced-motion` anula transiciones en CSS. Labels de screen reader en veredictos, confianza y capturar.

## Inventario ya en código

| Superficie | Qué hay |
| --- | --- |
| Tokens | `packages/ui-tokens` (fechas, categorías, confianza; color sobre todo para móvil) |
| Desktop | Carbon UI Shell, IBM Products PageHeader / SidePanel / EmptyState / OptionsTile |
| Móvil | theme hook, chips de categoría con color, preview con banda de confianza |

No instalar ahora: react-native-paper, Reanimated, Storybook. Eso es fase posterior (cámara guía, processing state, ExceptionCard dedicado).

## Anti-patrones (producto)

- Dashboard de 15 KPIs para el empleado
- Chatbot de IA
- Glassmorphism / gradientes / neon
- Inventar un kit visual paralelo en desktop (Carbon ya es el sistema)
- Template de Paper en el móvil
- Banner «sin conexión» en un flujo que ya es local
- Tres tabs de liquidación en el teléfono
