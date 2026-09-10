# ViáticoCero

Monorepo *local-first* para viáticos: el celular captura y lee el comprobante; el escritorio razona, muestra el expediente y exporta.

Este repositorio, ahora mismo, es **solo scaffold**: carpetas hexagonales (`.gitkeep`) y la justificación en [`Docs/`](./Docs/README.md). No hay `package.json` todavía; los workspaces se declaran cuando exista código.

## Dos apps, un hexágono

| App | Dónde | Qué hace |
| --- | --- | --- |
| `apps/mobile` | Android (Expo) | Cámara + **VisionPsy Nano** + envío del DTO |
| `apps/desktop` | Electron | **App de producto**: LLM pesado, inbox, guardar, PDF/CSV/XLSX/JSON, provider P2P |

`packages/core` no conoce Expo, Electron ni `@qvac/sdk`. `packages/contracts` es el handshake teléfono ↔ escritorio.

## Stack (fijo)

- TypeScript, `@qvac/sdk@0.18.2`
- Móvil: Expo ≥ 54 + VisionPsy Nano (local)
- Escritorio: electron-vite (React) + LLM pesado (local) + Bare worker
- Transporte: DTO hacia el inbox del desktop (P2P QVAC opcional para el LLM)

## Cómo se trabaja

Un clone. Cambias el paquete que toca (core, contracts, móvil o desktop). Las reglas para el Agent están en skills de Cursor: `.cursor/skills/` y `apps/*/.cursor/skills/`. Guía humana: [`Docs/06-como-trabajar-monorepo.md`](./Docs/06-como-trabajar-monorepo.md).

## Mapa rápido

```
packages/core         hexágono
packages/contracts    DTO visión → job de análisis → formatos de export
apps/desktop          UI + LLM + export + provider
apps/mobile           captura + VisionPsy
Docs/                 decisiones
.cursor/skills        QVAC, IA local, monorepo, inferencia delegada
apps/*/.cursor/skills Electron / Android / Metro
```
