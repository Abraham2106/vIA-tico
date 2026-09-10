---
name: viaticocero-monorepo
description: >
  Cómo trabajar en el monorepo ViáticoCero (apps/desktop, apps/mobile,
  packages/core, packages/contracts, packages/ui-tokens). Úsala al crear archivos, mover código,
  elegir en qué paquete implementar, o cuando el usuario hable de workspaces,
  monorepo, “dónde va esto” o PRs que cruzan celular y escritorio.
---

# Trabajar en el monorepo ViáticoCero

Un Git, **cinco paquetes**. Dos artefactos de usuario (APK + app Electron). El hexágono no se copia.

## Mapa

| Ruta | Tocas cuando… |
| --- | --- |
| `packages/core` | Veredicto: viaje, recibo, motivo, política, excepciones, conciliación, auditoría |
| `packages/contracts` | `vision-result`, `motive-classification` (sin veredicto), `verdict`, `audit-event`, `analysis-job`, `pairing`, `export-formats` |
| `packages/ui-tokens` | Fechas, categorías, confianza. Color para **móvil**. Desktop usa Carbon (ADR 0014). **No** componentes React compartidos |
| `apps/mobile` | Cámara, motivo libre, VisionPsy, Expo |
| `apps/desktop` | Excepciones, conciliación, auditoría, Qwen (postproceso + classify-motive), export |
| `tests/unit` | Veredictos sin GPU |
| `Docs/` | Empieza por `00-producto.md` (**tesis** excepciones documentales + **cuña** viáticos) y ADR 0013 / 0014 |

## Reglas

1. **No revivas `src/` en la raíz.** Eso era el scaffold de una sola app (PR #1). Murió en el PR #2.
2. **No mezcles toolchains.** Metro/Expo solo en `apps/mobile`. electron-vite/Forge solo en `apps/desktop`. **No Flutter.** `packages/core` no importa `expo`, `react-native`, `electron`, `react`, `@qvac/sdk`.
3. **No compartas componentes UI** entre RN y React DOM. Sí tipos (`contracts`), dominio (`core`) y tokens (`ui-tokens`).
4. **Cambio de DTO = un PR que toca contracts + las dos apps** si hace falta. No “lo arreglo luego en el otro repo”.
5. **Workspaces npm** en la raíz (`packages/*` + `apps/*`). Un manifiesto por paquete. No un mega-`package.json` de app.
6. **Workers QVAC separados:** `apps/desktop/qvac/` y `apps/mobile/qvac/` + `config/qvac` por app.
7. Implementación nueva: **puerto en core → adaptador en la app**. VisionPsy no va en desktop. Instruct no va en móvil. `contracts/verdict` no lo escribe el adaptador QVAC. `classify-motive` no incluye campo `veredicto`. Sin carpetas de etapa 2–3 (ERP, matching OC).

## Cómo arrancar un cambio

1. Lee `Docs/00-producto.md` (tesis vs cuña) y el ADR (`0013` scaffold, `0010` autoridad, `0011` excepciones, `0014` UI).
2. Pregúntate: ¿es dominio, contrato o delivery? Solo entonces crea archivos.
3. Si el usuario pide “la app”, aclara **cuál** (móvil vs desktop) o toca el flujo entero vía contracts.

## Skills hermanas

- QVAC: `qvac-sdk`
- Privacidad / on-device: `local-ai`
- P2P vs DTO: `delegated-inference`
- Desktop (scoped): `electron-qvac` bajo `apps/desktop`
- Móvil (scoped): `android-sdk`, `metro-expo` bajo `apps/mobile`
