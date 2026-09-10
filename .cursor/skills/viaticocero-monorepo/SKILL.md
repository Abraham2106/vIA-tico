---
name: viaticocero-monorepo
description: >
  Cómo trabajar en el monorepo ViáticoCero (apps/desktop, apps/mobile,
  packages/core, packages/contracts). Úsala al crear archivos, mover código,
  elegir en qué paquete implementar, o cuando el usuario hable de workspaces,
  monorepo, “dónde va esto” o PRs que cruzan celular y escritorio.
---

# Trabajar en el monorepo ViáticoCero

Un Git, **cuatro paquetes**. Dos artefactos de usuario (APK + app Electron). El hexágono vive en `packages/core`.

## Mapa

| Ruta | Tocas cuando… |
| --- | --- |
| `packages/core` | Regla de negocio: viaje, recibo, política, liquidación, casos de uso, puertos |
| `packages/contracts` | JSON/DTO teléfono ↔ PC (`vision-result`, `analysis-job`, `pairing`, `export-formats`) |
| `apps/mobile` | Cámara, VisionPsy, Expo, Metro, Android, pantallas capture/preview/pairing |
| `apps/desktop` | Inbox, LLM pesado, guardar, PDF/CSV/XLSX/JSON, Electron, Vite, Forge |
| `tests/unit` | Dominio sin GPU ni GGUF |
| `Docs/` | Decisiones; no implementes en contra de un ADR sin enmendarlo |

## Reglas

1. **No revivas `src/` en la raíz.** Eso era el scaffold de una sola app (PR #1). Murió en el PR #2.
2. **No mezcles toolchains.** Metro/Expo solo en `apps/mobile`. electron-vite/Forge solo en `apps/desktop`. **No Flutter.** `packages/core` no importa `expo`, `react-native`, `electron`, `react`, `@qvac/sdk`.
3. **No compartas componentes UI** entre RN y React DOM. Sí tipos (`contracts`) y dominio (`core`).
4. **Cambio de DTO = un PR que toca contracts + las dos apps** si hace falta. No “lo arreglo luego en el otro repo”.
5. **Workspaces aún no existen** (no hay `package.json`). Cuando se añadan: npm o pnpm workspaces en la raíz, un manifiesto por app/paquete. No inventes un mega-`package.json` único.
6. **Workers QVAC separados:** `apps/desktop/qvac/` y `apps/mobile/qvac/` + `config/qvac` por app.
7. Implementación nueva: **puerto en core → adaptador en la app que tiene el runtime**. VisionPsy no va en desktop. LLM pesado no va en móvil. Exporters no van en móvil.

## Cómo arrancar un cambio

1. Lee `Docs/README.md` y el ADR relevante (`0006` monorepo, `0007` dos apps, `0008` DTO).
2. Pregúntate: ¿es dominio, contrato o delivery? Solo entonces crea archivos.
3. Si el usuario pide “la app”, aclara **cuál** (móvil vs desktop) o toca el flujo entero vía contracts.

## Skills hermanas

- QVAC: `qvac-sdk`
- Privacidad / on-device: `local-ai`
- P2P vs DTO: `delegated-inference`
- Desktop (scoped): `electron-qvac` bajo `apps/desktop`
- Móvil (scoped): `android-sdk`, `metro-expo` bajo `apps/mobile`
