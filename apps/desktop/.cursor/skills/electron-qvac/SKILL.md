---
name: electron-qvac
description: >
  App Electron de ViáticoCero: electron-vite, main/preload/renderer, QVAC en
  main, inbox, exporters, Forge, asar false. Úsala al editar apps/desktop,
  IPC, React del renderer, empaquetado, excepciones o Qwen Instruct en escritorio.
---

# Electron (apps/desktop) — app de producto

No es un daemon ni un chat del LLM. El usuario **ve excepciones**, **liquida** y **exporta**. El veredicto sale de `packages/core`.

## Layout (tutorial QVAC, cwd = esta app)

```
apps/desktop/src/main
apps/desktop/src/preload
apps/desktop/src/renderer/src   # React + Vite — SIN @qvac/sdk
```

Features UI: `exceptions` (primaria), `inbox`, `receipts`, `trips`, `settlements`, `export`.

## Proceso main

- Composition root (`composition/electron`).
- Adaptadores: `qvac-llm`, `qvac-provider`, `persistence`, `filesystem`, `exporters/{pdf,csv,xlsx,json}`.
- IPC (`adapters/driving/ipc`) → casos de uso de `packages/core`.
- Linux: `app.commandLine.appendSwitch('no-sandbox')` / `electron-vite dev -- --no-sandbox`.

## Renderer

- Solo UI. Habla por preload/`contextBridge` (superficie estrecha, `renderer-bridge`).
- Strict Mode: el tutorial QVAC lo quita para no doble-cargar modelos en `useEffect`. Respeta eso cuando wires `loadModel`.

## Empaquetado

- `QvacForgePlugin` (`@qvac/sdk/electron-forge`).
- `asar: false` (Bare no carga addons desde `app.asar`).
- `build.outDir`: `dist/main|preload|renderer` (no chocques con `out/` de Forge).
- No builds universal macOS.
- Worker: `apps/desktop/qvac/`.

## Dependencias

QVAC, `electron`, Vite, Forge: **este paquete**. No las subas a `packages/core`. React del desktop ≠ React Native del móvil.

Docs: [Build an Electron app](https://docs.qvac.tether.io/tutorials/electron/).
