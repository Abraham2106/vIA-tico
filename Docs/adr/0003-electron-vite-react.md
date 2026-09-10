# ADR 0003 — Electron + React + Vite (electron-vite)

## Estado

Aceptada.

## Contexto

QVAC documenta un único happy path de escritorio: `npm create @quick-start/electron@latest -- --template react-ts`, Tailwind opcional, QVAC en main, Forge para distribuir.

## Decisión

Respetar `src/main`, `src/preload`, `src/renderer`. UI = React. Build = Vite vía electron-vite. Package = Electron Forge + `QvacForgePlugin`. Salida de Vite en `dist/main|preload|renderer`.

## Consecuencias

- El renderer nunca carga `@qvac/sdk`.
- `asar: false` y no hay build universal macOS.
- Linux requiere `no-sandbox` en dev.
