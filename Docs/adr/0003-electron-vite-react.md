# ADR 0003 — Electron + React + Vite como **app** de escritorio

## Estado

Aceptada (enmendada: la app vive en `apps/desktop`).

## Contexto

QVAC documenta electron-vite `react-ts` + QVAC en main + Forge. El escritorio no es un provider headless: el usuario ve resultados y exporta.

## Decisión

- Paquete `apps/desktop` con `src/main`, `src/preload`, `src/renderer` (tutorial, `cwd` = esa app).
- UI = React (inbox, detalle, guardar, formatos).
- Build = electron-vite; package = Forge + `QvacForgePlugin`; `dist/main|preload|renderer`.
- Main hospeda el LLM pesado, persistencia, exporters y `startQVACProvider`.

## Consecuencias

- El renderer nunca carga `@qvac/sdk`.
- `asar: false`; no universal macOS; Linux `no-sandbox`.
- Electron **no** se elimina al nacer el móvil: es el sistema de registro.
