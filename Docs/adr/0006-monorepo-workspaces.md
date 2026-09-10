# ADR 0006 — Monorepo `apps/` + `packages/`

## Estado

Aceptada.

## Contexto

Hace falta Android (Expo) y escritorio (electron-vite) con el mismo dominio y el mismo pin `@qvac/sdk@0.18.2`. Un solo `package.json` mezcla Metro y Vite, RN y `react-dom`, `expo-plugin` y `QvacForgePlugin`. Dos repos duplicarían contratos y versiones.

## Decisión

Monorepo:

- `packages/core` — hexágono
- `packages/contracts` — DTOs teléfono ↔ desktop
- `apps/desktop` — Electron producto
- `apps/mobile` — Expo Android

Workspaces npm/pnpm cuando existan manifiestos. Este PR solo reserva carpetas.

## Consecuencias

- Dos `qvac.config` / dos workers.
- CI por app (device Android vs host desktop).
- No se comparten componentes UI entre RN y React DOM.
