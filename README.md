# ViáticoCero

App de escritorio *local-first* para viáticos. El comprobante se interpreta en el dispositivo con **Tether QVAC 0.18.2** y **VisionPsy Nano**; el dominio no habla con Electron ni con el SDK.

Este repositorio, ahora mismo, es **solo scaffold**: carpetas de arquitectura hexagonal (`.gitkeep`) y la justificación en [`Docs/`](./Docs/README.md).

## Stack (fijo)

- TypeScript
- `@qvac/sdk@0.18.2` + VisionPsy Nano
- Bare (worker QVAC / `@qvac/inference`)
- Electron + React + Vite (`electron-vite`)

## Mapa rápido

```
src/core          hexágono (dominio + casos de uso + puertos)
src/adapters      QVAC, FS, IPC, puente al renderer
src/composition   cableado Electron vs Bare
src/main|preload|renderer   delivery electron-vite
Docs/             decisiones y referencias
```
